from django.urls import path
from consumers import ChatroomConsumer

websocket_urlpatterns = [
    path("ws/chatroom/<int:chat_id>/", ChatroomConsumer.as_asgi()),
]