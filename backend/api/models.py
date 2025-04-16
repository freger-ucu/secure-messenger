from django.db import models
from django.contrib.auth.models import User
from cryptography.fernet import Fernet
import base64

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(
        upload_to='profile_pics/',
        null=True,
        blank=True,
        default='profile_pics/default.jpg'
    )

    def __str__(self):
        return f"Profile of {self.user.username}"


class Chat(models.Model):
    """
    Represents a one-to-one conversation between two users.
    """
    user1 = models.ForeignKey(User, related_name='chats_as_user1', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='chats_as_user2', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    encryption_key = models.BinaryField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('user1', 'user2')
        verbose_name = "One-to-One Chat"
        verbose_name_plural = "One-to-One Chats"
        indexes = [
            models.Index(fields=['user1', 'user2']),
        ]

    def __str__(self):
        return f"Chat between {self.user1.username} and {self.user2.username}"

    def save(self, *args, **kwargs):
        if not self.encryption_key:
            # Генеруємо ключ шифрування при створенні чату
            self.encryption_key = Fernet.generate_key()
        super().save(*args, **kwargs)


class GroupMessage(models.Model):
    group = models.ForeignKey(Chat, related_name='chat_messages', on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    body = models.BinaryField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.author.username} : {self.body}'

    class Meta:
        ordering = ['-created']
        indexes = [
            models.Index(fields=['chat', 'created_at']),
            models.Index(fields=['author']),
        ]

    def encrypt_body(self, plaintext, encryption_key):
        """Шифруємо повідомлення."""
        fernet = Fernet(encryption_key)
        return fernet.encrypt(plaintext.encode())

    def decrypt_body(self, encryption_key):
        """Розшифровуємо повідомлення."""
        fernet = Fernet(encryption_key)
        return fernet.decrypt(self.body).decode()

    def set_body(self, plaintext, encryption_key):
        """Встановлюємо зашифроване повідомлення."""
        self.body = self.encrypt_body(plaintext, encryption_key)

    def get_body(self):
        """Отримуємо розшифроване повідомлення."""
        if not self.group.encryption_key:
            raise ValueError("No encryption key found for this chat.")
        return self.decrypt_body(self.group.encryption_key)
