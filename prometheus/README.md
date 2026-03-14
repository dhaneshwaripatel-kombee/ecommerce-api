# Prometheus configuration

- **prometheus.yml** – Prometheus scrape config (15s interval, Laravel + self).

Loki, Promtail, and Tempo configs live in their own folders at repo root: `loki/config.yml`, `promtail/config.yml`, `tempo/config.yml`.

## Targets

| Job             | Target           | Description                    |
|-----------------|------------------|--------------------------------|
| laravel-backend | `laravel:9000`   | Laravel `/metrics` endpoint    |
| prometheus      | `localhost:9090` | Prometheus self-monitoring     |

If the Laravel app runs on the host (e.g. `php artisan serve`), change the Laravel target in `prometheus.yml` to:

- **Windows/Mac:** `host.docker.internal:9000`
- **Linux:** host IP or use `network_mode: host` for Prometheus.

Ensure your Laravel app exposes HTTP on the chosen port and serves `/metrics` (e.g. via a metrics package).

## Run with Docker Compose

From the project root:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Open http://localhost:9090 for the Prometheus UI.

---

## Loki & Promtail (log aggregation)

- **Loki** stores logs locally (volume `loki_data`), exposes port **3100**.
- **Promtail** discovers containers via Docker socket and tails:
  - **Path:** `/var/lib/docker/containers/<container_id>/<container_id>-json.log` (Docker json-file driver).
- **Labels** attached to log streams: `service`, `container_name`, `log_level`.
- **Structured JSON:** Pipeline parses Docker’s JSON log wrapper and, when the inner `log` field is JSON (e.g. Laravel/PSR-3), extracts `level`/`severity` into the `log_level` label.

**Linux:** Ensure Promtail can read `/var/lib/docker/containers` (compose mounts it).  
**Windows (Docker Desktop):** Run the stack from WSL2 or use a Docker Desktop path that exposes container logs.

---

## Grafana (view logs)

1. Start the stack: `docker-compose -f docker-compose.monitoring.yml up -d`
2. Open **http://localhost:3000** — login `admin` / `admin`.
3. Add Loki as a data source: **Connections → Data sources → Add data source → Loki**.
   - URL: `http://loki:3100` (same Docker network).
   - Save & test.
4. **Explore** (compass icon) → select Loki → query e.g. `{service="loki"}`, `{container_name=~".+"}`, or `{log_level="error"}` to see logs.

---

## Tempo (distributed tracing)

- **tempo-config.yml** enables OpenTelemetry ingestion (OTLP HTTP and OTLP gRPC), local filesystem storage, and exposes port **3200** (API/UI). OTLP endpoints: **4317** (gRPC), **4318** (HTTP).
- **Folder:** `tempo/config.yml`; Docker Compose mounts it and uses volume `tempo_data` for `/var/tempo`.
- **Grafana:** Add Tempo as a data source (URL `http://tempo:3200`) to query traces and link from Loki logs.
