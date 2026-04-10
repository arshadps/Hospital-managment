from rest_framework import serializers
from .models import User, Department, DoctorProfile, PatientProfile, Appointment
import random
import string
from django.core.mail import send_mail
from django.conf import settings


# -------------------- COMMON USER --------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'address', 'gender', 'age']


# -------------------- DOCTOR REGISTRATION --------------------
class DoctorRegistrationSerializer(serializers.ModelSerializer):
    department_id = serializers.IntegerField(write_only=True)
    address = serializers.CharField(write_only=True)
    gender = serializers.CharField(write_only=True)
    age = serializers.IntegerField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'address', 'gender', 'age', 'department_id']

    # ✅ USERNAME VALIDATION
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def create(self, validated_data):
        dept_id = validated_data.pop('department_id')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        username = validated_data.pop('username')
        address = validated_data.pop('address')
        gender = validated_data.pop('gender')
        age = validated_data.pop('age')

        request = self.context.get('request')
        is_admin = request and request.user.is_authenticated and getattr(request.user, 'role', '') == 'ADMIN'

        password = ''.join(random.choices(string.digits, k=6))

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password,
            first_name=first_name,
            last_name=last_name,
            address=address,
            gender=gender,
            age=age,
            role='DOCTOR'
        )

        DoctorProfile.objects.create(
            user=user,
            department=Department.objects.get(id=dept_id),
            specialization='',
            is_approved=is_admin
        )

        msg = f'Your doctor account has been created.\nUsername: {username}\nPassword: {password}'
        if not is_admin:
            msg += '\n\nPlease wait for admin approval before logging in.'
        else:
            msg += '\n\nYour account has been pre-approved by the Admin.'

        send_mail(
            'Doctor Registration - Hospital Booking',
            msg,
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=True,
        )

        return user


# -------------------- PATIENT REGISTRATION --------------------
class PatientRegistrationSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(write_only=True)
    last_name = serializers.CharField(write_only=True)
    username = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    gender = serializers.CharField(write_only=True)
    age = serializers.IntegerField(write_only=True)
    phone_number = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'address', 'gender', 'age', 'phone_number']

    # ✅ USERNAME VALIDATION (MAIN FIX)
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    # ✅ PHONE VALIDATION
    def validate_phone_number(self, value):
        import re

        if value and not re.match(r'^\d{10}$', value):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")

        if PatientProfile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")

        return value

    def create(self, validated_data):
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        username = validated_data.pop('username')
        address = validated_data.pop('address')
        gender = validated_data.pop('gender')
        age = validated_data.pop('age')
        phone_number = validated_data.pop('phone_number')

        password = ''.join(random.choices(string.digits, k=6))

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password,
            first_name=first_name,
            last_name=last_name,
            address=address,
            gender=gender,
            age=age,
            role='PATIENT'
        )

        profile = PatientProfile.objects.create(
            user=user,
            personal_details='',
            phone_number=phone_number
        )

        send_mail(
            'Patient Registration - Hospital Booking',
            f'Account created successfully. Patient ID: {profile.patient_id}. Password: {password}',
            settings.EMAIL_HOST_USER,
            [user.email],
            fail_silently=True,
        )

        return user


# -------------------- DEPARTMENT --------------------
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# -------------------- DOCTOR PROFILE --------------------
class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = '__all__'


# -------------------- PATIENT PROFILE --------------------
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PatientProfile
        fields = '__all__'


# -------------------- APPOINTMENT --------------------
class AppointmentSerializer(serializers.ModelSerializer):
    doctor = DoctorProfileSerializer(read_only=True)
    patient = PatientProfileSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'


# -------------------- CREATE APPOINTMENT --------------------
class AppointmentCreateSerializer(serializers.ModelSerializer):
    personal_details = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Appointment
        fields = ['doctor', 'appointment_date', 'personal_details']

    def validate(self, data):
        doctor = data['doctor']
        date = data['appointment_date']

        request = self.context.get('request')

        # ❌ Prevent duplicate booking
        if request and hasattr(request.user, 'patient_profile'):
            patient = request.user.patient_profile
            if Appointment.objects.filter(doctor=doctor, appointment_date=date, patient=patient).exists():
                raise serializers.ValidationError(
                    "You have already booked an appointment with this doctor on this day."
                )

        # ❌ Limit per day = 5
        count = Appointment.objects.filter(doctor=doctor, appointment_date=date).count()
        if count >= 5:
            from datetime import timedelta
            next_date = date + timedelta(days=1)

            while Appointment.objects.filter(doctor=doctor, appointment_date=next_date).count() >= 5:
                next_date += timedelta(days=1)

            raise serializers.ValidationError(
                f"Booking full. Try next available date: {next_date.strftime('%Y-%m-%d')}"
            )

        return data

    def create(self, validated_data):
        details = validated_data.pop('personal_details', None)
        appointment = super().create(validated_data)

        if details:
            patient = appointment.patient
            patient.personal_details = details
            patient.save()

        return appointment