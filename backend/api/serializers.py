from rest_framework import serializers
from .models import GroupMessage, Chat, UserProfile
from django.contrib.auth.models import User

class ChatMessageSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.username')
    timestamp = serializers.DateTimeField(source='created_at', read_only=True)
    body = serializers.CharField()

    class Meta:
        model = GroupMessage
        fields = ['id', 'body', 'author', 'timestamp', 'group']
        read_only_fields = ['id', 'author', 'timestamp']
        extra_kwargs = {
            'group': {'write_only': True},
            'body': {
                'max_length': 1000,
                'style': {
                    'input_type': 'text',
                    'placeholder': 'Add message',
                    'class': 'p-4 text-black',
                    'autofocus': True
                }
            }
        }

    def create(self, validated_data):
        plaintext_body = validated_data.pop('body')
        group = validated_data['group']
        if not group.encryption_key:
            raise serializers.ValidationError("Chat has no encryption key.")

        message = GroupMessage(**validated_data)
        message.author = self.context['request'].user
        message.set_body(plaintext_body, group.encryption_key)
        message.save()
        return message

    def to_representation(self, instance):
        """Розшифровуємо body при серіалізації."""
        representation = super().to_representation(instance)
        representation['body'] = instance.get_body()
        return representation
    
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['user_id', 'username', 'profile_picture']
        read_only_fields = ['user_id', 'username']

class UsernameUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username']
        extra_kwargs = {
            'username': {'required': True},
        }

    def validate_username(self, value):
        """
        Перевіряємо, чи username унікальний, виключаючи поточного користувача.
        """
        if User.objects.exclude(id=self.instance.id).filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
