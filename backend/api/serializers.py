from rest_framework import serializers
from .models import GroupMessage, Chat, UserProfile
from django.contrib.auth.models import User

class ChatMessageSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = GroupMessage
        fields = ['id', 'body', 'author', 'timestamp', 'group']
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
        # Додаємо автора з request.user
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
    
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user_id', 'username', 'profile_picture']
        read_only_fields = ['user_id', 'username']
