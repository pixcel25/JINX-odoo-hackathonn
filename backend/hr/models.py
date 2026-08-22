from django.db import models


# Core HR entities used by attendance, leave, payroll, and audit features.
class User(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        HR = 'hr', 'HR'
        EMPLOYEE = 'employee', 'Employee'

    employee_id = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    password_hash = models.CharField(max_length=128)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email


class Attendance(models.Model):
    class Status(models.TextChoices):
        PRESENT = 'present', 'Present'
        ABSENT = 'absent', 'Absent'
        LATE = 'late', 'Late'
        HALF_DAY = 'half_day', 'Half day'
        ON_LEAVE = 'on_leave', 'On leave'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance_records')
    check_in = models.DateTimeField()
    check_out = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)

    class Meta:
        db_table = 'attendance'

    def __str__(self):
        return f'{self.user.email} - {self.check_in:%Y-%m-%d}'


class LeaveRequest(models.Model):
    class LeaveType(models.TextChoices):
        ANNUAL = 'annual', 'Annual'
        SICK = 'sick', 'Sick'
        CASUAL = 'casual', 'Casual'
        UNPAID = 'unpaid', 'Unpaid'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewer_comment = models.TextField(blank=True)

    class Meta:
        db_table = 'leave_requests'

    def __str__(self):
        return f'{self.user.email} - {self.leave_type}'


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f'{self.first_name} {self.last_name}'.strip()


class PayrollDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='payroll_details')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        db_table = 'payroll_details'

    def __str__(self):
        return f'{self.user.email} payroll'


class AuditNotification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audit_notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'audit_notification'
        ordering = ['-created_at']

    def __str__(self):
        return self.message[:50]
