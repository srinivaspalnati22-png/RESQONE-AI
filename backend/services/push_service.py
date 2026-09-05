import os
import json
import logging
import tempfile
from typing import Dict, List, Any, Optional
from datetime import datetime

logger = logging.getLogger("resqone.push")

# Standard VAPID Keypair (P-256 / prime256v1)
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "BJSJTBWLkz84VCK-b6NBaLnJ3h7rrf3KV9C8aHjK1FyhYkjLSYvzrBNWqhwhGvEZdMbvYGPwfyck8R4P9vRd2rY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "jUZbI3J1Qf3AfRb7FO1_IN4fdLOy9HZ3P7AsyUbyEko")
VAPID_CLAIMS = {"sub": "mailto:emergency@resqone.ai"}

def _get_storage_files() -> List[str]:
    """Returns persistent file paths for subscriptions (local project folder + /tmp fallback)."""
    paths = []
    # 1. Project data directory
    local_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "device_subscriptions.json")
    paths.append(local_path)
    # 2. System temp directory (always writable on Linux, Vercel, AWS Lambda, Docker)
    tmp_path = os.path.join(tempfile.gettempdir(), "resqone_device_subscriptions.json")
    if tmp_path not in paths:
        paths.append(tmp_path)
    return paths

class PushService:
    _subscriptions: Dict[str, Dict[str, Any]] = {}
    _loaded = False

    @classmethod
    def _ensure_loaded(cls):
        if cls._loaded and cls._subscriptions:
            return
        
        for filepath in _get_storage_files():
            if os.path.exists(filepath):
                try:
                    with open(filepath, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if isinstance(data, dict):
                            cls._subscriptions.update(data)
                            logger.info(f"Loaded {len(data)} push subscriptions from {filepath}")
                except Exception as e:
                    logger.warning(f"Could not read subscriptions from {filepath}: {e}")
        cls._loaded = True

    @classmethod
    def _save_subscriptions(cls):
        saved = False
        for filepath in _get_storage_files():
            try:
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump(cls._subscriptions, f, indent=2)
                saved = True
            except Exception as e:
                logger.debug(f"Save subscriptions skipped for {filepath}: {e}")
        if not saved:
            logger.warning("Could not persist subscriptions to disk.")

    @classmethod
    def register_device(cls, sub_data: Dict[str, Any]) -> bool:
        cls._ensure_loaded()
        endpoint = sub_data.get("endpoint")
        if not endpoint:
            return False

        cls._subscriptions[endpoint] = {
            "endpoint": endpoint,
            "keys": sub_data.get("keys", {}),
            "device_id": sub_data.get("device_id") or f"dev_{hash(endpoint) & 0xffffffff}",
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
        application users EXCEPT THE VICTIM'S OWN PHONE.
        The other users' operating systems (Android, iOS, Windows)
        display a high-priority heads-up alert with disaster buzz vibration EVEN IF
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

        category = alert_data.get("category", "ACCIDENT").upper()
        victim_name = alert_data.get("victim_name", "Emergency Citizen")
        blood_group = alert_data.get("blood_group", "O+")
        location_name = alert_data.get("location_name", "Vijayawada Highway Corridor")
        lat = alert_data.get("lat", 16.5167)
        lng = alert_data.get("lng", 80.6500)
        impact_g = alert_data.get("impact_g", 4.85)
        species = alert_data.get("species")
        hospital_name = alert_data.get("hospital_name")
        units_needed = alert_data.get("units_needed", 2)
        alert_id = alert_data.get("alert_id") or f"alert-{int(datetime.now().timestamp())}"
        tracking_url = alert_data.get("tracking_url") or f"https://resqone-ai.vercel.app/?disaster_alert=true&category={category}&alert_id={alert_id}&lat={lat}&lng={lng}"

        # Victim Exclusion Identifiers
        sender_endpoint = alert_data.get("sender_endpoint")
        sender_device_id = alert_data.get("sender_device_id")
        victim_user_id = alert_data.get("victim_user_id")

        # Category-Specific Titles & Messages
        if category == "BLOOD_URGENT":
            title = f"🩸 CRITICAL BLOOD SOS: {blood_group} NEEDED"
            body = f"Urgent blood crisis for {victim_name} ({units_needed} units). Hospital: {hospital_name or location_name}. Tap to respond!"
            actions = [
                {"action": "navigate", "title": "🩸 View Blood Route"},
                {"action": "call", "title": "📞 Call Blood Center"}
            ]
        elif category == "SNAKEBITE":
            title = f"🐍 SNAKEBITE RESCUE: {species or 'Venomous Bite'}"
            body = f"Snakebite reported at {location_name}. Nearest antivenom center dispatched. Tap to view location!"
            actions = [
                {"action": "navigate", "title": "🏥 View Antivenom Route"},
                {"action": "call", "title": "📞 Call 108 Emergency"}
            ]
        elif category == "SOS_BEACON":
            title = f"🚨 EMERGENCY SOS BEACON: {victim_name}"
            body = f"Urgent distress beacon activated at {location_name} ({blood_group}). CAD 108 dispatched. Tap to assist!"
            actions = [
                {"action": "navigate", "title": "📍 View Victim Route"},
                {"action": "call", "title": "📞 Call 108 Emergency"}
            ]
        else: # ACCIDENT
            title = f"🚨 HIGH-SPEED CRASH ALERT: {victim_name}"
            body = f"Severe collision at {location_name} ({blood_group}). Impact: {impact_g}G. Tap to open live route & assist!"
            actions = [
                {"action": "navigate", "title": "📍 View Live Route"},
                {"action": "call", "title": "📞 Call 108 Emergency"}
            ]

        payload = {
            "title": title,
            "body": body,
            "category": category,
            "victimName": victim_name,
            "bloodGroup": blood_group,
            "locationName": location_name,
            "lat": lat,
            "lng": lng,
            "impactG": impact_g,
            "species": species,
            "hospitalName": hospital_name,
            "alertId": alert_id,
            "trackingUrl": tracking_url,
            "senderDeviceId": sender_device_id,
            "vibrate": [1000, 200, 1000, 200, 1500, 300, 1000],
            "actions": actions,
            "timestamp": datetime.now().isoformat()
        }

        payload_json = json.dumps(payload)
        sent_count = 0
        failed_count = 0
        dead_endpoints = []

        for endpoint, sub in cls._subscriptions.items():
            # ==============================================================
            # CRITICAL RULE: DO NOT SHOW ALERT NOTIFICATION ON VICTIM'S PHONE!
            # The victim triggered the emergency; send ONLY to OTHER users!
            # ==============================================================
            if sender_endpoint and endpoint == sender_endpoint:
                logger.info(f"Skipping victim's own push endpoint: {endpoint[:30]}...")
                continue
            if sender_device_id and sub.get("device_id") == sender_device_id:
                logger.info(f"Skipping victim's device ID: {sender_device_id}")
                continue
            if victim_user_id and sub.get("user_id") == victim_user_id and victim_user_id != "anonymous":
                logger.info(f"Skipping victim's user ID: {victim_user_id}")
                continue

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

        # Merge any known subscriptions passed by the caller
        known_subs = alert_data.get("known_subscriptions")
        if known_subs and isinstance(known_subs, list):
            for ks in known_subs:
                k_ep = ks.get("endpoint")
                if k_ep and k_ep not in cls._subscriptions:
                    cls.register_device(ks)

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
