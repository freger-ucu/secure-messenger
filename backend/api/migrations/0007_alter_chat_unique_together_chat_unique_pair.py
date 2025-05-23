# Generated by Django 5.1.8 on 2025-04-12 21:12

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_groupmessage_edited_at_groupmessage_is_edited_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='chat',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='chat',
            constraint=models.UniqueConstraint(fields=('user1', 'user2'), name='unique_pair'),
        ),
    ]
