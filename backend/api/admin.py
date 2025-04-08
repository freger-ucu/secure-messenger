from django.contrib import admin
from .models import Chat, GroupMessage
# from api.models import ChatMessage

# class ChatMessageAdmin(admin.ModelAdmin):
#     list_editable = ['is_read', 'message']
#     list_display = ['user','sender', 'reciever', 'is_read', 'message']

# admin.site.register( ChatMessage,ChatMessageAdmin)

admin.site.register(Chat)
admin.site.register(GroupMessage)
