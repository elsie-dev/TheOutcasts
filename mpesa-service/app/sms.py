import time
import africastalking

from .config import settings
from . import metrics, chaos

# Initialise Africa's Talking SDK once at import time
africastalking.initialize(settings.AT_USERNAME, settings.AT_API_KEY)
_sms = africastalking.SMS


async def send_sms(message: str, sms_type: str = "initiated") -> bool:
    """
    Send a real SMS to AT_NOTIFY_PHONE via Africa's Talking.
    Returns True if sent, False on failure.
    sms_type is used only for Prometheus label (initiated | confirmed | failed).
    """
    if chaos.sms_blocked():
        metrics.sms_failed_total.inc()
        return False

    start = time.monotonic()
    try:
        response = _sms.send(message, [settings.AT_NOTIFY_PHONE], settings.AT_SENDER_ID or None)
        recipients = response.get("SMSMessageData", {}).get("Recipients", [])

        if recipients and recipients[0].get("status") == "Success":
            metrics.sms_sent_total.labels(type=sms_type).inc()
            return True

        metrics.sms_failed_total.inc()
        return False

    except Exception:
        metrics.sms_failed_total.inc()
        return False

    finally:
        metrics.sms_duration.observe(time.monotonic() - start)
