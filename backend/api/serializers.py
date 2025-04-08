# from rest_framework import serializers
# from .models import GroupMessage, Chat

# class ChatMessageSerializer(serializers.ModelSerializer):
#     author = serializers.ReadOnlyField(source='author.username')
#     timestamp = serializers.DateTimeField(source='created_at', read_only=True)

#     class Meta:
#         model = GroupMessage
#         fields = ['id', 'body', 'author', 'timestamp', 'group']
#         read_only_fields = ['id', 'author', 'timestamp']
#         extra_kwargs = {
#             'group': {'write_only': True},
#             'body': {
#                 'max_length': 300,
#                 'style': {
#                     'input_type': 'text',
#                     'placeholder': 'Add message',
#                     'class': 'p-4 text-black',
#                     'autofocus': True
#                 }
#             }
#         }

#     def create(self, validated_data):
#         # Додаємо автора з request.user
#         validated_data['author'] = self.context['request'].user
#         return super().create(validated_data)
