#!/usr/bin/env python3
import json
import urllib.request
import urllib.error

API_BASE = 'http://localhost:8000/api'

print('=' * 60)
print('TEST 1: Register New User')
print('=' * 60)

data = {
    'email': 'autotest999@example.com',
    'password': 'Test1234',
    'password_confirm': 'Test1234',
    'first_name': 'Auto',
    'last_name': 'Test',
    'phone': '01077777777',
    'phone_verified': True,
    'terms_agreed': True,
    'privacy_agreed': True,
    'marketing_agreed': False
}

register_success = False
try:
    req = urllib.request.Request(
        API_BASE + '/auth/register/',
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('SUCCESS: Register')
        print('Status:', response.status)
        print('Response:', json.dumps(result, indent=2))
        register_success = True
        
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print('FAILED: Register')
    print('Status:', e.code)
    print('Error:', error_body)
except Exception as e:
    print('EXCEPTION:', str(e))

print()
print('=' * 60)
print('TEST 2: Login with Created Account')
print('=' * 60)

login_data = {
    'email': 'autotest999@example.com',
    'password': 'Test1234'
}

login_success = False
try:
    req = urllib.request.Request(
        API_BASE + '/auth/login/',
        data=json.dumps(login_data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('SUCCESS: Login')
        print('Status:', response.status)
        print('Response:', json.dumps(result, indent=2))
        login_success = True
        
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print('FAILED: Login')
    print('Status:', e.code)
    print('Error:', error_body)
except Exception as e:
    print('EXCEPTION:', str(e))

print()
print('=' * 60)
print('TEST 3: Get Members List')
print('=' * 60)

members_success = False
try:
    req = urllib.request.Request(
        API_BASE + '/members/',
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=10) as response:
        result = json.loads(response.read().decode('utf-8'))
        print('SUCCESS: Get Members')
        print('Status:', response.status)
        print('Total Members:', len(result))
        if result:
            print('Sample Member:', json.dumps(result[0], indent=2))
        members_success = True
        
except urllib.error.HTTPError as e:
    error_body = e.read().decode('utf-8')
    print('FAILED: Get Members')
    print('Status:', e.code)
    print('Error:', error_body)
except Exception as e:
    print('EXCEPTION:', str(e))

print()
print('=' * 60)
print('SUMMARY')
print('=' * 60)
print('Register:', 'PASS' if register_success else 'FAIL')
print('Login:', 'PASS' if login_success else 'FAIL')
print('Get Members:', 'PASS' if members_success else 'FAIL')
print()

if register_success and login_success:
    print('All critical tests PASSED!')
    print('Web registration works!')
    print('Login works!')
    print('You can use this account in the mobile app!')
else:
    print('Some critical tests FAILED')
    print('Please check the errors above')










