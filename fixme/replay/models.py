from django.db import models
from fixme.authentication.models import User

REPLAY_STATUS_TRANSITION_GRAPH = {
    "CREATED": ["RUNNING", "FAILED", "COMPLETED"],
    "RUNNING": ["FAILED", "COMPLETED"],
    "FAILED": [],
    "COMPLETED": [],
}

class ReplaySession(models.Model):
    """
    Represents a replay session for debugging incidents.
    """

    STATUS_CHOICES = [
        ("CREATED", "CREATED"),
        ("RUNNING", "RUNNING"),
        ("FAILED", "FAILED"),
        ("COMPLETED", "COMPLETED"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="replays")
    name = models.CharField(max_length=100)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="CREATED"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    _transition_graph = REPLAY_STATUS_TRANSITION_GRAPH

    def change_status(self, new_status):
        """
        Change the status of the replay session, logging the transition.
        """
        if new_status not in self._transition_graph[self.status]:
            raise ValueError(
                f"Invalid transition from {self.status} to {new_status}."
            )

        ReplayStatusTransitionLog.objects.create(
            replay_session=self,
            status_from=self.status,
            status_to=new_status,
        )

        self.status = new_status
        self.save()

    def __str__(self):
        return f"{self.name} ({self.status})"

class ReplayStatusTransitionLog(models.Model):
    """
    Logs status transitions for replay sessions.
    """
    replay_session = models.ForeignKey(
        ReplaySession, on_delete=models.CASCADE, related_name="transition_logs"
    )
    status_from = models.CharField(max_length=20, choices=ReplaySession.STATUS_CHOICES)
    status_to = models.CharField(max_length=20, choices=ReplaySession.STATUS_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.status_from} -> {self.status_to} ({self.timestamp})"

class ReplayLog(models.Model):
    """
    Logs actions performed during the replay session.
    """
    replay = models.ForeignKey(
        ReplaySession, on_delete=models.CASCADE, related_name="logs"
    )
    action = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log for {self.replay.name} at {self.timestamp}"
