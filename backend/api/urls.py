from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'departments', views.DepartmentViewSet)
router.register(r'doctors', views.DoctorProfileViewSet)
router.register(r'patients', views.PatientProfileViewSet)
router.register(r'appointments', views.AppointmentViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('auth/register/doctor/', views.register_doctor, name='register_doctor'),
    path('doctors/admin-register/', views.admin_register_doctor, name='admin_register_doctor'),
    path('auth/register/patient/', views.register_patient, name='register_patient'),
    path('auth/login/', views.login_view, name='login'),
    path('auth/change-password/', views.change_password, name='change_password'),
    path('auth/password-reset/', views.password_reset_request, name='password_reset_request'),
    path('auth/password-reset-confirm/', views.password_reset_confirm, name='password_reset_confirm'),
    path('auth/profile/', views.user_profile_view, name='user_profile'),
    path('', include(router.urls)),
]
