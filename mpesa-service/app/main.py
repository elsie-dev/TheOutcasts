from fastapi import FastAPI, HTTPException, Request
from prometheus_client import make_asgi_app
from starlette.routing import Mount

from pydantic import BaseModel

from .models import STKPushRequest, STKPushResponse, PaymentStatusResponse, HealthResponse
from .mpesa import initiate_stk_push
from .sms import send_sms
from . import metrics, chaos

# In-memory store for pending/completed payments (demo only)
_payments: dict[str, dict] = {}

app = FastAPI(
    title="M-Pesa Paybill Microservice",
    description="STK Push payments with real SMS notifications via Africa's Talking",
    version="1.0.0",
)

# Mount Prometheus metrics at /metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


class ChaosInjectRequest(BaseModel):
    scenario: str


@app.post("/api/v1/chaos/inject", tags=["chaos"])
async def chaos_inject(body: ChaosInjectRequest):
    """Inject a failure scenario. Options: LATENCY | ERROR_RAIN | SMS_BLOCK"""
    try:
        return chaos.inject(body.scenario)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/v1/chaos/stop", tags=["chaos"])
async def chaos_stop():
    """Stop the active chaos scenario."""
    return chaos.stop()


@app.get("/api/v1/chaos/status", tags=["chaos"])
async def chaos_status():
    """Get current chaos state and recent event log."""
    return chaos.get_status()


@app.get("/health", response_model=HealthResponse, tags=["ops"])
async def health():
    return HealthResponse(status="healthy", service="mpesa-service", version="1.0.0")


@app.post("/api/v1/payment/stk-push", response_model=STKPushResponse, tags=["payments"])
async def stk_push(body: STKPushRequest):
    """
    Initiate an STK Push to the customer's phone.
    On success, sends a real SMS via Africa's Talking: "Payment of KES X initiated".
    """
    try:
        result = await initiate_stk_push(
            phone_number=body.phone_number,
            amount=body.amount,
            account_reference=body.account_reference,
            transaction_desc=body.transaction_desc,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Daraja API error: {exc}")

    checkout_id = result.get("CheckoutRequestID", "")

    # Track pending payment
    _payments[checkout_id] = {
        "status": "pending",
        "amount": body.amount,
        "phone": body.phone_number,
    }

    # Send real SMS notification via Africa's Talking
    sms_message = (
        f"[Chaos Demo] STK Push of KES {body.amount} initiated to Paybill "
        f"{body.account_reference}. Awaiting PIN confirmation."
    )
    sms_ok = await send_sms(sms_message, sms_type="initiated")

    return STKPushResponse(
        merchant_request_id=result.get("MerchantRequestID", ""),
        checkout_request_id=checkout_id,
        response_code=result.get("ResponseCode", ""),
        response_description=result.get("ResponseDescription", ""),
        customer_message=result.get("CustomerMessage", ""),
        sms_sent=sms_ok,
        sms_message=sms_message if sms_ok else None,
    )


@app.post("/api/v1/payment/callback", tags=["payments"])
async def mpesa_callback(request: Request):
    """
    Safaricom calls this URL after the customer enters their M-Pesa PIN.
    Sends a confirmation or failure SMS to your phone.
    """
    body = await request.json()

    stk_callback = body.get("Body", {}).get("stkCallback", {})
    result_code = stk_callback.get("ResultCode")
    checkout_id = stk_callback.get("CheckoutRequestID", "")

    payment = _payments.get(checkout_id, {})

    if result_code == 0:
        # Payment successful — extract metadata
        items = stk_callback.get("CallbackMetadata", {}).get("Item", [])
        meta = {item["Name"]: item.get("Value") for item in items}

        amount = meta.get("Amount", payment.get("amount", "?"))
        receipt = meta.get("MpesaReceiptNumber", "N/A")

        _payments[checkout_id] = {"status": "confirmed", "receipt": receipt, "amount": amount}
        metrics.payment_confirmed_total.inc()
        metrics.active_payments_gauge.dec()

        sms_message = (
            f"[Chaos Demo] Payment CONFIRMED! KES {amount} received. "
            f"Receipt: {receipt}. Service is healthy."
        )
        await send_sms(sms_message, sms_type="confirmed")

    else:
        result_desc = stk_callback.get("ResultDesc", "Unknown error")
        _payments[checkout_id] = {"status": "failed", "reason": result_desc}
        metrics.payment_failed_total.inc()
        metrics.active_payments_gauge.dec()

        sms_message = f"[Chaos Demo] Payment FAILED: {result_desc}"
        await send_sms(sms_message, sms_type="failed")

    return {"ResultCode": 0, "ResultDesc": "Accepted"}


@app.get("/api/v1/payment/status/{checkout_request_id}", response_model=PaymentStatusResponse, tags=["payments"])
async def payment_status(checkout_request_id: str):
    payment = _payments.get(checkout_request_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return PaymentStatusResponse(checkout_request_id=checkout_request_id, status=payment["status"])
