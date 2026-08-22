import json

from django.contrib.auth import authenticate, get_user_model, login
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST

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


@require_GET
def me_view(request):
    if not request.user.is_authenticated:
        return error('Authentication required.', 401)
    user_role = 'admin' if request.user.is_staff else 'employee'
    return JsonResponse({'id': request.user.id, 'email': request.user.email, 'role': user_role})

