from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.exceptions import ValidationError
from .models import User, Department, DoctorProfile, PatientProfile, Appointment, OTP
from .serializers import (
    UserSerializer, DoctorRegistrationSerializer, PatientRegistrationSerializer
)
import random
import string
import re

from rest_framework.permissions import BasePermission
from .serializers import (
    DepartmentSerializer, DoctorProfileSerializer, PatientProfileSerializer, 
    AppointmentSerializer, AppointmentCreateSerializer
)

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'ADMIN')

class IsDoctorUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'DOCTOR')

class IsPatientUser(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'PATIENT')

@api_view(['POST'])
@permission_classes([AllowAny])
def register_doctor(request):
    serializer = DoctorRegistrationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Doctor registered successfully. Awaiting admin approval.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_register_doctor(request):
    serializer = DoctorRegistrationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Doctor added and automatically approved!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_patient(request):
    serializer = PatientRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': 'Patient registered successfully. Check email for details.'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
        if user.role == 'DOCTOR':
            if not getattr(user, 'doctor_profile', None) or not user.doctor_profile.is_approved:
                return Response({'error': 'Account not approved yet.'}, status=status.HTTP_403_FORBIDDEN)
        
        refresh = RefreshToken.for_user(user)
        res_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role,
            'email': user.email,
            'name': user.first_name + ' ' + user.last_name,
        }
        if user.role == 'PATIENT' and hasattr(user, 'patient_profile'):
            res_data['patient_id'] = user.patient_profile.patient_id
        return Response(res_data)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not user.check_password(old_password):
        return Response({'error': 'Incorrect current password.'}, status=400)
    
    import re
    if len(new_password) < 8 or not re.search(r"\d", new_password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new_password):
        return Response({'error': 'Password must be at least 8 characters long, contain a number and a special character.'}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password changed successfully.'})

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        code = ''.join(random.choices(string.digits, k=6))
        
        # Disable previous otps
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)
        OTP.objects.create(user=user, code=code)
        
        send_mail(
            'Password Reset OTP',
            f'Your OTP for password reset is {code}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'OTP sent to email.'})
    except User.DoesNotExist:
        return Response({'error': 'User with this email does not exist.'}, status=404)

@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    
    # Password Validation
    if len(new_password) < 8 or not re.search(r"\d", new_password) or not re.search(r"[!@#$%^&*(),.?\":{}|<>]", new_password):
        return Response({'error': 'Password must be at least 8 characters long, contain a number and a special character.'}, status=400)

    try:
        user = User.objects.get(email=email)
        otp_record = OTP.objects.filter(user=user, code=code, is_used=False).order_by('-created_at').first()
        
        if otp_record:
            user.set_password(new_password)
            user.save()
            otp_record.is_used = True
            otp_record.save()
            return Response({'message': 'Password reset successfully.'})
        return Response({'error': 'Invalid or expired OTP.'}, status=400)
    except User.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    user = request.user
    if request.method == 'GET':
        data = UserSerializer(user).data
        if user.role == 'DOCTOR':
            profile = getattr(user, 'doctor_profile', None)
            if profile:
                data['specialization'] = profile.specialization
                data['department'] = profile.department.name if profile.department else None
                data['department_id'] = profile.department.id if profile.department else None
                data['is_approved'] = profile.is_approved
        elif user.role == 'PATIENT':
            profile = getattr(user, 'patient_profile', None)
            if profile:
                data['phone_number'] = profile.phone_number
                data['personal_details'] = profile.personal_details
                data['patient_id'] = profile.patient_id
        return Response(data)

    elif request.method == 'PUT':
        # Validations and Core Updates
        email = request.data.get('email')
        if email and email != user.email:
            if User.objects.filter(email=email).exclude(id=user.id).exists():
                return Response({'error': 'An account with this email already exists.'}, status=400)
            user.email = email

        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.address = request.data.get('address', user.address)
        user.gender = request.data.get('gender', user.gender)
        age = request.data.get('age')
        if age is not None and str(age).isdigit():
            user.age = int(age)
        user.save()

        # Update Profile fields
        if user.role == 'DOCTOR':
            profile = getattr(user, 'doctor_profile', None)
            if profile:
                profile.specialization = request.data.get('specialization', profile.specialization)
                # Department update
                dept_id = request.data.get('department_id')
                if dept_id:
                    try:
                        dept = Department.objects.get(id=dept_id)
                        profile.department = dept
                    except Department.DoesNotExist:
                        pass
                profile.save()
                
        elif user.role == 'PATIENT':
            profile = getattr(user, 'patient_profile', None)
            if profile:
                phone_number = request.data.get('phone_number')
                if phone_number and phone_number != profile.phone_number:
                    if not re.match(r'^\d{10}$', phone_number):
                        return Response({'error': 'Phone number must be exactly 10 digits.'}, status=400)
                    if PatientProfile.objects.filter(phone_number=phone_number).exclude(id=profile.id).exists():
                        return Response({'error': 'This phone number is already registered.'}, status=400)
                    profile.phone_number = phone_number
                    
                profile.personal_details = request.data.get('personal_details', profile.personal_details)
                profile.save()
        
        return Response({'message': 'Profile updated successfully.'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]

class DoctorProfileViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class PatientProfileViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer
        
    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Appointment.objects.all()
        elif user.role == 'DOCTOR':
            return Appointment.objects.filter(doctor=user.doctor_profile)
        elif user.role == 'PATIENT':
            return Appointment.objects.filter(patient=user.patient_profile)
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'PATIENT':
            raise ValidationError("Only patients can book appointments.")
        serializer.save(patient=user.patient_profile)
