from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import ChatView, SetProfilePictureView, SetUsernameView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('profile/picture/', SetProfilePictureView.as_view(), name='set_profile_picture'),
    path('profile/username/', SetUsernameView.as_view(), name='set_username'),
]
