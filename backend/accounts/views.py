import json
import re
import secrets

# Admin API handlers for authentication, employee provisioning, and salary notices.

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.mail import send_mail
from django.db import transaction
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt
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
def employee_login_view(request):
    try:
        data = json.loads(request.body)
    except (TypeError, json.JSONDecodeError):
        return error('Enter your employee ID and email.')

    login_id = data.get('loginId', '').strip().upper() if isinstance(data, dict) and isinstance(data.get('loginId'), str) else ''
    email = data.get('email', '').strip().lower() if isinstance(data, dict) and isinstance(data.get('email'), str) else ''
    if not re.fullmatch(r'DF\d{3}', login_id) or not email:
        return error('Enter your employee ID and email.')

    employee = Employee.objects.filter(login_id=login_id, email=email).first()
    if not employee:
        return error('That employee ID and email do not match.', 401)

    return JsonResponse({
        'id': employee.id,
        'employeeId': employee.login_id,
        'displayName': employee.name,
    })


@require_GET
def me_view(request):
    if not request.user.is_authenticated:
        return error('Authentication required.', 401)
    user_role = 'admin' if request.user.is_staff else 'employee'
    return JsonResponse({'id': request.user.id, 'email': request.user.email, 'role': user_role})
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

    raw_fields = {
        'company': data.get('company', ''),
        'name': data.get('name', ''),
        'email': data.get('email', ''),
        'phone': data.get('phone', ''),
        'department': data.get('department', ''),
        'location': data.get('location', ''),
    }
    if not all(isinstance(value, str) for value in raw_fields.values()):
        return error('Company, name, email, phone, department, and location must be text values.')

    company = raw_fields['company'].strip()
    name = raw_fields['name'].strip()
    email = raw_fields['email'].strip().lower()
    phone = raw_fields['phone'].strip()
    department = raw_fields['department'].strip()
    location = raw_fields['location'].strip()
    if not company or not name or not phone or not department or not location or len(company) > 200 or len(name) > 200 or len(phone) > 30 or len(department) > 100 or len(location) > 200:
        return error('Company, name, phone, department, and location are required.')
    try:
        validate_email(email)
    except ValidationError as exc:
        return error(exc.messages[0])
    if Employee.objects.filter(email=email).exists():
        return error('An employee with this email already exists.')
    employee_id = next(
        (candidate for candidate in (f'DF{secrets.randbelow(1000):03d}' for _ in range(1000))
         if not Employee.objects.filter(login_id=candidate).exists()),
        None,
    )
    if employee_id is None:
        return error('Could not generate a unique employee ID. Please try again.', 503)

    with transaction.atomic():
        employee = Employee(
            company_name=company,
            name=name,
            email=email,
            phone=phone,
            department=department,
            location=location,
            login_id=employee_id,
        )
        # Keep a server-side hash for the existing schema; login uses the ID/email pair.
        employee.password_hash = make_password(secrets.token_urlsafe(24))
        employee.save()

    return JsonResponse({
        'id': employee.id,
        'employeeId': employee.login_id,
        'company': employee.company_name,
        'name': employee.name,
        'email': employee.email,
        'phone': employee.phone,
        'department': employee.department,
        'location': employee.location,
    }, status=201)
