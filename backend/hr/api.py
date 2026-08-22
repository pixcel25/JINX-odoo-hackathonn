from datetime import date, datetime, time
from decimal import Decimal, InvalidOperation
import json

from django.contrib.auth.hashers import check_password, make_password
from django.core import signing
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import Attendance, AuditNotification, LeaveRequest, PayrollDetails, User, UserProfile


TOKEN_SALT = 'dayflow-hr-api-v1'
TOKEN_MAX_AGE = 60 * 60 * 24 * 7
ROLE_MANAGER = {'admin', 'hr'}
STATUS_LABELS = {
    'present': 'Present',
    'absent': 'Absent',
    'late': 'Late',
    'half_day': 'Half day',
    'on_leave': 'On Leave',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'cancelled': 'Cancelled',
}
LEAVE_ALLOCATIONS = {'annual': 24, 'sick': 7, 'casual': 5, 'unpaid': 0, 'other': 0}


def error(message, status=400):
    return JsonResponse({'error': message}, status=status)


def request_data(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return None
    return data if isinstance(data, dict) else None


def issue_token(user):
    return signing.dumps({'user_id': user.pk}, salt=TOKEN_SALT)


def token_user(request):
    authorization = request.headers.get('Authorization', '')
    if not authorization.startswith('Bearer '):
        return None

    try:
        payload = signing.loads(
            authorization.removeprefix('Bearer ').strip(),
            salt=TOKEN_SALT,
            max_age=TOKEN_MAX_AGE,
        )
        return User.objects.get(pk=int(payload['user_id']))
    except (KeyError, TypeError, ValueError, signing.BadSignature, User.DoesNotExist):
        return None


def current_identity(request):
    hr_user = token_user(request)
    if hr_user:
        return hr_user, hr_user.role

    django_user = getattr(request, 'user', None)
    if django_user is not None and django_user.is_authenticated:
        linked_user = User.objects.filter(email__iexact=django_user.email).first()
        if linked_user:
            return linked_user, linked_user.role
        return django_user, 'admin' if django_user.is_staff else 'employee'

    return None, None


def hr_actor(request):
    actor, role = current_identity(request)
    if isinstance(actor, User):
        return actor, None
    if actor is None:
        return None, error('Authentication required.', 401)
    return None, error('An employee account is required.', 401)


def manager_actor(request):
    actor, role = current_identity(request)
    if actor is None:
        return None, error('Authentication required.', 401)
    if role not in ROLE_MANAGER:
        return None, error('Admin or HR access required.', 403)
    return actor, None


def profile_for(user):
    profile, _ = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            'first_name': user.email.split('@')[0],
            'last_name': '',
            'department': 'General',
            'company': '',
        },
    )
    return profile


def split_name(name):
    parts = [part for part in name.strip().split() if part]
    if not parts:
        return '', ''
    return parts[0], ' '.join(parts[1:])


def display_name(user, profile=None):
    profile = profile or profile_for(user)
    name = ' '.join(part for part in (profile.first_name, profile.last_name) if part).strip()
    return name or user.email


def status_label(status):
    return STATUS_LABELS.get(status, status.replace('_', ' ').title())


def display_time(value):
    if not value:
        return ''
    return timezone.localtime(value).strftime('%I:%M %p').lstrip('0')


def display_date(value):
    return value.strftime('%d %b %Y') if value else ''


def duration_text(check_in, check_out):
    if not check_in:
        return '0h 00m'
    end = check_out or timezone.now()
    total_seconds = max(0, int((end - check_in).total_seconds()))
    hours, remainder = divmod(total_seconds, 3600)
    minutes = remainder // 60
    return f'{hours}h {minutes:02d}m'


def decimal_value(value, default=Decimal('0')):
    if value is None or value == '':
        return default
    if isinstance(value, Decimal):
        return value
    try:
        cleaned = str(value).replace('$', '').replace(',', '').strip()
        return Decimal(cleaned)
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError('Enter valid salary amounts.')


def money(value):
    return f'${Decimal(value):,.2f}'


def payroll_payload(user, payroll=None):
    payroll = payroll or PayrollDetails.objects.filter(user=user).first()
    if payroll is None:
        base_salary = allowances = deductions = net_salary = Decimal('0')
        pay_grade = ''
        payroll_id = None
    else:
        base_salary = payroll.base_salary
        allowances = payroll.allowances
        deductions = payroll.deductions
        net_salary = payroll.net_salary
        pay_grade = payroll.pay_grade
        payroll_id = payroll.pk

    return {
        'id': str(payroll_id) if payroll_id else None,
        'userId': str(user.pk),
        'payGrade': pay_grade,
        'baseSalary': money(base_salary),
        'allowances': money(allowances),
        'taxDeduction': money(deductions),
        'baseSalaryValue': str(base_salary),
        'allowancesValue': str(allowances),
        'deductionsValue': str(deductions),
        'netSalaryValue': str(net_salary),
        'monthWage': str(net_salary),
        'yearlyWage': str(net_salary * 12),
    }


def attendance_payload(record):
    user = record.user
    return {
        'id': str(record.pk),
        'userId': str(user.pk),
        'employeeId': user.employee_id,
        'employeeName': display_name(user),
        'date': record.check_in.date().isoformat(),
        'dateLabel': display_date(record.check_in.date()),
        'checkIn': display_time(record.check_in),
        'checkOut': display_time(record.check_out),
        'checkInAt': record.check_in.isoformat(),
        'checkOutAt': record.check_out.isoformat() if record.check_out else None,
        'duration': duration_text(record.check_in, record.check_out),
        'status': record.status,
        'statusLabel': status_label(record.status),
    }


def leave_payload(request):
    days = (request.end_date - request.start_date).days + 1
    return {
        'id': str(request.pk),
        'userId': str(request.user.pk),
        'employeeId': request.user.employee_id,
        'employeeName': display_name(request.user),
        'email': request.user.email,
        'leaveType': request.leave_type,
        'timeOffType': status_label(request.leave_type),
        'startDate': request.start_date.isoformat(),
        'endDate': request.end_date.isoformat(),
        'days': days,
        'allocationDays': days,
        'reason': request.reason,
        'reviewerComment': request.reviewer_comment,
        'status': request.status,
        'statusLabel': status_label(request.status),
    }


def leave_balances(user):
    approved = LeaveRequest.objects.filter(user=user, status='approved')
    used = {leave_type: 0 for leave_type in LEAVE_ALLOCATIONS}
    for request in approved:
        used[request.leave_type] = used.get(request.leave_type, 0) + (request.end_date - request.start_date).days + 1
    return {
        'paid': max(0, LEAVE_ALLOCATIONS['annual'] - used.get('annual', 0)),
        'sick': max(0, LEAVE_ALLOCATIONS['sick'] - used.get('sick', 0)),
        'casual': max(0, LEAVE_ALLOCATIONS['casual'] - used.get('casual', 0)),
        'unpaid': 0,
    }


def employee_payload(user):
    profile = profile_for(user)
    attendance = list(Attendance.objects.filter(user=user).order_by('-check_in')[:31])
    today = timezone.localdate()
    today_record = next((record for record in attendance if timezone.localtime(record.check_in).date() == today), None)
    leaves = list(LeaveRequest.objects.filter(user=user).order_by('-start_date', '-id'))
    name = display_name(user, profile)
    initials = ''.join(part[0] for part in name.split() if part)[:2].upper()
    current_status = status_label(today_record.status) if today_record else 'Absent'

    return {
        'id': str(user.pk),
        'userId': str(user.pk),
        'name': name,
        'displayName': name,
        'title': profile.title or 'Employee',
        'empId': user.employee_id,
        'employeeId': user.employee_id,
        'loginId': user.employee_id,
        'dept': profile.department or 'General',
        'status': current_status,
        'email': user.email,
        'phone': profile.phone,
        'company': profile.company,
        'manager': profile.manager,
        'location': profile.location,
        'about': '',
        'jobLove': '',
        'hobbies': '',
        'skills': [],
        'certifications': [],
        'avatarUrl': profile.avatar_url or None,
        'initials': initials,
        'paidLeaveAvailable': leave_balances(user)['paid'],
        'sickLeaveAvailable': leave_balances(user)['sick'],
        'casualLeaveAvailable': leave_balances(user)['casual'],
        'checkIn': display_time(today_record.check_in) if today_record else '',
        'checkOut': display_time(today_record.check_out) if today_record else '',
        'workHours': duration_text(today_record.check_in, today_record.check_out) if today_record else '0h 00m',
        'attendanceHistory': [
            {
                'date': display_date(record.check_in.date()),
                'status': status_label(record.status),
                'checkIn': display_time(record.check_in) or '-:-',
                'checkOut': display_time(record.check_out) or '-:-',
                'workHours': duration_text(record.check_in, record.check_out),
            }
            for record in attendance
        ],
        'leaveHistory': [
            {
                'id': str(request.pk),
                'leaveType': status_label(request.leave_type),
                'startDate': request.start_date.strftime('%d/%m/%Y'),
                'endDate': request.end_date.strftime('%d/%m/%Y'),
                'days': (request.end_date - request.start_date).days + 1,
                'reason': request.reason,
                'status': 'Refused' if request.status == 'rejected' else status_label(request.status),
            }
            for request in leaves
        ],
        'salary': payroll_payload(user),
    }


def parse_iso_date(value):
    try:
        return date.fromisoformat(str(value))
    except (TypeError, ValueError):
        raise ValueError('Use dates in YYYY-MM-DD format.')


@csrf_exempt
@require_POST
def employee_login_view(request):
    data = request_data(request)
    if not data:
        return error('Enter your employee ID or email and password.')

    login_id = data.get('loginId', data.get('email', ''))
    password = data.get('password', '')
    if not isinstance(login_id, str) or not isinstance(password, str) or not login_id.strip() or not password:
        return error('Enter your employee ID or email and password.')

    user = User.objects.filter(Q(employee_id__iexact=login_id.strip()) | Q(email__iexact=login_id.strip())).first()
    if user is None or not check_password(password, user.password_hash):
        return error('That employee ID or password is not correct.', 401)

    payload = employee_payload(user)
    payload['token'] = issue_token(user)
    payload['role'] = user.role
    return JsonResponse(payload)


@csrf_exempt
@require_POST
def employee_password_change_view(request):
    data = request_data(request)
    if not data:
        return error('Enter your current and new password.')

    login_id = data.get('loginId', '')
    current_password = data.get('currentPassword', '')
    new_password = data.get('newPassword', '')
    if not all(isinstance(value, str) and value for value in (login_id, current_password, new_password)):
        return error('Enter your current and new password.')
    user = User.objects.filter(Q(employee_id__iexact=login_id.strip()) | Q(email__iexact=login_id.strip())).first()
    if user is None or not check_password(current_password, user.password_hash):
        return error('The current password is not correct.', 401)
    if len(new_password) < 8:
        return error('The new password must be at least 8 characters.')
    user.password_hash = make_password(new_password)
    user.save(update_fields=['password_hash'])
    return JsonResponse({'message': 'Password changed successfully.'})


@require_GET
def me_view(request):
    actor, role = current_identity(request)
    if isinstance(actor, User):
        payload = employee_payload(actor)
        payload['role'] = role
        return JsonResponse(payload)
    if actor is not None:
        return JsonResponse({'id': actor.id, 'email': actor.email, 'role': role})
    return error('Authentication required.', 401)


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def employees_view(request):
    actor, auth_error = manager_actor(request)
    if auth_error:
        return auth_error

    if request.method == 'GET':
        users = User.objects.exclude(role='admin').order_by('id')
        employees = [employee_payload(user) for user in users]
        departments = sorted({employee['dept'] for employee in employees if employee['dept']})
        return JsonResponse({'employees': employees, 'departments': departments})

    data = request_data(request)
    if not data:
        return error('Enter valid employee details.')
    name = data.get('name', '')
    email = data.get('email', '')
    password = data.get('password', '')
    phone = data.get('phone', '')
    if not all(isinstance(value, str) for value in (name, email, password, phone)):
        return error('Enter valid employee details.')
    if not name.strip() or not phone.strip():
        return error('Name and phone are required.')
    try:
        validate_email(email)
        if len(password) < 8:
            raise ValidationError('Password must be at least 8 characters.')
    except ValidationError as exc:
        return error(exc.messages[0])
    if User.objects.filter(email__iexact=email.strip()).exists():
        return error('An employee with this email already exists.')

    first_name, last_name = split_name(name)
    requested_id = data.get('employeeId') or data.get('empId')
    if not isinstance(requested_id, str) or not requested_id.strip():
        requested_id = f'EMP-{timezone.localdate().year}-{User.objects.count() + 1:04d}'
    requested_id = requested_id.strip().upper()
    if User.objects.filter(employee_id=requested_id).exists():
        return error('That employee ID is already in use.')

    try:
        with transaction.atomic():
            user = User.objects.create(
                employee_id=requested_id,
                email=email.strip().lower(),
                password_hash=make_password(password),
                role='employee',
            )
            UserProfile.objects.create(
                user=user,
                first_name=first_name,
                last_name=last_name,
                title=str(data.get('title', '')).strip(),
                department=str(data.get('department', data.get('dept', 'General'))).strip(),
                company=str(data.get('company', '')).strip(),
                manager=str(data.get('manager', '')).strip(),
                location=str(data.get('location', '')).strip(),
                phone=phone.strip(),
                address=str(data.get('address', '')).strip(),
                avatar_url=str(data.get('avatarUrl', '')).strip(),
            )
            PayrollDetails.objects.create(user=user)
    except IntegrityError:
        return error('The employee could not be created because the ID or email is already in use.')

    return JsonResponse(employee_payload(user), status=201)


@require_GET
def attendance_view(request):
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)

    if isinstance(actor, User) and role in ROLE_MANAGER:
        user_id = request.GET.get('userId')
        target = User.objects.filter(pk=user_id).first() if user_id else None
        query = Attendance.objects.select_related('user').order_by('-check_in')
        if target:
            query = query.filter(user=target)
    elif isinstance(actor, User):
        target = actor
        query = Attendance.objects.select_related('user').filter(user=target).order_by('-check_in')
    else:
        return error('An employee account is required.', 401)

    try:
        if request.GET.get('from'):
            query = query.filter(check_in__date__gte=parse_iso_date(request.GET['from']))
        if request.GET.get('to'):
            query = query.filter(check_in__date__lte=parse_iso_date(request.GET['to']))
    except ValueError as exc:
        return error(str(exc))

    records = list(query[:200])
    counts = {status: 0 for status in ('present', 'late', 'half_day', 'on_leave', 'absent')}
    for record in records:
        counts[record.status] = counts.get(record.status, 0) + 1
    return JsonResponse({
        'records': [attendance_payload(record) for record in records],
        'summary': counts,
    })


@csrf_exempt
@require_POST
def check_in_view(request):
    user, auth_error = hr_actor(request)
    if auth_error:
        return auth_error

    today = timezone.localdate()
    if Attendance.objects.filter(user=user, check_in__date=today).exists():
        return error('Attendance has already been registered for today.', 409)

    now = timezone.now()
    local_time = timezone.localtime(now).time()
    status = 'late' if local_time > time(9, 30) else 'present'
    record = Attendance.objects.create(user=user, check_in=now, status=status)
    AuditNotification.objects.create(user=user, message='Attendance check-in recorded.')
    return JsonResponse({'record': attendance_payload(record)}, status=201)


@csrf_exempt
@require_POST
def check_out_view(request):
    user, auth_error = hr_actor(request)
    if auth_error:
        return auth_error

    record = Attendance.objects.filter(user=user, check_in__date=timezone.localdate(), check_out__isnull=True).order_by('-check_in').first()
    if record is None:
        return error('There is no open attendance record for today.')
    record.check_out = timezone.now()
    record.save(update_fields=['check_out'])
    AuditNotification.objects.create(user=user, message='Attendance check-out recorded.')
    return JsonResponse({'record': attendance_payload(record)})


@csrf_exempt
@require_http_methods(['GET', 'POST'])
def leave_requests_view(request):
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)
    if not isinstance(actor, User):
        return error('An employee account is required.', 401)

    if request.method == 'GET':
        query = LeaveRequest.objects.select_related('user').order_by('-start_date', '-id')
        if role not in ROLE_MANAGER:
            query = query.filter(user=actor)
        return JsonResponse({'requests': [leave_payload(item) for item in query[:200]]})

    data = request_data(request)
    if not data:
        return error('Enter valid leave request details.')
    leave_type = str(data.get('leaveType', data.get('timeOffType', ''))).lower().replace(' ', '_')
    leave_type = {'paid': 'annual', 'paid_time_off': 'annual', 'sick_time_off': 'sick', 'casual_leave': 'casual'}.get(leave_type, leave_type)
    if leave_type not in {'annual', 'sick', 'casual', 'unpaid', 'other'}:
        return error('Choose a valid leave type.')
    try:
        start_date = parse_iso_date(data.get('startDate'))
        end_date = parse_iso_date(data.get('endDate'))
    except ValueError as exc:
        return error(str(exc))
    if end_date < start_date:
        return error('End date must be on or after the start date.')
    overlapping = LeaveRequest.objects.filter(
        user=actor,
        start_date__lte=end_date,
        end_date__gte=start_date,
        status__in=['pending', 'approved'],
    ).exists()
    if overlapping:
        return error('You already have a leave request covering these dates.')

    request_item = LeaveRequest.objects.create(
        user=actor,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        reason=str(data.get('reason', data.get('remarks', ''))).strip(),
    )
    AuditNotification.objects.create(user=actor, message='A new leave request was submitted for review.')
    return JsonResponse({'request': leave_payload(request_item)}, status=201)


@csrf_exempt
@require_http_methods(['GET', 'PATCH'])
def leave_request_detail_view(request, request_id):
    item = LeaveRequest.objects.select_related('user').filter(pk=request_id).first()
    if item is None:
        return error('Leave request not found.', 404)

    if request.method == 'GET':
        actor, role = current_identity(request)
        if actor is None:
            return error('Authentication required.', 401)
        if isinstance(actor, User) and role not in ROLE_MANAGER and item.user_id != actor.pk:
            return error('You can only view your own leave requests.', 403)
        return JsonResponse({'request': leave_payload(item)})

    actor, auth_error = manager_actor(request)
    if auth_error:
        return auth_error
    data = request_data(request)
    if not data:
        return error('Enter a valid leave decision.')
    status = str(data.get('status', '')).lower()
    if status not in {'pending', 'approved', 'rejected', 'cancelled'}:
        return error('Choose Pending, Approved, Rejected, or Cancelled.')
    item.status = status
    item.reviewer_comment = str(data.get('reviewerComment', data.get('comment', item.reviewer_comment))).strip()
    item.save(update_fields=['status', 'reviewer_comment'])
    AuditNotification.objects.create(
        user=item.user,
        message=f'Your leave request was {status}.' if status != 'pending' else 'Your leave request is pending review.',
    )
    return JsonResponse({'request': leave_payload(item)})


@require_GET
def payroll_view(request):
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)
    if not isinstance(actor, User):
        return error('An employee account is required.', 401)

    if role in ROLE_MANAGER:
        user_id = request.GET.get('userId')
        users = User.objects.filter(pk=user_id) if user_id else User.objects.all().order_by('id')
    else:
        users = User.objects.filter(pk=actor.pk)
    return JsonResponse({'payroll': [payroll_payload(user) for user in users]})


@csrf_exempt
@require_http_methods(['GET', 'PATCH'])
def payroll_detail_view(request, user_id):
    target = User.objects.filter(pk=user_id).first()
    if target is None:
        return error('Employee not found.', 404)
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)
    if request.method == 'GET' and (role in ROLE_MANAGER or (isinstance(actor, User) and actor.pk == target.pk)):
        return JsonResponse({'payroll': payroll_payload(target)})
    if request.method == 'GET':
        return error('You can only view your own payroll.', 403)
    if role not in ROLE_MANAGER:
        return error('Admin or HR access required.', 403)

    data = request_data(request)
    if not data:
        return error('Enter a valid salary structure.')
    try:
        base_salary = decimal_value(data.get('baseSalaryValue', data.get('baseSalary')))
        allowances = decimal_value(data.get('allowancesValue', data.get('allowances')))
        deductions = decimal_value(data.get('deductionsValue', data.get('taxDeduction')))
    except ValueError as exc:
        return error(str(exc))
    payroll, _ = PayrollDetails.objects.get_or_create(user=target)
    payroll.pay_grade = str(data.get('payGrade', payroll.pay_grade)).strip()
    payroll.base_salary = base_salary
    payroll.allowances = allowances
    payroll.deductions = deductions
    payroll.net_salary = base_salary + allowances - deductions
    payroll.save()
    AuditNotification.objects.create(user=target, message='Your salary structure was updated by HR.')
    return JsonResponse({'payroll': payroll_payload(target, payroll)})


@csrf_exempt
@require_http_methods(['GET', 'PATCH'])
def profile_view(request):
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)
    if not isinstance(actor, User):
        return error('An employee account is required.', 401)
    target = actor
    requested_id = request.GET.get('userId')
    if requested_id and role in ROLE_MANAGER:
        target = User.objects.filter(pk=requested_id).first()
        if target is None:
            return error('Employee not found.', 404)
    elif requested_id and str(actor.pk) != requested_id:
        return error('You can only view your own profile.', 403)

    profile = profile_for(target)
    if request.method == 'PATCH':
        data = request_data(request)
        if not data:
            return error('Enter valid profile details.')
        editable = {'phone', 'address', 'avatar_url'}
        if role in ROLE_MANAGER:
            editable.update({'first_name', 'last_name', 'title', 'department', 'company', 'manager', 'location'})
        for field in editable:
            if field in data:
                setattr(profile, field, str(data[field]).strip())
        profile.save()
    return JsonResponse({'profile': {
        'userId': str(target.pk),
        'employeeId': target.employee_id,
        'email': target.email,
        'firstName': profile.first_name,
        'lastName': profile.last_name,
        'name': display_name(target, profile),
        'title': profile.title,
        'department': profile.department,
        'company': profile.company,
        'manager': profile.manager,
        'location': profile.location,
        'phone': profile.phone,
        'address': profile.address,
        'avatarUrl': profile.avatar_url,
    }})


@require_GET
def notifications_view(request):
    actor, role = current_identity(request)
    if actor is None:
        return error('Authentication required.', 401)
    if not isinstance(actor, User):
        return JsonResponse({'notifications': []})
    query = AuditNotification.objects.filter(user=actor).order_by('-created_at')[:50]
    return JsonResponse({'notifications': [
        {
            'id': str(item.pk),
            'message': item.message,
            'isRead': item.is_read,
            'createdAt': item.created_at.isoformat(),
        }
        for item in query
    ]})
