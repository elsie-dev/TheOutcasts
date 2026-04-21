from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # M-Pesa Daraja sandbox
    MPESA_CONSUMER_KEY: str = "your_consumer_key_here"
    MPESA_CONSUMER_SECRET: str = "your_consumer_secret_here"
    MPESA_BASE_URL: str = "https://sandbox.safaricom.co.ke"
    MPESA_SHORTCODE: str = "174379"
    MPESA_PASSKEY: str = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    MPESA_CALLBACK_URL: str = "https://your-ngrok-url.ngrok.io/api/v1/payment/callback"

    # Africa's Talking
    AT_USERNAME: str = "sandbox"
    AT_API_KEY: str = "your_africastalking_api_key_here"
    AT_SENDER_ID: str = ""          # leave blank for sandbox shortcode
    AT_NOTIFY_PHONE: str = "+254700000000"  # your real phone number here

    class Config:
        env_file = ".env"


settings = Settings()
