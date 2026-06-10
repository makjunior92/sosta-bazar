# Deploy

Run the full Sosta Bazar stack from the monorepo root:

```bash
cd deploy
docker compose up --build -d
```

- **App:** http://localhost:8080
- **API docs:** http://localhost:8080/docs
- **Health:** http://localhost:8080/health

Port 8080 avoids macOS AirPlay conflict on 5000.

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

Uses GHCR images: `sosta-bazar-backend` and `sosta-bazar-frontend`.
