# Sosta Bazar — Frontend

Mobile-first Next.js frontend for comparing grocery prices across Bangladesh online stores.

Part of the [Sosta Bazar monorepo](../README.md). For the full stack, run from `deploy/`.

## Stack

- Next.js 16 + TypeScript + Tailwind CSS
- Decoupled from API via REST + SSE

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 (requires API at http://localhost:8000).

## Pages

- `/` — Home search + trending deals
- `/search?q=butter` — Compare prices with live SSE progress
- `/deals` — Best deals across stores
- `/stores` — Store health status
- `/product/[id]` — Product detail + price history

## Docker

```bash
docker build -t sosta-bazar-web --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 .
docker run -p 3000:3000 sosta-bazar-web
```
