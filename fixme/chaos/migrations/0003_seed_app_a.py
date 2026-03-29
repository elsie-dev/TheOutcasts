from django.db import migrations


def seed_app_a(apps, schema_editor):
    RegisteredApp = apps.get_model('chaos', 'RegisteredApp')
    RegisteredApp.objects.get_or_create(
        name='App A',
        defaults={
            'description': 'Primary target application for chaos experiments.',
            'base_url': 'http://localhost:8000',
            'status': 'HEALTHY',
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('chaos', '0002_registeredapp_and_app_fk'),
    ]

    operations = [
        migrations.RunPython(seed_app_a, migrations.RunPython.noop),
    ]
