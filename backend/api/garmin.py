"""Garmin Connect OAuth 1.0a proxy and Health API endpoints.

The mobile app calls these endpoints instead of talking to Garmin directly,
because OAuth 1.0a (HMAC-SHA1 signing) is painful to do on the client.
"""

import hashlib
import hmac
import time
import urllib.parse
import uuid
from base64 import b64encode

import httpx
import structlog
from fastapi import APIRouter, HTTPException, Query

from backend.config import settings

router = APIRouter(prefix="/garmin", tags=["garmin"])
log = structlog.get_logger()

# ── OAuth 1.0a helpers ───────────────────────────────────────────────────────

REQUEST_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/request_token"
AUTHORIZE_URL = "https://connect.garmin.com/oauthConfirm"
ACCESS_TOKEN_URL = "https://connectapi.garmin.com/oauth-service/oauth/access_token"
HEALTH_API_BASE = "https://apis.garmin.com/wellness-api/rest"

# In-memory store for OAuth request-token secrets (keyed by oauth_token).
# In production you'd use Redis or a DB, but this works for single-server dev.
_request_token_secrets: dict[str, str] = {}


def _percent_encode(s: str) -> str:
    return urllib.parse.quote(s, safe="")


def _build_oauth_signature(
    method: str,
    url: str,
    params: dict[str, str],
    consumer_secret: str,
    token_secret: str = "",
) -> str:
    sorted_params = "&".join(
        f"{_percent_encode(k)}={_percent_encode(v)}"
        for k, v in sorted(params.items())
    )
    base_string = f"{method}&{_percent_encode(url)}&{_percent_encode(sorted_params)}"
    signing_key = f"{_percent_encode(consumer_secret)}&{_percent_encode(token_secret)}"
    digest = hmac.new(
        signing_key.encode(), base_string.encode(), hashlib.sha1
    ).digest()
    return b64encode(digest).decode()


def _oauth_header(
    method: str,
    url: str,
    consumer_key: str,
    consumer_secret: str,
    token: str = "",
    token_secret: str = "",
    extra: dict[str, str] | None = None,
) -> str:
    params: dict[str, str] = {
        "oauth_consumer_key": consumer_key,
        "oauth_nonce": uuid.uuid4().hex,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_version": "1.0",
    }
    if token:
        params["oauth_token"] = token
    if extra:
        params.update(extra)

    params["oauth_signature"] = _build_oauth_signature(
        method, url, params, consumer_secret, token_secret
    )

    header_parts = ", ".join(
        f'{_percent_encode(k)}="{_percent_encode(v)}"'
        for k, v in sorted(params.items())
        if k.startswith("oauth_")
    )
    return f"OAuth {header_parts}"


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/auth/start")
async def garmin_auth_start(callback_url: str = Query(...)):
    """Step 1: Get a request token and return the Garmin authorize URL."""
    if not settings.garmin_consumer_key or not settings.garmin_consumer_secret:
        raise HTTPException(503, "Garmin API credentials not configured")

    auth = _oauth_header(
        "POST",
        REQUEST_TOKEN_URL,
        settings.garmin_consumer_key,
        settings.garmin_consumer_secret,
        extra={"oauth_callback": callback_url},
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            REQUEST_TOKEN_URL, headers={"Authorization": auth}
        )

    if resp.status_code != 200:
        log.error("garmin_request_token_failed", status=resp.status_code, body=resp.text)
        raise HTTPException(502, "Failed to get Garmin request token")

    params = dict(urllib.parse.parse_qsl(resp.text))
    oauth_token = params.get("oauth_token", "")
    oauth_token_secret = params.get("oauth_token_secret", "")

    # Remember the secret so we can use it in step 2
    _request_token_secrets[oauth_token] = oauth_token_secret

    return {
        "oauth_token": oauth_token,
        "authorize_url": f"{AUTHORIZE_URL}?oauth_token={oauth_token}",
    }


@router.post("/auth/exchange")
async def garmin_auth_exchange(oauth_token: str = Query(...), oauth_verifier: str = Query(...)):
    """Step 2: Exchange the request token + verifier for an access token."""
    token_secret = _request_token_secrets.pop(oauth_token, "")
    if not token_secret:
        raise HTTPException(400, "Unknown or expired request token")

    auth = _oauth_header(
        "POST",
        ACCESS_TOKEN_URL,
        settings.garmin_consumer_key,
        settings.garmin_consumer_secret,
        token=oauth_token,
        token_secret=token_secret,
        extra={"oauth_verifier": oauth_verifier},
    )

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            ACCESS_TOKEN_URL, headers={"Authorization": auth}
        )

    if resp.status_code != 200:
        log.error("garmin_access_token_failed", status=resp.status_code, body=resp.text)
        raise HTTPException(502, "Failed to exchange Garmin token")

    params = dict(urllib.parse.parse_qsl(resp.text))
    return {
        "access_token": params.get("oauth_token", ""),
        "access_token_secret": params.get("oauth_token_secret", ""),
    }


@router.get("/data/{endpoint:path}")
async def garmin_data_proxy(
    endpoint: str,
    access_token: str = Query(...),
    access_token_secret: str = Query(...),
    upload_start: int = Query(0, alias="uploadStartTimeInSeconds"),
    upload_end: int = Query(0, alias="uploadEndTimeInSeconds"),
):
    """Proxy GET requests to the Garmin Health API with OAuth 1.0a signing."""
    url = f"{HEALTH_API_BASE}/{endpoint}"
    query_params = {}
    if upload_start:
        query_params["uploadStartTimeInSeconds"] = str(upload_start)
    if upload_end:
        query_params["uploadEndTimeInSeconds"] = str(upload_end)

    full_url = url
    if query_params:
        full_url = f"{url}?{urllib.parse.urlencode(query_params)}"

    auth = _oauth_header(
        "GET",
        url,  # signature base uses URL without query string
        settings.garmin_consumer_key,
        settings.garmin_consumer_secret,
        token=access_token,
        token_secret=access_token_secret,
    )

    async with httpx.AsyncClient() as client:
        resp = await client.get(full_url, headers={"Authorization": auth})

    if resp.status_code != 200:
        log.warning("garmin_api_error", endpoint=endpoint, status=resp.status_code)
        raise HTTPException(resp.status_code, f"Garmin API error: {resp.text}")

    return resp.json()
