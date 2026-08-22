from django.urls import path

# Routes consumed by the admin web application and employee authentication flow.
from .views import create_employee_view, csrf_token, employee_login_view, login_view, me_view, signup_view
from .views import salary_change_view

urlpatterns = [
    path('csrf/', csrf_token),
    path('login/', login_view),
    path('employee-login/', employee_login_view),
    path('signup/', signup_view),
    path('me/', me_view),
    path('salary-change/', salary_change_view),
    path('employees/', create_employee_view),
]
