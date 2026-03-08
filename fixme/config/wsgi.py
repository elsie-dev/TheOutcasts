"""
WSGI config for fixme project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""
import os

_newrelic_ini = os.getenv("NEW_RELIC_CONFIG_FILE")
if _newrelic_ini:
    import newrelic.agent
    newrelic.agent.initialize(_newrelic_ini)
    newrelic.agent.register_application()

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "fixme.config.settings")

application = get_wsgi_application()
