from django.db import models
from django.contrib.auth.models import User

# class ChatMessage(models.Model):
#     """ chat message class """
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
#     sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
#     reciever = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reciever')

#     message = models.CharField(max_length=1000)
#     is_read = models.BooleanField(default=False)
#     date = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         ordering = ['date']
#         verbose_name_plural = "Message"

#     def __str__(self):
#         return f'{self.sender} - {self.reciever}'

#     @property
#     def sender_profile(self):
#         sender_profile = User.objects.get(user=self.sender)
#         return sender_profile

#     @property
#     def reciever_profile(self):
#         reciever_profile = User.objects.get(user=self.reciever)
#         return reciever_profile


class Chat(models.Model):
    """
    Represents a one-to-one conversation between two users.
    """
    user1 = models.ForeignKey(User, related_name='chats_as_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chats_as_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user1', 'user2')
        verbose_name = "One-to-One Chat"
        verbose_name_plural = "One-to-One Chats"

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"


class GroupMessage(models.Model):
    group = models.ForeignKey(Chat, related_name='chat_messages', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.CharField(max_length=300)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author.username} : {self.body}, {self.group}'

    class Meta:
        ordering = ['-created']
