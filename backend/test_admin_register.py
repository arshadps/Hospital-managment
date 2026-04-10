import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_booking.settings')
django.setup()

from api.serializers import DoctorRegistrationSerializer
from rest_framework.test import APIRequestFactory
from api.models import User

factory = APIRequestFactory()
request = factory.post('/fake/')
request.user = User.objects.filter(role='ADMIN').first()

data = {
    'first_name': 'Test',
    'last_name': 'Doc',
    'username': 'uniqueuser123',
    'email': 'uniqueuser123@hospital.com',
    'age': 30,
    'gender': 'MALE',
    'address': '123 Fake St',
    'department_id': 1,
    'specialization': 'Test Spec'
}

serializer = DoctorRegistrationSerializer(data=data, context={'request': request})
if serializer.is_valid():
    try:
        serializer.save()
        print("SUCCESS! User created.")
    except Exception as e:
        import traceback
        traceback.print_exc()
else:
    print("VALIDATION ERROR:", serializer.errors)
