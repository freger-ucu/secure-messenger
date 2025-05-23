"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from .middleware.jwt_auth import JWTAuthMiddleware


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

django_application = get_asgi_application()

from api import routing

application = ProtocolTypeRouter({
    'http': django_application,
    "websocket": JWTAuthMiddleware(
         URLRouter(routing.websocket_urlpatterns)
    ),
})
