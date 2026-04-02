"""Pulse.ai FastAPI application — personalized AI health companion."""

import structlog
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.bloodwork import router as bloodwork_router
from backend.api.chat import router as chat_router
from backend.api.evidence import router as evidence_router
from backend.api.profile import router as profile_router
from backend.api.garmin import router as garmin_router
from backend.api.upload import router as upload_router
from backend.config import settings

structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
)

log = structlog.get_logger()

app = FastAPI(
    title="Pulse.ai",
    description="Personalized AI health companion — evidence is the product.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bloodwork_router)
app.include_router(chat_router)
app.include_router(evidence_router)
app.include_router(garmin_router)
app.include_router(profile_router)
app.include_router(upload_router)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint.

    Returns:
        Status dict confirming the server is running.
    """
    return {"status": "healthy", "service": "pulse.ai"}


def main() -> None:
    """Start the Pulse.ai server."""
    log.info("starting_server", host=settings.host, port=settings.port)
    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level,
    )


if __name__ == "__main__":
    main()
