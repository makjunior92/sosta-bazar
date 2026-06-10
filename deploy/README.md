# Deploy

## Local (development)

```bash
cd deploy
docker compose up --build -d
```

Open **http://localhost:8080**

## Production — quantumflux.cloud/sostabazar

### One-time VPS setup

1. SSH into your VPS and run:

```bash
curl -fsSL https://raw.githubusercontent.com/makjunior92/sosta-bazar/main/deploy/bootstrap-vps.sh | bash
```

Or clone manually:

```bash
git clone https://github.com/makjunior92/sosta-bazar.git /opt/sosta-bazar
cd /opt/sosta-bazar/deploy
cp .env.example .env
# Edit .env — set a strong POSTGRES_PASSWORD
```

2. **Host nginx** — add the snippet from `nginx/quantumflux.host.conf.example` inside your `quantumflux.cloud` HTTPS server block, then reload nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions):

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | SSH user (e.g. `root` or `deploy`) |
| `VPS_SSH_KEY` | Private SSH key (PEM) |
| `GHCR_TOKEN` | GitHub PAT with `read:packages` (for VPS to pull images) |

4. **Make GHCR packages public** (or keep private and use `GHCR_TOKEN` on VPS):
   - GitHub → Packages → `sosta-bazar-backend` → Package settings → Change visibility → Public
   - Same for `sosta-bazar-frontend`

5. First deploy:

```bash
echo YOUR_GHCR_PAT | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
cd /opt/sosta-bazar/deploy
./deploy.sh
```

### CI/CD

Every push to `main` runs `.github/workflows/deploy.yml`:

1. Tests backend + frontend
2. Builds and pushes Docker images to GHCR
3. SSHs to VPS, pulls latest code + images, restarts stack

**Live URL:** https://quantumflux.cloud/sostabazar/

### Manual redeploy on VPS

```bash
cd /opt/sosta-bazar/deploy
./deploy.sh
```
