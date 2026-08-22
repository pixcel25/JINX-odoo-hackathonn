from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.db import migrations, models


DEMO_EMAIL = 'employee@dayflow.com'
DEMO_PASSWORD = 'Dayflow@123'
ADMIN_USERNAME = 'admin'
ADMIN_EMAIL = 'admin@gmail.com'
ADMIN_PASSWORD = '1234567890'


def split_name(value):
    parts = [part for part in value.strip().split() if part]
    if not parts:
        return '', ''
    return parts[0], ' '.join(parts[1:])


def create_profile(profile_model, user, first_name, last_name, **values):
    profile_model.objects.update_or_create(
        user=user,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            **values,
        },
    )


def seed_hrms_data(apps, schema_editor):
    user_model = apps.get_model('hr', 'User')
    profile_model = apps.get_model('hr', 'UserProfile')
    payroll_model = apps.get_model('hr', 'PayrollDetails')
    legacy_employee_model = apps.get_model('accounts', 'Employee')
    auth_user_model = apps.get_model('auth', 'User')

    admin_user, _ = auth_user_model.objects.get_or_create(
        username=ADMIN_USERNAME,
        defaults={'email': ADMIN_EMAIL},
    )
    admin_user.email = ADMIN_EMAIL
    admin_user.password = make_password(ADMIN_PASSWORD)
    admin_user.is_staff = True
    admin_user.is_superuser = True
    admin_user.is_active = True
    admin_user.save(update_fields=['email', 'password', 'is_staff', 'is_superuser', 'is_active'])

    hr_admin, _ = user_model.objects.update_or_create(
        email=ADMIN_EMAIL,
        defaults={
            'employee_id': 'ADMIN-001',
            'password_hash': make_password(ADMIN_PASSWORD),
            'role': 'admin',
        },
    )
    create_profile(
        profile_model,
        hr_admin,
        'Admin',
        'User',
        title='HR Administrator',
        department='Human Resources',
        company='DayFlow Technologies',
        manager='Executive Team',
        location='Goa',
        phone='',
        address='',
        avatar_url='',
    )
    payroll_model.objects.get_or_create(user=hr_admin)

    for legacy_employee in legacy_employee_model.objects.all():
        first_name, last_name = split_name(legacy_employee.name)
        user, _ = user_model.objects.update_or_create(
            email=legacy_employee.email,
            defaults={
                'employee_id': legacy_employee.login_id,
                'password_hash': legacy_employee.password_hash,
                'role': 'employee',
            },
        )
        create_profile(
            profile_model,
            user,
            first_name,
            last_name,
            title='Employee',
            department='General',
            company=legacy_employee.company_name,
            manager='',
            location='',
            phone=legacy_employee.phone,
            address='',
            avatar_url='',
        )
        payroll_model.objects.get_or_create(user=user)

    demo_user, _ = user_model.objects.update_or_create(
        email=DEMO_EMAIL,
        defaults={
            'employee_id': 'EMP-001',
            'password_hash': make_password(DEMO_PASSWORD),
            'role': 'employee',
        },
    )
    create_profile(
        profile_model,
        demo_user,
        'Dayflow',
        'Employee',
        title='Team Member',
        department='Engineering',
        company='DayFlow Technologies',
        manager='HR Team',
        location='Goa',
        phone='',
        address='',
        avatar_url='',
    )
    payroll_model.objects.get_or_create(
        user=demo_user,
        defaults={
            'pay_grade': 'Employee',
            'base_salary': 50000,
            'allowances': 5000,
            'deductions': 2500,
            'net_salary': 52500,
        },
    )


def reverse_hrms_data(apps, schema_editor):
    user_model = apps.get_model('hr', 'User')
    user_model.objects.filter(email__in=[DEMO_EMAIL, ADMIN_EMAIL]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0001_initial'),
        ('hr', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='leaverequest',
            name='reason',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='title',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='department',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='company',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='manager',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='location',
            field=models.CharField(blank=True, max_length=150),
        ),
        migrations.AddField(
            model_name='payrolldetails',
            name='pay_grade',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.RunPython(seed_hrms_data, reverse_hrms_data),
    ]
