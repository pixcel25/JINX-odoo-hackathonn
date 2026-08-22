from django.contrib import admin

from .models import Employee


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('login_id', 'name', 'company_name', 'email', 'phone', 'joined_at')
    search_fields = ('login_id', 'name', 'company_name', 'email')
    readonly_fields = ('login_id', 'joined_at')
