import os
import sys

# Ensure backend module can be imported from root directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app

# Export FastAPI instance for Vercel Serverless Functions
app = app
