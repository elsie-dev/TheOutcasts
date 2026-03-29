# Monitoring — moved

Prometheus and Grafana run **outside Kubernetes** via Docker Compose.

See: `monitoring/docker-compose.yml`

To start:
```bash
# 1. Start the app stack first (so the Docker network exists)
docker compose up -d

# 2. Start monitoring
cd monitoring
docker compose up -d

# 3. Open Grafana
open http://localhost:3000   # admin / admin
open http://localhost:9090   # Prometheus UI
```
