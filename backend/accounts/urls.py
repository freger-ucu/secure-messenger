"""Module views"""

from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import path
from .views import MyObtainTokenPairView, RegisterView, RestoreView, GetUserView

urlpatterns = [
    path('login/', MyObtainTokenPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('restore/<str:username>/', RestoreView.as_view(), name='restore-password'),
    path('me/', GetUserView.as_view(), name='user-info'),
]
