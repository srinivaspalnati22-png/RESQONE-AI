import os
import json
import logging
from typing import Dict, List, Any
from datetime import datetime

logger = logging.getLogger("resqone.push")

# Standard VAPID Keypair (P-256 / prime256v1)
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "BJSJTBWLkz84VCK-b6NBaLnJ3h7rrf3KV9C8aHjK1FyhYkjLSYvzrBNWqhwhGvEZdMbvYGPwfyck8R4P9vRd2rY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "jUZbI3J1Qf3AfRb7FO1_IN4fdLOy9HZ3P7AsyUbyEko")
VAPID_CLAIMS = {"sub": "mailto:emergency@resqone.ai"}

SUBSCRIPTIONS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "device_subscriptions.json")

class PushService:
    _subscriptions: Dict[str, Dict[str, Any]] = {}
    _loaded = False

    @classmethod
    def _ensure_loaded(cls):
        if cls._loaded:
            return
        os.makedirs(os.path.dirname(SUBSCRIPTIONS_FILE), exist_ok=True)
        if os.path.exists(SUBSCRIPTIONS_FILE):
            try:
                with open(SUBSCRIPTIONS_FILE, "r", encoding="utf-8") as f:
                    cls._subscriptions = json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load subscriptions file: {e}")
                cls._subscriptions = {}
        cls._loaded = True

    @classmethod
    def _save_subscriptions(cls):
        try:
            os.makedirs(os.path.dirname(SUBSCRIPTIONS_FILE), exist_ok=True)
            with open(SUBSCRIPTIONS_FILE, "w", encoding="utf-8") as f:
                json.dump(cls._subscriptions, f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to persist subscriptions file: {e}")

    @classmethod
    def register_device(cls, sub_data: Dict[str, Any]) -> bool:
        cls._ensure_loaded()
        endpoint = sub_data.get("endpoint")
        if not endpoint:
            return False

        cls._subscriptions[endpoint] = {
            "endpoint": endpoint,
            "keys": sub_data.get("keys", {}),
            "user_id": sub_data.get("user_id", "anonymous"),
            "user_name": sub_data.get("user_name", "Community Member"),
            "platform": sub_data.get("platform", "web-pwa"),
            "updated_at": datetime.now().isoformat()
        }
        cls._save_subscriptions()
        logger.info(f"Registered device subscription: {endpoint[:45]}... (Total: {len(cls._subscriptions)})")
        return True

    @classmethod
    def get_registered_devices(cls) -> List[Dict[str, Any]]:
        cls._ensure_loaded()
        return list(cls._subscriptions.values())

    @classmethod
    def broadcast_emergency_push(cls, alert_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transmits RFC 8291/8292 encrypted Web Push notifications to all registered
        application users. The user's operating system (Android, iOS, Windows)
        displays a high-priority heads-up alert with disaster buzz vibration EVEN IF
        THE APPLICATION IS COMPLETELY CLOSED OR PHONE IS LOCKED IN POCKET.
        """
        cls._ensure_loaded()
        try:
            from pywebpush import webpush, WebPushException
        except ImportError:
            logger.error("pywebpush is not installed. Background push aborted.")
            return {
                "success": False,
                "total_devices": len(cls._subscriptions),
                "sent_count": 0,
                "failed_count": len(cls._subscriptions),
                "error": "pywebpush not installed"
            }

        victim_name = alert_data.get("victim_name", "Emergency Citizen")
        blood_group = alert_data.get("blood_group", "O+")
        location_name = alert_data.get("location_name", "Vijayawada Highway Corridor")
        lat = alert_data.get("lat", 16.5167)
        lng = alert_data.get("lng", 80.6500)
        impact_g = alert_data.get("impact_g", 4.85)
        alert_id = alert_data.get("alert_id") or f"alert-{int(datetime.now().timestamp())}"
        tracking_url = alert_data.get("tracking_url") or f"https://resqone-ai.vercel.app/?disaster_alert=true&alert_id={alert_id}&lat={lat}&lng={lng}"

        payload = {
            "title": f"🚨 EMERGENCY RESCUE ALERT: {victim_name}",
            "body": f"CRITICAL ACCIDENT at {location_name} ({blood_group}). Impact: {impact_g}G. Tap to open live route & assist!",
            "victimName": victim_name,
            "bloodGroup": blood_group,
            "locationName": location_name,
            "lat": lat,
            "lng": lng,
            "impactG": impact_g,
            "alertId": alert_id,
            "trackingUrl": tracking_url,
            "vibrate": [1000, 200, 1000, 200, 1500, 300, 1000],
            "timestamp": datetime.now().isoformat()
        }

        payload_json = json.dumps(payload)
        sent_count = 0
        failed_count = 0
        dead_endpoints = []

        for endpoint, sub in cls._subscriptions.items():
            try:
                sub_info = {
                    "endpoint": endpoint,
                    "keys": sub.get("keys", {})
                }
                webpush(
                    subscription_info=sub_info,
                    data=payload_json,
                    vapid_private_key=VAPID_PRIVATE_KEY,
                    vapid_claims=VAPID_CLAIMS,
                    timeout=5
                )
                sent_count += 1
            except WebPushException as ex:
                logger.warning(f"Push to {endpoint[:35]} failed: {ex}")
                failed_count += 1
                if ex.response is not None and ex.response.status_code in (404, 410):
                    dead_endpoints.append(endpoint)
            except Exception as e:
                logger.warning(f"Generic push exception: {e}")
                failed_count += 1

        for ep in dead_endpoints:
            cls._subscriptions.pop(ep, None)
        if dead_endpoints:
            cls._save_subscriptions()

        return {
            "success": True,
            "total_devices": len(cls._subscriptions),
            "sent_count": sent_count,
            "failed_count": failed_count,
            "alert_id": alert_id,
            "timestamp": datetime.now().isoformat()
        }
