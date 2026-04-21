from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chaos", "0003_seed_app_a"),
    ]

    operations = [
        migrations.AlterField(
            model_name="chaosconfig",
            name="scenario",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("MEMORY_LEAK", "Memory Leak"),
                    ("NETWORK_LATENCY", "Network Latency"),
                    ("ERROR_RAIN", "Error Rain"),
                    ("LATENCY", "Payment Latency"),
                    ("SMS_BLOCK", "SMS Block"),
                ],
                unique=True,
            ),
        ),
        migrations.AlterField(
            model_name="chaosevent",
            name="scenario",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("MEMORY_LEAK", "Memory Leak"),
                    ("NETWORK_LATENCY", "Network Latency"),
                    ("ERROR_RAIN", "Error Rain"),
                    ("LATENCY", "Payment Latency"),
                    ("SMS_BLOCK", "SMS Block"),
                ],
            ),
        ),
    ]
