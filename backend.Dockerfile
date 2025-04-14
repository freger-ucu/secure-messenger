# backend.Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY backend/ /app/
COPY requirements.txt /app/

RUN pip install --upgrade pip && pip install -r requirements.txt

CMD ["sh", "-c", "python manage.py migrate && daphne -b 0.0.0.0 -p 8000 backend.asgi:application"]