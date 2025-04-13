from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, GroupMessage, UserProfile, User
from .serializers import ChatMessageSerializer, UserProfileSerializer, UsernameUpdateSerializer

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
