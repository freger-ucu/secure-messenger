from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import *
from .forms import ChatmessegeCreateForm
from django.http import JsonResponse

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

@login_required
def chat_view(request):
    chat_group = get_object_or_404(Chat, group_name='public_chat')
    chat_messages = chat_group.chat_message.all()[:30]

    if request.method == 'POST':
        form = ChatmessegeCreateForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.author = request.user
            message.group = chat_group
            message.save()
            return JsonResponse({'status': 'success', 'message': 'Message posted'})
        return JsonResponse({'status': 'error', 'message': 'Invalid form data'}, status=400)

    # Prepare messages data for GET request
    messages_data = [{
        'id': msg.id,
        'author': msg.author.username,
        'content': msg.content,
        'timestamp': msg.created_at.isoformat()
    } for msg in chat_messages]

    return JsonResponse({
        'status': 'success',
        'messages': messages_data,
        'group_name': chat_group.group_name
    })
