#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# verify-observability.sh — Confirm all containers are up and Prometheus
#   is reachable before running any chaos experiment.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}[OK]${NC}   $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; FAILED=1; }

FAILED=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Pre-chaos observability check (local)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

container_status() {
  local name="$1"
  local state
  state=$(docker inspect "$name" --format='{{.State.Status}}' 2>/dev/null || echo "missing")
  if [[ "$state" == "running" ]]; then
    ok "$name: $state"
  else
    fail "$name: $state (expected: running)"
  fi
}

# ── App stack containers ──────────────────────────────────────────────────────
echo ""
echo "── App stack ────────────────────────────────"
container_status "fixme-web"
container_status "fixme-celery"
container_status "fixme-postgres"
container_status "fixme-redis"
container_status "fixme-flower"
container_status "fixme-redis-exporter"
container_status "fixme-postgres-exporter"

# ── Monitoring containers ─────────────────────────────────────────────────────
echo ""
echo "── Monitoring stack ─────────────────────────"
container_status "fixme-prometheus"
container_status "fixme-grafana"

# ── HTTP reachability checks ──────────────────────────────────────────────────
echo ""
echo "── HTTP checks ──────────────────────────────"

http_check() {
  local label="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 3 "$url" 2>/dev/null || echo "000")
  if [[ "$code" =~ ^[23] ]]; then
    ok "$label ($url) → HTTP $code"
  else
    fail "$label ($url) → HTTP $code (unreachable)"
  fi
}

http_check "Django web"   "http://localhost:8000/admin/"
http_check "Prometheus"   "http://localhost:9090/-/ready"
http_check "Grafana"      "http://localhost:3000/api/health"
http_check "Flower"       "http://localhost:5555"

# ── Prometheus targets ────────────────────────────────────────────────────────
echo ""
echo "── Prometheus scrape targets ────────────────"
if command -v curl &>/dev/null && command -v jq &>/dev/null; then
  TARGETS=$(curl -s http://localhost:9090/api/v1/targets 2>/dev/null || echo "")
  if [[ -n "$TARGETS" ]]; then
    echo "$TARGETS" | jq -r '
      .data.activeTargets[] |
      "\(.labels.job) → \(.health) (\(.scrapeUrl))"
    ' 2>/dev/null | while read -r line; do
      if echo "$line" | grep -q "→ up"; then
        ok "$line"
      else
        warn "$line"
      fi
    done
  else
    warn "Could not reach Prometheus API"
  fi
else
  warn "curl or jq not found — skipping Prometheus target check"
  warn "Check manually: http://localhost:9090/targets"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ "$FAILED" -eq 0 ]]; then
  echo -e "${GREEN} All checks passed — safe to run chaos experiments.${NC}"
  echo ""
  echo "  bash chaos/scripts/local-chaos.sh kill-web"
  echo "  bash chaos/scripts/local-network-chaos.sh partition-web-redis"
  echo "  bash chaos/scripts/local-db-chaos.sh terminate-connections"
else
  echo -e "${RED} Some checks failed — fix the above before running chaos.${NC}"
  echo ""
  echo "Start the app:        docker compose up -d"
  echo "Start monitoring:     cd monitoring && docker compose up -d"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
