from django.contrib.auth.hashers import make_password
from django.db import models


class Employee(models.Model):
    company_name = models.CharField(max_length=200)
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30)
    password_hash = models.CharField(max_length=128)
    login_id = models.CharField(max_length=20, unique=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-joined_at']

    def set_password(self, password):
        self.password_hash = make_password(password)

    def __str__(self):
        return f'{self.login_id} - {self.name}'
