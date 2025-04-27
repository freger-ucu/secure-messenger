from rest_framework import serializers
from django.contrib.auth.models import User
from .models import GroupMessage, Chat, UserKey, ChatKey
from django.db import models


class ChatMessageSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    timestamp = serializers.DateTimeField(source='created', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'body', 'iv', 'author', 'timestamp', 'group']
        read_only_fields = ['id', 'author', 'timestamp']
        extra_kwargs = {
            'group': {'write_only': True},
            'body': {
                'max_length': 300,
                'style': {
                    'input_type': 'text',
                    'placeholder': 'Add message',
                    'class': 'p-4 text-black',
                    'autofocus': True
                }
            }
        }

    def create(self, validated_data):
        # Add author from request.user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)


class ChatSerializer(serializers.ModelSerializer):
    user2_username = serializers.CharField(write_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'user1', 'user2', 'created_at', 'user2_username']
        read_only_fields = ['id', 'user1', 'user2', 'created_at']

    def validate_user2_username(self, value):
        try:
            User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this username does not exist.")
        return value

    def create(self, validated_data):
        user1 = self.context['request'].user
        user2_username = validated_data.pop('user2_username')
        user2 = User.objects.get(username=user2_username)

        # Check if a chat already exists between these users
        existing_chat = Chat.objects.filter(
            (models.Q(user1=user1) & models.Q(user2=user2)) |
            (models.Q(user1=user2) & models.Q(user2=user1))
        ).first()

        if existing_chat:
            return existing_chat

        # Create new chat
        chat = Chat(user1=user1, user2=user2)
        chat.save()
        return chat


class UserKeySerializer(serializers.ModelSerializer):
    public_key = serializers.JSONField()

    class Meta:
        model = UserKey
        fields = ['public_key', 'encrypted_private_key', 'salt', 'iv']


class ChatKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatKey
        fields = ['encrypted_key', 'iv']