from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Account


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        # Add custom claims
        token['username'] = user.username
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    seedphrase = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'seedphrase']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create(username=validated_data['username'])
        Account.objects.create(user=user, seedphrase=validated_data['seedphrase'])
        user.set_password(validated_data['password'])
        user.save()

        return user


class RestoreSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    seedphrase = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password2', 'seedphrase']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        return attrs

    def update(self, instance, validated_data):
        # Check if seedphrase matches an existing user's seedphrase
        # If so, update the user's password
        try:
            account = Account.objects.get(seedphrase=validated_data['seedphrase'])
            if account.user != instance:
                raise serializers.ValidationError({"seedphrase": "Seedphrase does not match the user."})
        except Account.DoesNotExist:
            raise serializers.ValidationError({"seedphrase": "Seedphrase does not exist."})
        instance.set_password(validated_data['password'])
        instance.save()
        return instance
