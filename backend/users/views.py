from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


class SignupView(APIView):
    def post(self, request):
        # Extract required fields from the request data
        username = request.data.get("email")
        password = request.data.get("password")
        email = request.data.get("email", "")
        is_staff = request.data.get("is_staff", False)

        if not username or not password:
            return Response(
                {"error": "email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the user using Django's built-in user model
        user = User.objects.create_user(
            username=username, email=email, password=password
        )
        user.is_staff = is_staff  # True for admin, False for normal user
        user.save()

        # Generate JWT tokens using Simple JWT
        refresh = RefreshToken.for_user(user)
        role = "admin" if user.is_staff else "user"

        return Response(
            {
                "message": "User created successfully.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": role,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    def post(self, request):
        # Extract username and password
        username = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED
            )

        # Generate JWT tokens using Simple JWT
        refresh = RefreshToken.for_user(user)

        # Determine the role based on is_staff
        role = "admin" if user.is_staff else "user"

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "role": role,
            },
            status=status.HTTP_200_OK,
        )
