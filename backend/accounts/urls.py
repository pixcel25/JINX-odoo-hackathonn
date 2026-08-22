from django.urls import path

from .views import create_employee_view, csrf_token, employee_login_view, login_view, me_view, signup_view

urlpatterns = [
    path('csrf/', csrf_token),
    path('login/', login_view),
    path('employee-login/', employee_login_view),
    path('signup/', signup_view),
    path('me/', me_view),
    path('employees/', create_employee_view),
]
