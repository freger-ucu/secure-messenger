from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password


class Account(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    seedphrase = models.CharField(max_length=255)


    def save(self, *args, **kwargs):
        if self.seedphrase and not self.seedphrase.startswith('pbkdf2_sha256$'):
            self.seedphrase = make_password(self.seedphrase)
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.seedphrase}'

