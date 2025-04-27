from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Chat, GroupMessage, UserKey, ChatKey
from .serializers import ChatMessageSerializer, ChatSerializer, UserKeySerializer, ChatKeySerializer
from django.contrib.auth.models import User
import os, base64
from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
from rest_framework import generics


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
            
            # Get public key (JSONField yields dict) or None
            try:
                public_key = other_user.user_key.public_key
            except UserKey.DoesNotExist:
                public_key = None

            chat_data.append({
                'id': chat.id,
                'other_user': other_user.username,
                'public_key': public_key,
                'latest_message': message_data
            })
        
        return Response({
            'status': 'success',
            'chats': chat_data
        })


class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, chat_id):
        # Get the authenticated user
        user = request.user
        
        try:
            # Get the chat and ensure the user is a participant
            chat = Chat.objects.get(id=chat_id)
            if user != chat.user1 and user != chat.user2:
                return Response({
                    'status': 'error',
                    'message': 'You are not a participant in this chat'
                }, status=status.HTTP_403_FORBIDDEN)
                
            # Get all messages for this chat
            messages = chat.chat_messages.all().order_by('created')
            message_data = ChatMessageSerializer(messages, many=True).data
            
            # Get the other user
            other_user = chat.user2 if chat.user1 == user else chat.user1
            
            return Response({
                'status': 'success',
                'chat_id': chat.id,
                'user1': chat.user1.username,
                'user2': chat.user2.username,
                'other_user': other_user.username,
                'created_at': chat.created_at,
                'messages': message_data
            })
            
        except Chat.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Chat not found'
            }, status=status.HTTP_404_NOT_FOUND)


class CreateChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # The user2_username is expected in the request data
        serializer = ChatSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            chat = serializer.save()
            # Generate symmetric key for chat and encrypt for both participants
            sym_key = os.urandom(32)  # 256-bit AES key
            for user in [chat.user1, chat.user2]:
                # load user's public key from JWK
                jwk = user.user_key.public_key
                # decode e and n from base64url
                e = int.from_bytes(base64.urlsafe_b64decode(jwk['e'] + '=='), 'big')
                n = int.from_bytes(base64.urlsafe_b64decode(jwk['n'] + '=='), 'big')
                pub_numbers = rsa.RSAPublicNumbers(e=e, n=n)
                pub_key = pub_numbers.public_key(default_backend())
                # encrypt symmetric key
                encrypted = pub_key.encrypt(
                    sym_key,
                    asym_padding.OAEP(
                        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                encrypted_b64 = base64.b64encode(encrypted).decode()
                iv = base64.b64encode(os.urandom(12)).decode()
                ChatKey.objects.create(chat=chat, user=user, encrypted_key=encrypted_b64, iv=iv)
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


class UserKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_key = request.user.user_key
        serializer = UserKeySerializer(user_key)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserKeySerializer(data=request.data)
        if serializer.is_valid():
            UserKey.objects.update_or_create(
                user=request.user,
                defaults=serializer.validated_data
            )
            return Response({'status': 'ok'})
        return Response(serializer.errors, status=400)


class ChatKeyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chat_id):
        chat = get_object_or_404(Chat, id=chat_id)
        # Ensure symmetric key exists for this chat and both users
        keys = ChatKey.objects.filter(chat=chat)
        if not keys.exists():
            # generate new symmetric key and encrypt for both participants
            import os, base64
            from cryptography.hazmat.primitives.asymmetric import padding as asym_padding
            from cryptography.hazmat.primitives import hashes
            from cryptography.hazmat.primitives.asymmetric import rsa
            from cryptography.hazmat.backends import default_backend
            sym_key = os.urandom(32)
            participants = [chat.user1, chat.user2]
            for user in participants:
                jwk = user.user_key.public_key
                e = int.from_bytes(base64.urlsafe_b64decode(jwk['e'] + '=='), 'big')
                n = int.from_bytes(base64.urlsafe_b64decode(jwk['n'] + '=='), 'big')
                pub = rsa.RSAPublicNumbers(e=e, n=n).public_key(default_backend())
                enc_key = pub.encrypt(
                    sym_key,
                    asym_padding.OAEP(
                        mgf=asym_padding.MGF1(algorithm=hashes.SHA256()),
                        algorithm=hashes.SHA256(),
                        label=None
                    )
                )
                ChatKey.objects.create(
                    chat=chat,
                    user=user,
                    encrypted_key=base64.b64encode(enc_key).decode(),
                    iv=base64.b64encode(os.urandom(12)).decode()
                )
        key_obj = get_object_or_404(ChatKey, chat_id=chat_id, user=request.user)
        serializer = ChatKeySerializer(key_obj)
        return Response(serializer.data)