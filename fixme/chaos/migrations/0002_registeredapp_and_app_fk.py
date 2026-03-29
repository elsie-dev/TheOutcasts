import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chaos', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RegisteredApp',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('base_url', models.CharField(blank=True, default='', max_length=255)),
                ('status', models.CharField(
                    choices=[('HEALTHY', 'Healthy'), ('DEGRADED', 'Degraded'), ('DOWN', 'Down')],
                    default='HEALTHY',
                    max_length=20,
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.AddField(
            model_name='chaosconfig',
            name='app',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='chaos_configs',
                to='chaos.registeredapp',
            ),
        ),
        migrations.AddField(
            model_name='chaosevent',
            name='app',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='chaos_events',
                to='chaos.registeredapp',
            ),
        ),
    ]
