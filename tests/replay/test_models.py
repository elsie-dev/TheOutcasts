from django.test import TestCase
from fixme.replay.models import ReplaySession, ReplayLog, ReplayStatusTransitionLog
from fixme.authentication.models import User

class ReplaySessionTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", email="testuser@example.com", password="password123"
        )
        self.replay = ReplaySession.objects.create(
            user=self.user, name="Test Replay", description="Test description"
        )

    def test_change_status(self):
        self.replay.change_status("RUNNING")
        self.assertEqual(self.replay.status, "RUNNING")

        log = ReplayStatusTransitionLog.objects.filter(replay_session=self.replay).last()
        self.assertEqual(log.status_from, "CREATED")
        self.assertEqual(log.status_to, "RUNNING")

    def test_invalid_transition(self):
        with self.assertRaises(ValueError):
            self.replay.change_status("COMPLETED")

class ReplayLogTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.replay = ReplaySession.objects.create(user=self.user, name="Test Replay")
        self.log = ReplayLog.objects.create(replay=self.replay, action="Test action")

    def test_log_creation(self):
        self.assertEqual(self.log.replay, self.replay)
        self.assertEqual(self.log.action, "Test action")
