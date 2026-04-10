from django.db import models
from django.contrib.auth.models import AbstractUser
import random

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('DOCTOR', 'Doctor'),
        ('PATIENT', 'Patient'),
    )
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PATIENT')
    email = models.EmailField(unique=True)
    address = models.TextField(blank=True, null=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def save(self, *args, **kwargs):
        if self.is_superuser:
            self.role = 'ADMIN'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    is_approved = models.BooleanField(default=False)
    specialization = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"

class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    patient_id = models.CharField(max_length=10, unique=True, blank=True)
    personal_details = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.patient_id:
            self.patient_id = 'PAT' + str(random.randint(100000, 999999))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.patient_id} - {self.user.first_name}"

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('NOT_CONSULTED', 'Not Consulted'),
        ('CONSULTED', 'Consulted'),
    )
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_CONSULTED')
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} with {self.doctor} on {self.appointment_date}"

class OTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)
    
    def __str__(self):
        return f"OTP for {self.user.email}"
