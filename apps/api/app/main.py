from fastapi import FastAPI

from app.config import settings

app = FastAPI(title="UPSK URL Shortener API")


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


@app.get("/config-check")
def config_check() -> dict[str, int]:
    return {"port": settings.port}
