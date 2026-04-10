import urllib.request, json

data = json.dumps({'username': 'superadmin', 'password': 'password123'}).encode()
req = urllib.request.Request('http://localhost:8000/api/auth/login/', data=data, headers={'Content-Type': 'application/json'})
token = json.loads(urllib.request.urlopen(req).read())['access']

docData = json.dumps({
    'first_name': 'Test2',
    'last_name': 'Doc2',
    'username': 'uniqueuser789',
    'email': 'uniqueuser789@hospital.com',
    'age': "40",
    'gender': 'MALE',
    'address': '123 Fake St',
    'department_id': "1",
    'specialization': 'Test Spec'
}).encode()

req2 = urllib.request.Request('http://localhost:8000/api/doctors/admin-register/', data=docData, headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'})
try:
    res = urllib.request.urlopen(req2)
    print("Status:", res.status)
    print("Response:", res.read())
except urllib.error.HTTPError as e:
    print("ERROR STATUS:", e.status)
    print("ERROR BODY:", e.read())
