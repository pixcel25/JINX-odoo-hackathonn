from django.urls import path

from .api import (
    attendance_view,
    check_in_view,
    check_out_view,
    employee_login_view,
    employees_view,
    leave_request_detail_view,
    leave_requests_view,
    me_view,
    notifications_view,
    payroll_detail_view,
    payroll_view,
    profile_view,
)


urlpatterns = [
    path('auth/employee-login/', employee_login_view),
    path('me/', me_view),
    path('employees/', employees_view),
    path('attendance/', attendance_view),
    path('attendance/check-in/', check_in_view),
    path('attendance/check-out/', check_out_view),
    path('leave-requests/', leave_requests_view),
    path('leave-requests/<int:request_id>/', leave_request_detail_view),
    path('payroll/', payroll_view),
    path('payroll/<int:user_id>/', payroll_detail_view),
    path('profile/', profile_view),
    path('notifications/', notifications_view),
]
