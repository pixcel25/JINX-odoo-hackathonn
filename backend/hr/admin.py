from django.contrib import admin

from .models import Attendance, AuditNotification, LeaveRequest, PayrollDetails, User, UserProfile


admin.site.register([User, Attendance, LeaveRequest, UserProfile, PayrollDetails, AuditNotification])
