"""Application configuration loaded from environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    """Pulse.ai configuration.

    Attributes:
        anthropic_api_key: Anthropic API key for Claude.
        claude_model: Claude model to use for chat completions.
        pubmed_email: Email for PubMed E-utilities (enables 10 req/s).
        supabase_url: Supabase project URL.
        supabase_key: Supabase anon/service key.
        host: Server bind host.
        port: Server bind port.
        log_level: Logging level.
    """

    anthropic_api_key: str = ""
    claude_model: str = "claude-sonnet-4-20250514"
    pubmed_email: str = ""
    supabase_url: str = ""
    supabase_key: str = ""
    garmin_consumer_key: str = ""
    garmin_consumer_secret: str = ""
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "info"

    model_config = {"env_file": str(_ENV_FILE), "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
