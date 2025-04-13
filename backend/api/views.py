from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, GroupMessage
from .serializers import ChatMessageSerializer, ChatSerializer
from django.contrib.auth.models import User


class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Get the authenticated user
        user = request.user
        
        # Find all chats where the user is either user1 or user2
        chats = Chat.objects.filter(user1=user) | Chat.objects.filter(user2=user)
        
        # Format response
        chat_data = []
        for chat in chats:
            # Get the other user in the chat
            other_user = chat.user2 if chat.user1 == user else chat.user1
            
            # Get latest messages for this chat
            messages = chat.chat_messages.all().order_by('-created')[:1]
            message_data = ChatMessageSerializer(messages, many=True).data
            
            chat_data.append({
                'id': chat.id,
                'other_user': other_user.username,
                'latest_message': message_data
            })
        
        return Response({
            'status': 'success',
            'chats': chat_data
        })


class CreateChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # The user2_username is expected in the request data
        serializer = ChatSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            chat = serializer.save()
            return Response({
                'status': 'success',
                'chat': {
                    'id': chat.id,
                    'user1': chat.user1.username,
                    'user2': chat.user2.username,
                    'created_at': chat.created_at
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'status': 'error',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
