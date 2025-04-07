from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Chat, GroupMessage
from .forms import ChatmessegeCreateForm
from rest_framework import generics



class Chat(generics.CreateAPIView):
    pass


# @login_required
# def chat_view(request):
#     chat_group = get_object_or_404(Chat, group_name='public_chat')
#     chat_messages = chat_group.chat_messege.all()[:30]
#     form = ChatmessegeCreateForm()

#     if request.method == 'POST':
#         form = form = ChatmessegeCreateForm(request.POST)
#         if form.is_valid:
#             message = form.save(commit=False)
#             message.author = request.user
#             message.group = chat_group
#             message.save()
#             return redirect('home')

#     return render(request, 'a_rtchat/chathtml', {chat_messages : 'chat_messeges', form: 'form'})

# @login_required
# @csrf_exempt
# def chat_view(request):
#     print('Starting...')
#     chat_group = get_object_or_404(Chat, user1_id = 1, user2_id = 33)
#     chat_messages = chat_group.chat_messages.all()[:30]

#     # if request.method == 'GET':
#     #     return HttpResponse(request)


#     if request.method == 'POST':
#         form = ChatmessegeCreateForm(request.POST)
#         print("Post request is recieved")
#         if form.is_valid():
#             print("Processing form")
#             message = form.save(commit=False)
#             message.author = request.user
#             message.group = 1
#             message.save()
#             print('form is proccesed')
#             return Response({'status': 'success', 'message': 'Message posted'})
#         else:
#             return Response({'status': 'error', 'message': 'Invalid form data'}, status=400)

#     if request.method == 'GET':
#         return chat_messages

    # Prepare messages data for GET request
    # messages_data = [{
    #     'id': msg.id,
    #     'author': msg.author.username,
    #     'content': msg.content,
    #     'timestamp': msg.created_at.isoformat()
    # } for msg in chat_messages]

    # return Response({
    #     'status': 'success',
    #     'messages': messages_data,
    # })
