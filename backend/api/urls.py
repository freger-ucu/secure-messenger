from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import ChatView, CreateChatView, ChatHistoryView

urlpatterns = [
    path('chat/', ChatView.as_view(), name='chat'),
    path('chat/create/', CreateChatView.as_view(), name='create-chat'),
    path('chat/<int:chat_id>/history/', ChatHistoryView.as_view(), name='chat-history'),
]
