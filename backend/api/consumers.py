import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Chat, GroupMessage
from channels.db import database_sync_to_async

class ChatroomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f"chat_{self.chat_id}"
        self.chat = await self.get_chat()

        if self.user.id in (self.chat.user1_id, self.chat.user2_id):
            # Connect to the group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        else:
            await self.close()


    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            if not text_data.strip():
                raise ValueError("Empty message received")

            data = json.loads(text_data)
            # Expect AES-GCM ciphertext and iv
            ct = data.get('ct')
            iv = data.get('iv')
            if not ct or not iv:
                raise ValueError("Invalid message format: missing ct or iv")

            print("User:", self.user)
            print("Is Anonymous:", self.user.is_anonymous)
            print("Message:", ct)

            # Save AES-encrypted message and iv
            await self.save_message(ct, iv)

            # Broadcast encrypted message to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'ct': ct,
                    'iv': iv,
                    'author': self.user.username,
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                'error': str(e)
            }))
            await self.close()

    async def chat_message(self, event):
        # Send AES ciphertext and iv to client
        await self.send(text_data=json.dumps({
            'ct': event['ct'],
            'iv': event['iv'],
            'author': event['author'],
        }))

    @database_sync_to_async
    def get_chat(self):
        return Chat.objects.get(id=self.chat_id)

    @database_sync_to_async
    def save_message(self, ct, iv):
        try:
            chat = Chat.objects.get(id=self.chat_id)
        except Chat.DoesNotExist:
            raise Exception("Chat does not exist")

        if self.user.is_anonymous:
            raise Exception("Anonymous users cannot send messages")

        # Save ciphertext and iv
        GroupMessage.objects.create(
            group=chat,
            author=self.user,
            body=ct,
            iv=iv
        )