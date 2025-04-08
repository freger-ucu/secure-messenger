from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import ChatView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
]
