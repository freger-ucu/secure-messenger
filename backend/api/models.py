from django.db import models
from django.contrib.auth.models import User

class ChatMessage(models.Model):
    """ chat message class """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sender')
    reciever = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reciever')

    message = models.CharField(max_length=1000)
    is_read = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']
        verbose_name_plural = "Message"

    def __str__(self):
        return f'{self.sender} - {self.reciever}'

    @property
    def sender_profile(self):
        sender_profile = User.objects.get(user=self.sender)
        return sender_profile

    @property
    def reciever_profile(self):
        reciever_profile = User.objects.get(user=self.reciever)
        return reciever_profile
