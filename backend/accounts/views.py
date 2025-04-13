from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import MyTokenObtainPairSerializer, RegisterSerializer, RestoreSerializer
from rest_framework import generics


# Create your views here.
class MyObtainTokenPairView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class RestoreView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RestoreSerializer
    lookup_field = 'username'


class GetUserView(APIView):
    permissions = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username
        })