from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = Field(..., alias="PORT")
    database_url: str = Field(..., alias="DATABASE_URL")

    @field_validator("port")
    @classmethod
    def validate_port(cls, value: int) -> int:
        if value < 1 or value > 65535:
            raise ValueError("Invalid PORT. Set PORT in .env (example: PORT=8000).")
        return value

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        if not value.startswith("postgresql"):
            raise ValueError("Invalid DATABASE_URL. Set a local PostgreSQL URL in .env.")
        return value


settings = Settings()
