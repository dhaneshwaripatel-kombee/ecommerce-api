# Observability First Web Application – Kombee Hackathon 2.0

A full-stack e-commerce–style application built to demonstrate **production-grade observability** using metrics, logs, and distributed tracing. The system is instrumented end-to-end so that reliability, performance, and debuggability can be observed and improved in a hackathon setting.

---

## 1. Project Overview

This project showcases an **observability-first** approach to building and operating a web application. The application consists of a React admin frontend and a Laravel REST API, with a dedicated observability stack that provides:

- **Metrics** — Scraped by Prometheus from the backend and infrastructure, for latency, throughput, and resource usage.
- **Logs** — Collected from Docker containers by Promtail, centralized in Loki, and queryable in Grafana with structured fields and labels.
- **Distributed tracing** — OpenTelemetry-compatible traces ingested by Tempo, with correlation to logs and metrics in Grafana.

Together, these pillars support incident detection, root-cause analysis, and performance tuning during the hackathon and in production-like scenarios.

---

## 2. Technology Stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, Vite 5, React Router 6, Axios, TailwindCSS |
| **Backend** | Laravel 12 (PHP 8.2), Laravel Sanctum (API auth), REST API |
| **Database** | MySQL 8+ |
| **Observability** | Prometheus, Loki, Tempo, Grafana, Promtail, OpenTelemetry (OTLP) |

### Observability Stack

- **Prometheus** — Metrics scraping and storage.
- **Loki** — Log aggregation; stores container and application logs.
- **Tempo** — Distributed tracing backend; accepts OTLP HTTP/gRPC.
- **Grafana** — Unified UI for metrics, logs, and traces; provisioned datasources and dashboards.
- **Promtail** — Log collection from Docker containers; ships to Loki with labels (e.g. `service`, `container_name`, `log_level`).
- **OpenTelemetry** — Standard for instrumenting the application and sending traces to Tempo (OTLP).

---

## 3. Architecture Diagram

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│ Client  │────▶│  Frontend   │────▶│  Laravel    │────▶│  MySQL   │
│ (Browser)│     │  (React)    │     │  API        │     │          │
└─────────┘     └─────────────┘     └──────┬──────┘     └──────────┘
       │                │                       │
       │                │                       │
       ▼                ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY STACK                               │
│                                                                       │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   │
│  │ Prometheus │   │   Loki     │   │   Tempo    │   │  Grafana   │   │
│  │ (metrics)  │   │  (logs)    │   │  (traces)  │   │  (UI)      │   │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   │
│        │                │                │                │          │
│        │                │                │                │          │
│        │          ┌─────┴──────┐         │                │          │
│        │          │  Promtail  │─────────┴────────────────┘          │
│        │          │ (collect)  │  OTLP / scrape / query               │
│        │          └────────────┘                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Data flow:** The client talks to the React frontend; the frontend calls the Laravel API; the API uses MySQL. Metrics, logs, and traces from the application and containers are collected by Prometheus, Promtail, and Tempo (OTLP) and explored in Grafana.

---

## 4. Running the Project

### Prerequisites

- Docker and Docker Compose (for the observability stack and optional full-stack run).
- For local run: PHP 8.2+, Composer, Node.js 18+, MySQL 8+.

### Run with Docker

From the repository root:

```bash
docker compose up --build
```

Use the project’s main `docker-compose.yml` if it defines the full stack (frontend, backend, database, observability). If only the observability stack is containerized, run:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Then run the Laravel API and React frontend locally (see backend and frontend README sections in the repo, if present).

### Run locally (development)

1. **Backend:** From `backend/`, copy `.env.example` to `.env`, set MySQL credentials, run `composer install`, `php artisan key:generate`, `php artisan migrate`, and optionally `php artisan db:seed`. Start the API with `php artisan serve`.
2. **Frontend:** From `frontend/`, run `npm install` and `npm run dev`.
3. **Observability (optional):** Start the monitoring stack with `docker compose -f docker-compose.monitoring.yml up -d` so Grafana, Prometheus, Loki, Tempo, and Promtail are available.

---

## 5. Service Ports

| Service | Port | Description |
|---------|------|-------------|
| **Frontend** | 5173 | React (Vite) dev server |
| **Backend** | 8000 | Laravel API |
| **Grafana** | 3000 | Dashboards, datasources, explore (metrics, logs, traces) |
| **Prometheus** | 9090 | Metrics UI and API |
| **Loki** | 3100 | Log storage API |
| **Tempo** | 3200 | Trace API; OTLP gRPC 4317, OTLP HTTP 4318 |

---

## 6. Observability Dashboards

Grafana is pre-provisioned with datasources for **Prometheus**, **Loki**, and **Tempo**. Use **Explore** or add dashboards to get a single view of the system.

- **Metrics (Prometheus)**  
  Query time series for request rates, latency, errors, and resource usage. Example: rate of HTTP requests, p95 latency, or custom metrics exported by the Laravel backend (e.g. `/metrics` endpoint if implemented).

- **Logs (Loki)**  
  Query logs by label (`service`, `container_name`, `log_level`) or full-text. Use for errors, request logs, and business events. Trace-to-logs from Tempo helps jump from a trace to related log lines.

- **Traces (Tempo)**  
  View distributed traces sent via OpenTelemetry (OTLP). Inspect request flows across services, find slow spans, and use trace-to-logs and trace-to-metrics in Grafana to correlate with logs and metrics.

Provisioned dashboard JSON files can be placed in `grafana/provisioning/dashboards/json/`; they load into the **Ecommerce Observability** folder in Grafana.

---

## 7. Load Testing

Load testing is done with **[k6](https://k6.io/)** (scripted HTTP traffic).

- Install k6 (e.g. `brew install k6` or see [k6 install](https://k6.io/docs/getting-started/installation/)).
- Run a script against the API, for example:

  ```bash
  k6 run load-testing/k6/api-load.js
  ```

  Override base URL: `k6 run -e BASE_URL=http://localhost:8000 load-testing/k6/api-load.js`. Adjust target URL and scenarios as needed.

- Observe in Grafana and Prometheus: request rate, latency percentiles, and error rate under load. Use this to validate SLOs and to trigger or inspect anomalies during the hackathon.

---

## 8. Anomaly Injection

To simulate real-world issues and practice observability-driven debugging, the project uses **anomaly injection**:

- **Slow queries** — Artificial database delays or heavy queries (e.g. sleep, large scans) are introduced so that traces and metrics show elevated latency and database-bound spans. This demonstrates how to spot and diagnose slow backends using Tempo and Prometheus.
- **Artificial delays** — Middleware or route-level sleep (e.g. `usleep()` in Laravel) adds controllable latency to specific endpoints. Combined with k6, this produces clear spikes in latency and trace duration that can be detected and investigated in Grafana.

These techniques are used during the hackathon to validate that metrics, logs, and traces correctly expose and explain degraded behavior.

---

## 9. Video Walkthrough

A **demo recording** of the observability-first setup, dashboards, and anomaly scenarios is available in the **root folder** of this repository. It walks through:

- Running the stack and opening Grafana.
- Exploring metrics, logs, and traces.
- Correlating traces with logs and metrics.
- Interpreting load-test and anomaly-injection results.

---

## Repository layout

| Path | Purpose |
|------|--------|
| `backend/` | Laravel API (PHP 8.2, Laravel 12). Run from here: `composer install`, `php artisan serve`. |
| `frontend/` | React admin UI (Vite, Tailwind). Run from here: `npm install`, `npm run dev`. |
| `docker/` | Docker build files (e.g. `Dockerfile` for the backend). |
| `prometheus/` | Prometheus config (`prometheus.yml`). |
| `grafana/` | Grafana provisioning (datasources, dashboards). |
| `loki/` | Loki config (`config.yml`). |
| `tempo/` | Tempo config (`config.yml`). |
| `promtail/` | Promtail config (`config.yml`). |
| `load-testing/k6/` | k6 load test scripts. |
| `dashboards/` | Dashboard documentation; provisioned JSON in `grafana/provisioning/dashboards/json/`. |
| `docs/` | Project documentation (e.g. `docs/ARCHITECTURE.md`). |

**Root files:** `docker-compose.yml`, `docker-compose.monitoring.yml`, `README.md`, `.env.example`, `.gitignore`.

For API usage, database setup, and frontend details, see the sections above and any backend/frontend-specific docs in the repo.
