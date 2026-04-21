from prometheus_client import Counter, Histogram, Gauge

# STK Push metrics
stk_push_total = Counter(
    "mpesa_stk_push_total",
    "Total number of STK push requests initiated",
    ["status"],  # success | failure
)

stk_push_duration = Histogram(
    "mpesa_stk_push_duration_seconds",
    "Time taken for STK push request to Daraja API",
    buckets=[0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0],
)

payment_confirmed_total = Counter(
    "mpesa_payment_confirmed_total",
    "Total payments confirmed via callback",
)

payment_failed_total = Counter(
    "mpesa_payment_failed_total",
    "Total payments that failed or were cancelled",
)

# SMS metrics
sms_sent_total = Counter(
    "mpesa_sms_sent_total",
    "Total SMS notifications sent via Africa's Talking",
    ["type"],  # initiated | confirmed | failed
)

sms_failed_total = Counter(
    "mpesa_sms_failed_total",
    "Total SMS notifications that failed to send",
)

sms_duration = Histogram(
    "mpesa_sms_duration_seconds",
    "Time taken to send SMS via Africa's Talking",
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0],
)

# Service health
active_payments_gauge = Gauge(
    "mpesa_active_payments",
    "Number of STK push payments awaiting callback",
)
