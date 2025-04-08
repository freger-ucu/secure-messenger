# # views.py
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import get_object_or_404
# from .models import Chat, GroupMessage
# from .serializers import ChatMessageSerializer

# class ChatView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         chat_group = get_object_or_404(Chat, group_name='public_chat')
#         chat_messages = chat_group.chat_message.all()[:30]

#         serializer = ChatMessageSerializer(chat_messages, many=True)
#         return Response({
#             'status': 'success',
#             'messages': serializer.data,
#             'group_name': chat_group.group_name
#         })

#     def post(self, request):
#         chat_group = get_object_or_404(Chat, group_name='public_chat')
#         # Додаємо group до даних запиту
#         data = request.data.copy()
#         data['group'] = chat_group.id

#         serializer = ChatMessageSerializer(data=data, context={'request': request})
#         if serializer.is_valid():
#             serializer.save()
#             return Response({
#                 'status': 'success',
#                 'message': serializer.data
#             }, status=status.HTTP_201_CREATED)

#         return Response({
#             'status': 'error',
#             'errors': serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)
