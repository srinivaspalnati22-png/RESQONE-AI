import os
from dotenv import load_dotenv

# Load .ENV file from root directory
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.ENV')
load_dotenv(dotenv_path)

class Settings:
    SUPABASE_PROJECT_ID: str = os.getenv("SUPABASE_PROJECT_ID", "wxucgspsyekiwbxjjrnw")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://wxucgspsyekiwbxjjrnw.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "sb_publishable_fQZhN68OEha0pVzuJ7dHWw_QRB2WzYI")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "sb_publishable_fQZhN68OEha0pVzuJ7dHWw_QRB2WzYI")
    DEMO_MODE: bool = True
    APP_NAME: str = "RESQONE AI+ Intelligence Platform"
    VERSION: str = "1.0.0"

settings = Settings()
