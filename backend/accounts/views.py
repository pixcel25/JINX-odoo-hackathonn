import json
import re

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from .models import Employee

User = get_user_model()


def error(message, status=400):
    return JsonResponse({'error': message}, status=status)


def credentials(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return None
    if not isinstance(data, dict) or not isinstance(data.get('email'), str) or not isinstance(data.get('password'), str):
        return None
    email, password = data['email'].strip().lower(), data['password']
    role = data.get('role', 'admin')
    if role not in ('admin', 'employee'):
        role = 'admin'
    try:
        validate_email(email)
    except ValidationError:
        return None
    if not email or len(password) == 0 or len(email) > 254 or len(password) > 128:
        return None
    return email, password, role


@require_GET
def csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})


@require_POST
def signup_view(request):
    values = credentials(request)
    if not values:
        return error('Enter a valid email and password.')
    email, password, role = values
    if User.objects.filter(username=email).exists():
        return error('An account with this email already exists.')
    is_staff = (role == 'admin')
    user = User(username=email, email=email, is_staff=is_staff)
    try:
        validate_password(password, user)
    except ValidationError as exc:
        return error(exc.messages[0])
    user.set_password(password)
    user.save()
    return JsonResponse({'message': f'Account created for {role}.'}, status=201)


@require_POST
def login_view(request):
    values = credentials(request)
    if not values:
        return error('Enter a valid email and password.')
    email, password, role = values
    user = authenticate(request, username=email, password=password)
    if not user or not user.is_active:
        return error('Invalid credentials.', 401)
    if role == 'admin' and not user.is_staff:
        return error('Admin access required for this portal.', 403)
    login(request, user)
    user_role = 'admin' if user.is_staff else 'employee'
    return JsonResponse({'id': user.id, 'email': user.email, 'role': user_role})


@require_POST
def salary_change_view(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return error('Invalid salary update request.')

    employee_email = data.get('employeeEmail') if isinstance(data, dict) else None
    employee_name = data.get('employeeName') if isinstance(data, dict) else None
    old_salary = data.get('oldSalary') if isinstance(data, dict) else None
    new_salary = data.get('newSalary') if isinstance(data, dict) else None
    if not isinstance(employee_email, str) or not isinstance(employee_name, str):
        return error('Employee details are required.')
    try:
        validate_email(employee_email)
    except ValidationError:
        return error('A valid employee email is required.')
    if not isinstance(old_salary, dict) or not isinstance(new_salary, dict):
        return error('Both old and new salary structures are required.')

    def format_salary(structure):
        return '\n'.join(f'{label}: {structure.get(key, "")}' for key, label in (
            ('payGrade', 'Pay Grade'),
            ('baseSalary', 'Base Salary'),
            ('allowances', 'HRA & Allowances'),
            ('taxDeduction', 'Tax Deduction'),
            ('monthWage', 'Month Wage'),
            ('yearlyWage', 'Yearly Wage'),
            ('workingDays', 'Working Days'),
            ('workingHours', 'Working Hours'),
            ('basicSalary', 'Basic Salary'),
            ('houseRentAllowance', 'House Rent Allowance'),
            ('standardAllowance', 'Standard Allowance'),
            ('performanceBonus', 'Performance Bonus'),
            ('leaveTravelAllowance', 'Leave Travel Allowance'),
            ('fixedAllowance', 'Fixed Allowance'),
            ('providentFundEmployee', 'Employee PF'),
            ('providentFundEmployer', 'Employer PF'),
            ('professionalTax', 'Professional Tax'),
        ))

    message = (
        f'Salary structure update for {employee_name}\n\n'
        f'Previous salary structure:\n{format_salary(old_salary)}\n\n'
        f'New salary structure:\n{format_salary(new_salary)}\n'
    )
    try:
        send_mail(
            subject=f'Salary structure updated - {employee_name}',
            message=message,
            from_email=None,
            recipient_list=[employee_email, 'rylanfranco251006@gmail.com'],
            fail_silently=False,
        )
    except Exception:
        return error('Salary was not saved because the notification email could not be sent.', 502)
    return JsonResponse({'message': 'Salary updated and notification email sent.'})

@csrf_exempt
@require_POST
def employee_login_view(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return error('Enter your employee ID and password.')

    login_id = data.get('loginId', '').strip().upper() if isinstance(data, dict) and isinstance(data.get('loginId'), str) else ''
    password = data.get('password', '') if isinstance(data, dict) else ''
    if not login_id or not isinstance(password, str):
        return error('Enter your employee ID and password.')

    employee = Employee.objects.filter(login_id=login_id).first()
    if not employee or not check_password(password, employee.password_hash):
        return error('That employee ID or password is not correct.', 401)

    return JsonResponse({
        'id': employee.id,
        'employeeId': employee.login_id,
        'displayName': employee.name,
        'name': employee.name,
        'email': employee.email,
        'phone': employee.phone,
        'company': employee.company_name,
        'joinedAt': employee.joined_at.isoformat(),
    })


@csrf_exempt
@require_POST
def employee_password_change_view(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return error('Enter your current and new password.')

    if not isinstance(data, dict):
        return error('Enter your current and new password.')

    login_id = data.get('loginId', '').strip().upper() if isinstance(data.get('loginId'), str) else ''
    current_password = data.get('currentPassword') if isinstance(data.get('currentPassword'), str) else ''
    new_password = data.get('newPassword') if isinstance(data.get('newPassword'), str) else ''
    if not login_id or not current_password or not new_password or len(new_password) > 128:
        return error('Enter your current and new password.')

    employee = Employee.objects.filter(login_id=login_id).first()
    if not employee or not check_password(current_password, employee.password_hash):
        return error('Your current password is not correct.', 401)

    try:
        validate_password(new_password)
    except ValidationError as exc:
        return error(exc.messages[0])

    employee.set_password(new_password)
    employee.save(update_fields=['password_hash'])
    return JsonResponse({'message': 'Password updated successfully.'})


@require_GET
def me_view(request):
    if not request.user.is_authenticated:
        return error('Authentication required.', 401)
    user_role = 'admin' if request.user.is_staff else 'employee'
    return JsonResponse({'id': request.user.id, 'email': request.user.email, 'role': user_role})
def employee_code(value, length):
    letters = re.sub(r'[^A-Za-z]', '', value).upper()
    return letters[:length].ljust(length, 'X')


def company_code(company):
    words = [word for word in re.split(r'\s+', company.strip()) if word]
    if len(words) > 1:
        return ''.join(employee_code(word, 1) for word in words[:2])
    return employee_code(company, 2)


def name_code(name):
    parts = [part for part in re.split(r'\s+', name.strip()) if part]
    if len(parts) > 1:
        return f'{employee_code(parts[0], 2)}{employee_code(parts[-1], 2)}'
    return employee_code(name, 4)


@require_POST
def create_employee_view(request):
    if not request.user.is_authenticated and not settings.DEBUG:
        return error('Authentication required.', 401)
    if request.user.is_authenticated and not request.user.is_staff:
        return error('Admin access required for this portal.', 403)

    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return error('Enter valid employee details.')

    if not isinstance(data, dict):
        return error('Enter valid employee details.')

    company = data.get('company', '').strip()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    phone = data.get('phone', '').strip()
    password = data.get('password', '')

    if not all(isinstance(value, str) for value in (company, name, email, phone, password)):
        return error('Enter valid employee details.')
    if not company or not name or not phone or len(company) > 200 or len(name) > 200 or len(phone) > 30:
        return error('Company, name, and phone are required.')
    try:
        validate_email(email)
        validate_password(password)
    except ValidationError as exc:
        return error(exc.messages[0])
    if Employee.objects.filter(email=email).exists():
        return error('An employee with this email already exists.')

    year = timezone.localdate().year
    company_prefix = company_code(company)
    name_prefix = name_code(name)

    with transaction.atomic():
        sequence = Employee.objects.filter(joined_at__year=year).count() + 1
        employee = Employee(
            company_name=company,
            name=name,
            email=email,
            phone=phone,
            login_id=f'{company_prefix}{name_prefix}{year}{sequence:04d}',
        )
        employee.set_password(password)
        employee.save()

    return JsonResponse({
        'id': employee.id,
        'employeeId': employee.login_id,
        'company': employee.company_name,
        'name': employee.name,
        'email': employee.email,
        'phone': employee.phone,
    }, status=201)
