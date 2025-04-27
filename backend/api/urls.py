from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import ChatView, CreateChatView, ChatHistoryView, UserKeyView, ChatKeyView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('chat/create/', CreateChatView.as_view(), name='create-chat'),
    path('chat/<int:chat_id>/history/', ChatHistoryView.as_view(), name='chat-history'),
    path('keys/', UserKeyView.as_view(), name='user-keys'),
    path('chat/<int:chat_id>/key/', ChatKeyView.as_view(), name='chat-key'),
]
