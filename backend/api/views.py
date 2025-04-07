from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import *
from .forms import ChatmessegeCreateForm

@login_required
def chat_view(request):
    chat_group = get_object_or_404(Chat, group_name='public_chat')
    chat_messages = chat_group.chat_messege.all()[:30]
    form = ChatmessegeCreateForm()

    if request.method == 'POST':
        form = form = ChatmessegeCreateForm(request.POST)
        if form.is_valid:
            message = form.save(commit=False)
            message.author = request.user
            message.group = chat_group
            message.save()
            return redirect('home')

    return render(request, 'a_rtchat/chathtml', {chat_messages : 'chat_messeges', form: 'form'})
