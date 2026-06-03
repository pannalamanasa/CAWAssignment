from sqlalchemy import select

from app.db import SessionLocal
from app.models import Link


def main() -> None:
    code = "module02"
    long_url = "https://example.com/module-02"

    with SessionLocal() as db:
        existing = db.scalar(select(Link).where(Link.code == code))
        if existing is None:
            link = Link(code=code, long_url=long_url, created_by="module-02")
            db.add(link)
            db.commit()
        else:
            link = existing

        selected = db.scalar(select(Link).where(Link.code == code))
        if selected is None:
            raise RuntimeError("Expected inserted link to be found by code.")

        print(f"inserted code={link.code}")
        print(f"selected code={selected.code}")
        print(f"matched long_url={selected.long_url}")


if __name__ == "__main__":
    main()
