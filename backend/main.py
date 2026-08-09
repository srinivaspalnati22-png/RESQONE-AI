import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.routers import emergency, hospitals, donors, snakebite
from backend.services.supabase_service import SupabaseService

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="RESQONE AI+ — Unified AI-Powered Offline Emergency Intelligence Ecosystem Backend"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(emergency.router)
app.include_router(hospitals.router)
app.include_router(donors.router)
app.include_router(snakebite.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "supabase_connected": True
    }

@app.get("/api/volunteers")
def get_volunteers():
    return SupabaseService.get_volunteers()

@app.get("/api/activity-logs")
def get_activity_logs():
    return SupabaseService.get_activity_logs()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
