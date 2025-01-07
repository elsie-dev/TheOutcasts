from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from replay.models import ReplaySession, ReplayLog, ReplayStatusTransitionLog

User = get_user_model()

class ReplaySessionViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
            date_of_birth="1990-01-01",
            gender="Male",
        )
        self.client.force_authenticate(user=self.user)

        self.replay_session = ReplaySession.objects.create(
            user=self.user,
            name="Test Replay Session",
            description="A test replay session.",
            status="CREATED",
        )

    def test_list_replay_sessions(self):
        response = self.client.get("/api/replay/sessions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_replay_session(self):
        data = {
            "user": self.user.id,
            "name": "New Replay Session",
            "description": "Another test replay session.",
            "status": "CREATED",
        }
        response = self.client.post("/api/replay/sessions/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReplaySession.objects.count(), 2)

    def test_update_replay_session(self):
        data = {"name": "Updated Replay Session"}
        response = self.client.patch(f"/api/replay/sessions/{self.replay_session.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.replay_session.refresh_from_db()
        self.assertEqual(self.replay_session.name, "Updated Replay Session")

    def test_delete_replay_session(self):
        response = self.client.delete(f"/api/replay/sessions/{self.replay_session.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReplaySession.objects.count(), 0)


class ReplayLogViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
            date_of_birth="1990-01-01",
            gender="Male",
        )
        self.client.force_authenticate(user=self.user)
        self.replay_session = ReplaySession.objects.create(
            user=self.user,
            name="Test Replay Session",
            description="A test replay session.",
            status="CREATED",
        )
        self.replay_log = ReplayLog.objects.create(
            replay=self.replay_session,
            action="Test action",
        )

    def test_list_replay_logs(self):
        response = self.client.get("/api/replay/logs/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_replay_log(self):
        data = {
            "replay": self.replay_session.id,
            "action": "New test action",
        }
        response = self.client.post("/api/replay/logs/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReplayLog.objects.count(), 2)

    def test_delete_replay_log(self):
        response = self.client.delete(f"/api/replay/logs/{self.replay_log.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReplayLog.objects.count(), 0)


class ReplayStatusTransitionLogViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="password123",
            first_name="Test",
            last_name="User",
            date_of_birth="1990-01-01",
            gender="Male",
        )
        self.client.force_authenticate(user=self.user)
        self.replay_session = ReplaySession.objects.create(
            user=self.user,
            name="Test Replay Session",
            description="A test replay session.",
            status="CREATED",
        )
        self.transition_log = ReplayStatusTransitionLog.objects.create(
            replay_session=self.replay_session,
            status_from="CREATED",
            status_to="RUNNING",
        )

    def test_list_transition_logs(self):
        response = self.client.get("/api/replay/transitions/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_transition_log(self):
        data = {
            "replay_session": self.replay_session.id,
            "status_from": "RUNNING",
            "status_to": "COMPLETED",
        }
        response = self.client.post("/api/replay/transitions/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReplayStatusTransitionLog.objects.count(), 2)

    def test_delete_transition_log(self):
        response = self.client.delete(f"/api/replay/transitions/{self.transition_log.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(ReplayStatusTransitionLog.objects.count(), 0)
