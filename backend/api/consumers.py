import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Chat, GroupMessage
from channels.db import database_sync_to_async

class ChatroomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope['user']
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f"chat_{self.chat_id}"

        # Connect to a gropu "chat_id"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        # Save to DB
        await self.save_message(message)

        # Broadcast to WebSocket group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'author': self.user.username,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'author': event['author'],
        }))

    @database_sync_to_async
    def save_message(self, message):
        chat = Chat.objects.get(id=self.chat_id)
        GroupMessage.objects.create(
            group=chat,
            author=self.user,
            body=message
        )