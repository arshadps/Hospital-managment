import urllib.request, json

docData = json.dumps({
    'first_name': 'TestPublic',
    'last_name': 'DocPublic',
    'username': 'publicdoc111',
    'email': 'publicdoc111@hospital.com',
    'age': "35",
    'gender': 'FEMALE',
    'address': 'Public St',
    'department_id': "1",
    'specialization': 'General'
}).encode()

req = urllib.request.Request('http://localhost:8000/api/auth/register/doctor/', data=docData, headers={'Content-Type': 'application/json'})
try:
    res = urllib.request.urlopen(req)
    print("Status:", res.status)
    print("Response:", res.read().decode())
except urllib.error.HTTPError as e:
    print("ERROR STATUS:", e.status)
    print("ERROR BODY:", e.read().decode())
