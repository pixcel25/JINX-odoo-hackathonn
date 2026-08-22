from django.urls import path

from .views import csrf_token, login_view, me_view, signup_view

urlpatterns = [
    path('csrf/', csrf_token),
    path('login/', login_view),
    path('signup/', signup_view),
    path('me/', me_view),
]
