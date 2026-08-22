from django.urls import path

from .views import create_employee_view, csrf_token, employee_login_view, employee_password_change_view, login_view, me_view, signup_view
from .views import salary_change_view

urlpatterns = [
    path('csrf/', csrf_token),
    path('login/', login_view),
    path('employee-login/', employee_login_view),
    path('employee-password-change/', employee_password_change_view),
    path('signup/', signup_view),
    path('me/', me_view),
    path('salary-change/', salary_change_view),
    path('employees/', create_employee_view),
]
