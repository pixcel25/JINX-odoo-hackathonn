from django.apps import AppConfig


# Registers the HR domain models with Django.
class HrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hr'
