import json
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from .models import User


class HrApiTests(TestCase):
    def setUp(self):
        self.employee = User.objects.get(email='employee@dayflow.com')

    def employee_token(self):
        response = self.client.post(
            '/api/hr/auth/employee-login/',
            data=json.dumps({'loginId': self.employee.email, 'password': 'Dayflow@123'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        return response.json()['token']

    def admin_login(self):
        response = self.client.post(
            '/api/auth/login/',
            data=json.dumps({'email': 'admin@gmail.com', 'password': '1234567890'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)

    def test_employee_check_in_is_visible_to_admin(self):
        token = self.employee_token()
        check_in = self.client.post(
            '/api/hr/attendance/check-in/',
            data='{}',
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(check_in.status_code, 201)

        self.admin_login()
        employees = self.client.get('/api/hr/employees/')
        self.assertEqual(employees.status_code, 200)
        employee = next(item for item in employees.json()['employees'] if item['email'] == self.employee.email)
        self.assertIn(employee['status'], {'Present', 'Late'})
        self.assertTrue(employee['checkIn'])

    def test_employee_leave_can_be_approved_by_admin(self):
        token = self.employee_token()
        leave_date = (timezone.localdate() + timedelta(days=3)).isoformat()
        create_response = self.client.post(
            '/api/hr/leave-requests/',
            data=json.dumps({
                'leaveType': 'annual',
                'startDate': leave_date,
                'endDate': leave_date,
                'reason': 'Family event',
            }),
            content_type='application/json',
            HTTP_AUTHORIZATION=f'Bearer {token}',
        )
        self.assertEqual(create_response.status_code, 201)

        self.admin_login()
        request_id = create_response.json()['request']['id']
        decision = self.client.patch(
            f'/api/hr/leave-requests/{request_id}/',
            data=json.dumps({'status': 'approved', 'reviewerComment': 'Approved'}),
            content_type='application/json',
        )
        self.assertEqual(decision.status_code, 200)
        self.assertEqual(decision.json()['request']['status'], 'approved')
