# System Architecture

This document describes the high-level architecture of the e-commerce observability-first application: the application layers, the observability stack, and how they interact.

---

## Overview

The system is a full-stack web application built to demonstrate production-grade observability. It consists of four main layers:

1. **Frontend** — React single-page application (admin UI).
2. **Backend** — Laravel REST API (business logic, persistence, auth).
3. **Database** — MySQL (primary data store).
4. **Observability stack** — Metrics, logs, and traces collected and queried via Prometheus, Loki, Tempo, and Grafana.

The first three layers form the request path; the fourth provides visibility into their behavior and health.

---

## Application Layers

### Frontend

- **Stack:** React 18, Vite 5, React Router 6, Axios, TailwindCSS.
- **Role:** Admin UI for products and orders. Renders in the browser and communicates with the backend over HTTP.
- **Location:** `frontend/`. Dev server typically runs on port **5173** (Vite).
- **Auth:** Uses Laravel Sanctum (token-based). Login/register against the API; subsequent requests send the bearer token.

The frontend is a consumer of the backend API only; it does not write metrics or traces directly.

### Backend

- **Stack:** Laravel 12 (PHP 8.2), Laravel Sanctum, REST API.
- **Role:** Authentication, product and order CRUD, validation, and persistence. Exposes a versioned API under `/api/v1/`.
- **Location:** `backend/`. Served via `php artisan serve` (e.g. port **8000**) or PHP-FPM in Docker (e.g. port **9000**).
- **Endpoints:** Register, login, logout; products (index, store, show, update, destroy); orders (index, store, show, update status). Protected routes require a valid Sanctum token.

The backend is the primary instrumented component: it can expose a `/metrics` endpoint for Prometheus, emit structured logs (consumed by Promtail when run in Docker), and send distributed traces via OpenTelemetry to Tempo.

### Database

- **Stack:** MySQL 8+.
- **Role:** Persistent store for users, products, orders, and related data.
- **Runtime:** Typically run via Docker (`docker-compose.yml`) as service `mysql` on port **3306**, with database `observability_db` and credentials configured in the Laravel `.env`.

When the app runs on the host and MySQL in Docker, `DB_HOST` is set to `127.0.0.1`. When both run in Docker on the same network, `DB_HOST=mysql` (service name).

---

## Request Flow

1. **User** interacts with the React app in the browser.
2. **Frontend** sends HTTP requests to the Laravel API (e.g. `http://localhost:8000/api/v1/products`).
3. **Backend** validates the request, applies auth middleware where required, executes business logic, and talks to **MySQL** for reads/writes.
4. **Response** is returned to the frontend and rendered.

All of this is visible to the observability stack when instrumented: metrics, logs, and traces from the backend.

---

## Observability Stack (Summary)

The observability stack runs alongside the application and is orchestrated by `docker-compose.monitoring.yml`.

| Component   | Purpose                          | Port(s)                    |
|------------|-----------------------------------|----------------------------|
| Prometheus | Scrape and store metrics          | 9090                       |
| Loki       | Store log streams                 | 3100                       |
| Tempo      | Store traces (OTLP)               | 3200 (API), 4317/4318 (OTLP)|
| Promtail   | Collect container logs to Loki   | —                          |
| Grafana    | Query and visualize all three     | 3000                       |

- **Metrics:** Prometheus scrapes the Laravel backend (e.g. `/metrics`) and itself. Config: `prometheus/prometheus.yml`.
- **Logs:** Promtail discovers Docker containers, tails their log files, enriches with labels, and pushes to Loki. Config: `promtail/config.yml`, `loki/config.yml`.
- **Traces:** The application sends spans via OpenTelemetry (OTLP) to Tempo. Config: `tempo/config.yml`.
- **Grafana:** Provisioned with datasources for Prometheus, Loki, and Tempo for correlation (trace-to-logs, trace-to-metrics).

For detailed implementation, see [observability.md](observability.md).

---

## Repository layout

| Path | Purpose |
|------|--------|
| `backend/` | Laravel API (PHP 8.2, Laravel 12). Run from here: `composer install`, `php artisan serve`. |
| `frontend/` | React admin UI (Vite, Tailwind). Run from here: `npm install`, `npm run dev`. |
| `docker/` | Docker build files (e.g. `Dockerfile` for the backend). Compose files remain at repo root. |
| `prometheus/` | Prometheus config only (`prometheus.yml`). |
| `grafana/` | Grafana provisioning (datasources, dashboards). |
| `loki/` | Loki config (`config.yml`). |
| `tempo/` | Tempo config (`config.yml`). |
| `promtail/` | Promtail config (`config.yml`). |
| `load-testing/k6/` | k6 load test scripts. |
| `dashboards/` | Dashboard docs; provisioned JSON lives under `grafana/provisioning/dashboards/json/`. |
| `docs/` | Project documentation (this file and others). |

## Root files

- `docker-compose.yml` – MySQL for Laravel.
- `docker-compose.monitoring.yml` – Prometheus, Loki, Tempo, Grafana, Promtail.
- `README.md` – Project overview and run instructions.
- `.env.example` – Example environment variables for app and Docker.
- `.gitignore` – Git ignore rules.

## Data flow

- **Metrics:** Laravel (e.g. `/metrics`) and Prometheus self-scrape → Prometheus.
- **Logs:** Docker containers → Promtail → Loki.
- **Traces:** Application (OTLP) → Tempo.
- **Grafana:** Queries Prometheus, Loki, and Tempo; dashboards and Explore for correlation.

## Building the backend image

Build context is `backend/`; Dockerfile path is `docker/Dockerfile`:

```bash
docker build -f docker/Dockerfile backend
```

Compose files that add a Laravel service should use:

```yaml
build:
  context: backend
  dockerfile: docker/Dockerfile
```
