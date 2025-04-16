# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, GroupMessage, UserProfile
from django.contrib.auth.models import User
from .serializers import ChatMessageSerializer, UserProfileSerializer, UsernameUpdateSerializer

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Припускаємо, що це чат 1-на-1 між request.user і іншим користувачем
        user2_id = request.query_params.get('user2_id')
        if not user2_id:
            return Response({
                'status': 'error',
                'message': 'user2_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        user2 = get_object_or_404(User, id=user2_id)
        # Шукаємо чат між двома користувачами
        chat = Chat.objects.filter(
            models.Q(user1=request.user, user2=user2) |
            models.Q(user1=user2, user2=request.user)
        ).first()

        if not chat:
            return Response({
                'status': 'success',
                'messages': [],
                'chat_id': None
            })

        chat_messages = chat.chat_messages.all()[:30]
        serializer = ChatMessageSerializer(chat_messages, many=True)
        return Response({
            'status': 'success',
            'messages': serializer.data,
            'chat_id': chat.id
        })

    def post(self, request):
        user2_id = request.data.get('user2_id')
        if not user2_id:
            return Response({
                'status': 'error',
                'message': 'user2_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)

        user2 = get_object_or_404(User, id=user2_id)
        chat, created = Chat.objects.get_or_create(
            user1=request.user, user2=user2,
            defaults={'user1': request.user, 'user2': user2}
        )
        if not chat.encryption_key:
            chat.save()  # Генеруємо ключ, якщо його немає

        data = request.data.copy()
        data['group'] = chat.id
        serializer = ChatMessageSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class SetProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('userId')
        username = request.data.get('username')
        if (user_id and user_id != str(request.user.id)) or \
           (username and username != request.user.username):
            return Response({
                'status': 'error',
                'message': 'You can only update your own profile picture'
            }, status=status.HTTP_403_FORBIDDEN)

        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': serializer.data
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        user_id = request.query_params.get('userId')
        username = request.query_params.get('username')
        if user_id:
            user = get_object_or_404(User, id=user_id)
        elif username:
            user = get_object_or_404(User, username=username)
        else:
            user = request.user

        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

class SetUsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = UsernameUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'data': {
                    'username': serializer.instance.username
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        return Response({
            'status': 'success',
            'data': {
                'username': request.user.username
            }
        }, status=status.HTTP_200_OK)
