from django.apps import AppConfig


# Registers the authentication and admin API application with Django.
class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
