from django.contrib.auth.hashers import make_password
from django.db import models


# Database record used for employees created by the admin portal.
class Employee(models.Model):
    company_name = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30)
    department = models.CharField(max_length=100, default='')
    manager = models.CharField(max_length=200, default='')
    location = models.CharField(max_length=200, default='')
    password_hash = models.CharField(max_length=128)
    login_id = models.CharField(max_length=20, unique=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-joined_at']

    def set_password(self, password):
        # Store only a one-way hash so employee credentials are never persisted in plain text.
        self.password_hash = make_password(password)

    def __str__(self):
        return f'{self.login_id} - {self.name}'
