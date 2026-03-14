# Hackathon Submission Checklist

Use this checklist before submitting to confirm all required pieces are present and runnable.

---

## Pre-submission checklist

### 1. Working application

- [ ] **Backend (Laravel API)** runs without errors from `backend/` (`php artisan serve` or via Docker).
- [ ] **Frontend (React)** runs and can reach the API (`npm run dev` from `frontend/`).
- [ ] **Database (MySQL)** is available; migrations run successfully (`php artisan migrate`).
- [ ] Core flows work: register/login, list/create products, list/create orders (as per API design).

### 2. Docker Compose setup

- [ ] **`docker-compose.yml`** exists at repo root (e.g. MySQL for the backend).
- [ ] **`docker-compose.monitoring.yml`** exists and starts the observability stack (Prometheus, Loki, Tempo, Grafana, Promtail).
- [ ] Running `docker compose up --build` (and optionally the monitoring compose) completes without errors.
- [ ] `.env.example` is present and documented; no real secrets in the repo.

### 3. Prometheus metrics

- [ ] **Prometheus** config exists (e.g. `prometheus/prometheus.yml`).
- [ ] Backend exposes a **metrics endpoint** (e.g. `/metrics`) in Prometheus exposition format, or scrape targets are documented.
- [ ] Prometheus container starts and scrapes successfully (targets visible in Prometheus UI → Status → Targets).

### 4. Loki logs

- [ ] **Loki** config exists (e.g. `loki/config.yml`).
- [ ] **Promtail** config exists (e.g. `promtail/config.yml`) and ships container (and optionally app) logs to Loki.
- [ ] Logs are queryable in Grafana (Loki datasource); e.g. `{container_name=~".+"}` or by service label.

### 5. Tempo traces

- [ ] **Tempo** config exists (e.g. `tempo/config.yml`) with OTLP receivers enabled (e.g. 4317 gRPC, 4318 HTTP).
- [ ] Application (or instrumentation) sends traces to Tempo via OTLP, or instructions for enabling tracing are documented.
- [ ] Traces are queryable in Grafana (Tempo datasource).

### 6. Grafana dashboards

- [ ] **Grafana** is provisioned with datasources for Prometheus, Loki, and Tempo (e.g. `grafana/provisioning/datasources/`).
- [ ] At least one **dashboard** exists (e.g. in `grafana/provisioning/dashboards/json/` or documented export).
- [ ] Dashboards load in Grafana and show metrics and/or logs and/or traces.

### 7. k6 load testing scripts

- [ ] **k6 scripts** exist under `load-testing/k6/` (e.g. `api-load.js`).
- [ ] Scripts run successfully: `k6 run load-testing/k6/api-load.js` (with optional `BASE_URL`).
- [ ] README or `docs/load-testing.md` explains how to run and interpret results.

### 8. Anomaly injection implementation

- [ ] **Anomaly injection** is implemented or clearly documented (e.g. slow queries, artificial delays, error spikes).
- [ ] Demo routes or feature flags are documented (e.g. in `docs/anomaly-injection.md`).
- [ ] Anomalies are observable in Grafana (metrics, logs, traces) when enabled.

### 9. Video recording

- [ ] **Video walkthrough** is recorded and linked or included (e.g. in README or submission form).
- [ ] Video shows: running the stack, opening Grafana, exploring metrics/logs/traces, and (optionally) load test or anomaly injection.

---

## Running the project locally

### Start infrastructure and observability

From the **repository root**:

```bash
# Start MySQL (and any other app services if defined in docker-compose.yml)
docker compose up --build -d

# Start the observability stack (Prometheus, Loki, Tempo, Grafana, Promtail)
docker compose -f docker-compose.monitoring.yml up -d
```

### Start the application (backend + frontend)

1. **Backend:** From `backend/`, copy `.env.example` to `.env`, set `DB_HOST=127.0.0.1` (or `mysql` if using Docker network), then:
   ```bash
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan serve
   ```
2. **Frontend:** From `frontend/`:
   ```bash
   npm install
   npm run dev
   ```

---

## Accessing services

| Service     | URL                      | Notes |
|------------|---------------------------|-------|
| **Frontend** | http://localhost:5173     | React (Vite) dev server. Open in a browser to use the admin UI. |
| **Grafana**  | http://localhost:3000    | Default login: `admin` / `admin`. Use Explore or Dashboards for metrics, logs, and traces. |
| **Prometheus** | http://localhost:9090  | Prometheus UI. Use Status → Targets to verify scrape health; use Graph for ad-hoc PromQL. |

Additional ports (for reference): Backend API typically http://localhost:8000; Loki 3100; Tempo 3200 (API), 4317 (OTLP gRPC), 4318 (OTLP HTTP).

---

## Quick verification

After starting everything:

1. **Frontend:** Open http://localhost:5173 — you should see the React app; log in or register and confirm API calls succeed.
2. **Grafana:** Open http://localhost:3000, log in, go to **Explore** — select Prometheus, Loki, and Tempo and run a simple query for each.
3. **Prometheus:** Open http://localhost:9090 → **Status → Targets** — ensure scrape targets are UP.

Once all checklist items are satisfied and the quick verification steps pass, the repository is ready for hackathon submission.
