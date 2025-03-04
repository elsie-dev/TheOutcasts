from django.test import TestCase
from tasks.models import Task, TaskTransitionLog


class TaskModelTestCase(TestCase):
    """Test cases for the Task model and its state transitions."""

    def setUp(self):
        self.task = Task.objects.create(
            title="Sample Task",
            description="This is a sample task for testing."
        )

    def test_initial_status(self):
        self.assertEqual(self.task.status, "PENDING")

    def test_valid_status_transition(self):
        """Test valid status transitions."""
        self.task.change_status("IN_PROGRESS")
        self.assertEqual(self.task.status, "IN_PROGRESS")

        self.task.change_status("COMPLETED")
        self.assertEqual(self.task.status, "COMPLETED")

    def test_invalid_status_transition(self):
        with self.assertRaises(ValueError):
            self.task.change_status("COMPLETED")

    def test_transition_log_creation(self):
        self.task.change_status("IN_PROGRESS")
        self.assertEqual(self.task.transition_logs.count(), 1)

        log = self.task.transition_logs.first()
        self.assertEqual(log.status_from, "PENDING")
        self.assertEqual(log.status_to, "IN_PROGRESS")

    def test_str_representation(self):
        self.assertEqual(str(self.task), "Sample Task (PENDING)")


class TaskTransitionLogTestCase(TestCase):

    def setUp(self):
        self.task = Task.objects.create(
            title="Sample Task",
            description="This is a sample task for testing."
        )
        self.task.change_status("IN_PROGRESS")

    def test_log_creation(self):
        """Test if a log entry is created properly."""
        log = TaskTransitionLog.objects.first()
        self.assertIsNotNone(log)
        self.assertEqual(log.task, self.task)
        self.assertEqual(log.status_from, "PENDING")
        self.assertEqual(log.status_to, "IN_PROGRESS")

    def test_log_str_representation(self):
        log = TaskTransitionLog.objects.first()
        self.assertEqual(
            str(log), "PENDING -> IN_PROGRESS on {}".format(log.timestamp)
        )
