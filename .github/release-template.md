# Release: Hackathon Submission – Observability-First E-Commerce API

Use this template as the **description** for the GitHub release that represents your final hackathon submission. Fill in each section so reviewers can quickly understand the project and what was delivered.

---

## Overview

**Project name:** [e.g. Observability-First E-Commerce API – Kombee Hackathon 2.0]

**One-line summary:**  
[E.g. Full-stack e-commerce-style application with React admin UI, Laravel API, and a full observability stack (Prometheus, Loki, Tempo, Grafana) for metrics, logs, and distributed tracing.]

**Tech stack:**
- **Frontend:** [e.g. React 18, Vite 5, TailwindCSS]
- **Backend:** [e.g. Laravel 12, PHP 8.2, Sanctum]
- **Database:** [e.g. MySQL 8]
- **Observability:** [e.g. Prometheus, Loki, Tempo, Grafana, Promtail, OpenTelemetry/OTLP]

**What reviewers will find in this release:**  
[E.g. A runnable monorepo with backend, frontend, Docker Compose for MySQL and the observability stack, k6 load tests, anomaly injection demos, and a video walkthrough.]

---

## Architecture

**High-level flow:**  
[E.g. Browser → React frontend (port 5173) → Laravel API (port 8000) → MySQL (3306). Observability stack runs alongside: Prometheus scrapes metrics, Promtail collects logs to Loki, app sends traces to Tempo via OTLP; Grafana queries all three.]

**Key paths in the repo:**
- Application: `backend/` (Laravel), `frontend/` (React)
- Observability config: `prometheus/`, `loki/`, `tempo/`, `promtail/`, `grafana/`
- Load tests: `load-testing/k6/`
- Docs: `docs/`

**How to run (short):**  
[E.g. 1) `docker compose up -d` for MySQL. 2) `docker compose -f docker-compose.monitoring.yml up -d` for the observability stack. 3) From `backend/`: copy `.env.example` to `.env`, `composer install`, `php artisan migrate`, `php artisan serve`. 4) From `frontend/`: `npm install`, `npm run dev`.]

**Access:**
- Frontend: [e.g. http://localhost:5173]
- Grafana: [e.g. http://localhost:3000] (admin / admin)
- Prometheus: [e.g. http://localhost:9090]

---

## Observability Implementation

**Metrics (Prometheus)**  
[Describe how metrics are exposed and scraped. E.g. Laravel exposes `/metrics` in Prometheus format; Prometheus scrapes it every 15s; config in `prometheus/prometheus.yml`. List 1–2 example metrics if relevant.]

**Logs (Loki + Promtail)**  
[Describe log flow. E.g. App and containers log to stdout; Promtail discovers Docker containers, parses JSON, adds labels (service, container_name, log_level), pushes to Loki. Config: `promtail/config.yml`, `loki/config.yml`.]

**Traces (Tempo)**  
[Describe tracing. E.g. Application instrumented with OpenTelemetry; spans exported via OTLP (HTTP 4318 / gRPC 4317) to Tempo. Config: `tempo/config.yml`. Optional: mention trace-to-logs in Grafana.]

---

## Dashboards

**What’s provisioned:**  
[E.g. Grafana is provisioned with datasources for Prometheus, Loki, and Tempo. Dashboard JSONs live in `grafana/provisioning/dashboards/json/` and load into the Ecommerce Observability folder.]

**What reviewers should look at:**  
[E.g. Open Grafana → Dashboards → Ecommerce Observability. Describe 1–2 panels or dashboards: e.g. “Request rate and latency from Prometheus,” “Logs by service/level in Loki,” “Trace timeline in Tempo.”]

---

## Load Testing Results

**Scripts:**  
[E.g. `load-testing/k6/basic-load-test.js` (50 VUs, GET /api/v1/products, 2 min), `load-testing/k6/spike-test.js` (spike to 200 VUs). See `load-testing/k6/README.md` for run instructions.]

**How to run:**  
```bash
k6 run load-testing/k6/basic-load-test.js
k6 run -e BASE_URL=http://localhost:8000 load-testing/k6/spike-test.js
```

**Sample results (optional – paste from a run):**  
[E.g. “Basic load: 50 VUs, 2 min – ~X req/s, p95 latency Xms, 0% failure. Spike: 200 VUs – p95 Xms, Y% failure.” Or “See screenshot in release assets.”]

---

## Anomaly Analysis

**What was implemented:**  
[E.g. Slow-query demo (SLEEP in a route), artificial delay middleware (usleep), and optional error-spike route. All behind env flags or demo routes like /api/v1/demo/*.]

**How to trigger (if applicable):**  
[E.g. “Call GET /api/v1/demo/slow to inject a 2s DB delay; observe in Tempo (long span) and Prometheus (latency spike).”]

**What reviewers should see:**  
[E.g. When anomalies are on: elevated latency in Prometheus, long or failed spans in Tempo, error logs in Loki. Document how to correlate (e.g. trace-to-logs in Grafana).]

---

## Video Walkthrough

**Link:**  
[URL to the video – e.g. Loom, YouTube, or file in release assets.]

**Contents (short):**  
[E.g. “(1) Starting the stack and opening the app. (2) Logging in and showing products/orders. (3) Opening Grafana and showing metrics, logs, and traces. (4) Running a k6 load test and pointing out the same load in Grafana. (5) Triggering an anomaly and walking through detection in Prometheus/Tempo/Loki.”)]

---

## Checklist for Reviewers

- [ ] Clone repo, follow “How to run” and open Frontend, Grafana, Prometheus.
- [ ] Confirm metrics in Prometheus (targets UP, some scraped data).
- [ ] Confirm logs in Grafana (Loki datasource, query returns results).
- [ ] Confirm traces in Grafana (Tempo datasource, traces visible if app is instrumented).
- [ ] Run `k6 run load-testing/k6/basic-load-test.js` and observe results.
- [ ] (Optional) Trigger anomaly and verify visibility in dashboards.
- [ ] Watch video walkthrough.

---

*Thank you for reviewing our hackathon submission. For detailed docs, see the `docs/` folder and the main README.*
