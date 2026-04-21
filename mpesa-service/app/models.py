from pydantic import BaseModel, Field
from typing import Optional


class STKPushRequest(BaseModel):
    phone_number: str = Field(..., example="254708374149", description="Phone in 2547XXXXXXXX format")
    amount: int = Field(..., ge=1, example=1, description="Amount in KES")
    account_reference: str = Field(default="ChaosDemo", max_length=12)
    transaction_desc: str = Field(default="Chaos Engineering Test Payment", max_length=13)


class STKPushResponse(BaseModel):
    merchant_request_id: str
    checkout_request_id: str
    response_code: str
    response_description: str
    customer_message: str
    sms_sent: bool
    sms_message: Optional[str] = None


class CallbackMetadata(BaseModel):
    amount: Optional[float] = None
    mpesa_receipt: Optional[str] = None
    phone_number: Optional[str] = None


class PaymentStatusResponse(BaseModel):
    checkout_request_id: str
    status: str
    metadata: Optional[CallbackMetadata] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
