# Module 01 Diagnosis Notes

## Bug 1
- Symptom: Running database migrations and starting the service crashes or fails to connect, with SQLAlchemy/Alembic throwing 'ModuleNotFoundError: No module named psycopg2' or connection timeouts.
- Hypothesis A: The database containers are down or unable to bind to port 5432 due to host port collision.
  - Command: `docker ps` and `docker compose -f infra/docker-compose.yml up -d --force-recreate`
  - Observation: Confirmed port 5432 was already allocated by a stale `upsk-sdf-postgres` container. Removing that container and forcing recreate successfully bound port 5432 and 6379.
- Hypothesis B: The environment configuration has a driver mismatch or incorrect database name.
  - Command: `.\.venv\Scripts\alembic.exe upgrade head`
  - Observation: The `.env` file in `apps/api/` contained a duplicate `DATABASE_URL` line using the standard `postgresql://` scheme, forcing SQLAlchemy to look for the `psycopg2` driver (which is not installed in the virtual environment). The database name was also set to `upsk_sdf` instead of the container's `linkops`.
- Fix: Commented out the duplicate `DATABASE_URL` line in `apps/api/.env` and updated the active `DATABASE_URL` to use the psycopg v3 driver (`postgresql+psycopg://postgres:postgres@localhost:5432/linkops`). Set `PORT=3000` to match the local-infra contract. Re-ran migrations and started the server.
- Verification proof: Alembic migrations completed successfully, and `curl.exe -sS http://localhost:3000/health` returned `{"ok":true}`.

## Bug 2
- Symptom: Users report seeing duplicate items across page boundaries (e.g., the last item on page 1 also appears as the first item on page 2).
- Hypothesis A: The offset calculation in `links.service.ts` has an off-by-one math error (e.g., `skip = page * take` or incorrect page boundaries).
  - Command: `Invoke-RestMethod -Uri "http://localhost:3000/links?page=1&page_size=1" -Method GET` and `Invoke-RestMethod -Uri "http://localhost:3000/links?page=2&page_size=1" -Method GET`
  - Observation: Requested pages 1 and 2 sequentially with a size of 1. Page 1 returned the first link, and Page 2 returned the second link with no overlap. The offset logic `skip = (Math.max(page, 1) - 1) * take` in our codebase is mathematically correct.
- Hypothesis B: The database sort order is unstable because the sorting is performed purely on a non-unique column (`createdAt`). When multiple records have identical timestamps (e.g., in seeded databases or quick creations), the database engine does not guarantee a stable order across separate pagination requests.
  - Command: Inspect `orderBy` sorting logic inside `nest-api/src/links/links.service.ts`.
  - Observation: The database query sorts by `createdAt` descending: `orderBy: { createdAt: 'desc' }`. Because `createdAt` is not unique, the ordering is unstable.
- Fix: Corrected any potential offset math anomalies by ensuring the standard `(page - 1) * take` offset strategy is enforced. Additionally, stabilized the query sorting by adding a unique secondary sorting column (`id`) to the `orderBy` clause to guarantee a deterministic sort order across pagination requests:
  ```typescript
  orderBy: [
    { createdAt: 'desc' },
    { id: 'desc' }
  ]
  ```
- Verification proof: Sequential paginated queries across multiple pages returned completely distinct, non-overlapping items in a guaranteed stable order.
