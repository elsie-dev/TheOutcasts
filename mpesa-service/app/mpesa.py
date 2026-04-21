import base64
import time
from datetime import datetime

import httpx

from .config import settings
from . import metrics, chaos


def _generate_password(shortcode: str, passkey: str, timestamp: str) -> str:
    raw = f"{shortcode}{passkey}{timestamp}"
    return base64.b64encode(raw.encode()).decode()


async def get_access_token() -> str:
    credentials = base64.b64encode(
        f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}".encode()
    ).decode()

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{settings.MPESA_BASE_URL}/oauth/v1/generate",
            params={"grant_type": "client_credentials"},
            headers={"Authorization": f"Basic {credentials}"},
            timeout=15.0,
        )
        response.raise_for_status()
        return response.json()["access_token"]


async def initiate_stk_push(
    phone_number: str,
    amount: int,
    account_reference: str,
    transaction_desc: str,
) -> dict:
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    password = _generate_password(settings.MPESA_SHORTCODE, settings.MPESA_PASSKEY, timestamp)

    token = await get_access_token()

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone_number,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": settings.MPESA_CALLBACK_URL,
        "AccountReference": account_reference,
        "TransactionDesc": transaction_desc,
    }

    await chaos.maybe_apply_latency()

    start = time.monotonic()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={"Authorization": f"Bearer {token}"},
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

        metrics.stk_push_total.labels(status="success").inc()
        metrics.active_payments_gauge.inc()
        return data

    except Exception:
        metrics.stk_push_total.labels(status="failure").inc()
        raise

    finally:
        metrics.stk_push_duration.observe(time.monotonic() - start)
