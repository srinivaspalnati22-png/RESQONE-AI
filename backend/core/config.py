import os
from dotenv import load_dotenv

# Load .env and .env.local files from root directory
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(root_dir, '.env'))
load_dotenv(os.path.join(root_dir, '.env.local'))
load_dotenv(os.path.join(root_dir, '.ENV'))

class Settings:
    SUPABASE_PROJECT_ID: str = os.getenv("SUPABASE_PROJECT_ID", "wxucgspsyekiwbxjjrnw")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://wxucgspsyekiwbxjjrnw.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "sb_publishable_fQZhN68OEha0pVzuJ7dHWw_QRB2WzYI")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_fQZhN68OEha0pVzuJ7dHWw_QRB2WzYI")
    DEMO_MODE: bool = True
    APP_NAME: str = "RESQONE AI+ Intelligence Platform"
    VERSION: str = "1.0.0"

    # Automated Zero-Touch SMS & WhatsApp Gateway Configuration
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "")
    FAST2SMS_API_KEY: str = os.getenv("FAST2SMS_API_KEY", "")

    # Automated Emergency Email Gateway Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASS: str = os.getenv("SMTP_PASS", "")
    EMERGENCY_ALERT_EMAILS: str = os.getenv("EMERGENCY_ALERT_EMAILS", "")

settings = Settings()
