from django.db import models

TASK_TRANSITION_GRAPH = {
    "PENDING": ["IN_PROGRESS", "CANCELLED"],
    "IN_PROGRESS": ["COMPLETED", "CANCELLED"],
    "COMPLETED": [],
    "CANCELLED": [],
}

TASK_STATUSES = (
    ("PENDING", "PENDING"),
    ("IN_PROGRESS", "IN_PROGRESS"),
    ("COMPLETED", "COMPLETED"),
    ("CANCELLED", "CANCELLED"),
)


class Task(models.Model):
    """Task model with state transitions."""

    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=TASK_STATUSES, default="PENDING"
    )

    _transition_graph = TASK_TRANSITION_GRAPH

    def change_status(self, new_status):
        """Change the status of the task, logging the transition."""
        if new_status not in self._transition_graph[self.status]:
            raise ValueError(
                f"Cannot transition from {self.status} to {new_status}."
            )

        TaskTransitionLog.objects.create(
            task=self, status_from=self.status, status_to=new_status
        )

        self.status = new_status
        self.save()

    def __str__(self):
        return f"{self.title} ({self.status})"


class TaskTransitionLog(models.Model):
    """Logs transitions between task statuses."""

    task = models.ForeignKey(
        "Task",
        on_delete=models.PROTECT,
        related_name="transition_logs",
    )
    status_from = models.CharField(max_length=20, choices=TASK_STATUSES)
    status_to = models.CharField(max_length=20, choices=TASK_STATUSES)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.status_from} -> {self.status_to} on {self.timestamp}"