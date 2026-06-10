# Sosta Bazar

Compare grocery prices across Bangladesh's top online stores — one search, best deals.

Monorepo layout:

| Folder | Stack |
|--------|-------|
| `backend/` | FastAPI, PostgreSQL, Redis, Celery, Playwright scrapers |
| `frontend/` | Next.js 16, TypeScript, Tailwind, next-intl (EN / বাংলা) |
| `deploy/` | Docker Compose + nginx — run the full stack |

## Quick start (Docker)

```bash
cd deploy
docker compose up --build -d
```

Open **http://localhost:8080** — nginx serves the web app and proxies `/api/` to the backend.

## Local development

**Backend** (requires PostgreSQL + Redis, or use `backend/docker-compose.yml`):

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend**:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

## CI

GitHub Actions runs on every push/PR to `main`:

- Backend: ruff + pytest + Docker build
- Frontend: lint + build + Docker build

## Production

Use pre-built images from GHCR:

```bash
cd deploy
docker compose -f docker-compose.prod.yml up -d
```
