from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, GroupMessage, UserProfile, User
from .serializers import ChatMessageSerializer, UserProfileSerializer

class SetProfilePictureView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Отримуємо user_id або username із запиту
        user_id = request.data.get('userId')
        username = request.data.get('username')

        # Перевіряємо, чи користувач змінює свій профіль
        if (user_id and user_id != str(request.user.id)) or \
           (username and username != request.user.username):
            return Response({
                'status': 'error',
                'message': 'You can only update your own profile picture'
            }, status=status.HTTP_403_FORBIDDEN)

        # Отримуємо або створюємо профіль користувача
        profile, created = UserProfile.objects.get_or_create(user=request.user)

        # Оновлюємо картинку, якщо вона є в запиті
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
        # Дозволяємо отримати профіль за userId або username
        user_id = request.query_params.get('userId')
        username = request.query_params.get('username')

        if user_id:
            user = get_object_or_404(User, id=user_id)
        elif username:
            user = get_object_or_404(User, username=username)
        else:
            user = request.user  # За замовчуванням повертаємо профіль поточного користувача

        profile, created = UserProfile.objects.get_or_create(user=user)
        serializer = UserProfileSerializer(profile)
        return Response({
            'status': 'success',
            'data': serializer.data
        })

class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chat_group = get_object_or_404(Chat, group_name='public_chat')
        chat_messages = chat_group.chat_message.all()[:30]

        serializer = ChatMessageSerializer(chat_messages, many=True)
        return Response({
            'status': 'success',
            'messages': serializer.data,
            'group_name': chat_group.group_name
        })

    def post(self, request):
        chat_group = get_object_or_404(Chat, group_name='public_chat')
        # Додаємо group до даних запиту
        data = request.data.copy()
        data['group'] = chat_group.id

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
