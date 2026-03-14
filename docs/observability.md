# Observability

This document describes how **metrics**, **logs**, and **distributed traces** are implemented and how they fit into the observability stack. The goal is to give operators and developers a single, correlated view of system behavior in Grafana.

---

## The Three Pillars

| Pillar   | Tool       | Role |
|----------|------------|------|
| Metrics  | Prometheus | Numeric time series: request rate, latency, errors, resource usage. |
| Logs     | Loki       | Log streams from containers and the application, queryable by labels and text. |
| Traces   | Tempo      | Distributed traces (spans) from the application via OpenTelemetry (OTLP). |

All three are exposed in **Grafana** via provisioned datasources, so you can jump from a metric spike to logs and traces without leaving the UI.

---

## Metrics

### Purpose

Metrics answer questions like: How many requests per second? What is p95 latency? What is the error rate? They are scraped on a fixed interval and stored as time series, making them suitable for dashboards and alerting.

### Implementation

1. **Backend exposure**  
   The Laravel backend exposes a **Prometheus-compatible metrics endpoint** (e.g. `/metrics`). This endpoint returns plain-text metrics in the Prometheus exposition format (e.g. `http_requests_total`, `http_request_duration_seconds`). Implementation can be done via a community package or a small custom endpoint that increments counters and histograms for HTTP requests and key operations.

2. **Scraping**  
   **Prometheus** scrapes this endpoint on a schedule. Configuration lives in `prometheus/prometheus.yml`:
   - **Job `laravel-backend`:** `metrics_path: /metrics`, target `laravel:9000` (when the app runs as a container) or `host.docker.internal:8000` (when Laravel runs on the host and Prometheus in Docker).
   - **Job `prometheus`:** Self-monitoring at `localhost:9090`.
   - Global `scrape_interval` (e.g. 15s) applies unless overridden per job.

3. **Storage and querying**  
   Prometheus stores time series locally and exposes a query API. Grafana is provisioned with a Prometheus datasource pointing at the Prometheus service (e.g. `http://prometheus:9090` on the Docker network), so you can run PromQL queries and build dashboards.

### What to measure

- HTTP request count and duration (by route, method, status).
- Optional: queue size, database connection pool, business events (e.g. orders created). Keep cardinality under control (avoid high-cardinality labels like full request IDs in metrics).

---

## Logs

### Purpose

Logs provide event-level detail: errors, request summaries, and business events. They are essential for debugging and for correlating with traces (e.g. “show me logs for this trace ID”).

### Implementation

1. **Emission**  
   The Laravel backend (and other services) write logs to **stdout/stderr** in a structured format (e.g. JSON with `level`, `message`, `context`). When running in Docker, these streams become container logs managed by the Docker daemon (typically the `json-file` log driver).

2. **Collection**  
   **Promtail** runs as an agent that:
   - Uses **Docker service discovery** (`docker_sd_configs`) to find containers.
   - Tails each container’s log file under `/var/lib/docker/containers/<id>/<id>-json.log`.
   - Parses the Docker JSON wrapper and, when the inner `log` field is JSON, extracts `level`/`severity`/`message`.
   - Attaches **labels** such as `service`, `container_name`, and `log_level` (from the parsed level/severity).
   - Pushes log streams to **Loki** via the Loki push API.

   Configuration: `promtail/config.yml`. On Linux, the Docker socket and container log directory are mounted so Promtail can discover and read logs. On Windows (Docker Desktop), equivalent paths or WSL2 may be required.

3. **Storage and querying**  
   **Loki** stores log streams in a format optimized for aggregation by labels. It exposes a query API (LogQL). Grafana is provisioned with a Loki datasource (e.g. `http://loki:3100`), so you can query logs by label (`{service="laravel"}`, `{log_level="error"}`) and full-text search, and use trace-to-logs to jump from a Tempo trace to related log lines.

### Log pipeline (Promtail)

- **Stages:** `json` (parse Docker and inner log JSON), `template` (derive `log_level` from `level` or `severity`), `labels` (add `log_level` as a label), `labelallow` (restrict to allowed labels to avoid high cardinality).
- **Output:** Log lines are sent to Loki with labels like `service`, `container_name`, `log_level`, enabling filtered queries and correlation with traces.

---

## Traces

### Purpose

Distributed traces show the path of a request across services and layers (e.g. HTTP handler → database query → external call). They help identify slow or failing operations and provide trace IDs that can be linked to logs and metrics.

### Implementation

1. **Instrumentation**  
   The Laravel backend is instrumented with **OpenTelemetry** (or compatible SDK): HTTP requests create spans, and key operations (e.g. DB queries, external calls) create child spans. Span metadata (trace ID, span ID, duration, status) is propagated where needed.

2. **Export**  
   Spans are exported via **OTLP** (OpenTelemetry Protocol) to **Tempo**:
   - **OTLP gRPC** on port **4317**
   - **OTLP HTTP** on port **4318**

   Configuration: `tempo/config.yml` enables both receivers. The application (or an OTLP exporter in the app) is configured to send to the Tempo service (e.g. `http://tempo:4318` or `tempo:4317` for gRPC).

3. **Storage and querying**  
   Tempo stores traces in local blocks (and optionally object storage). Grafana is provisioned with a Tempo datasource (e.g. `http://tempo:3200`). You can search traces by trace ID or other attributes, inspect span timelines, and use **trace-to-logs** and **trace-to-metrics** to jump to the corresponding log lines or metric series in Grafana.

### Correlation

- **Trace ID in logs:** If the application adds `trace_id` (and optionally `span_id`) to log context, LogQL queries can filter by `trace_id=<id>` to see all logs for a given trace.
- **Grafana:** When viewing a trace in Tempo, use “Trace to logs” / “Trace to metrics” to open the same request in Loki or Prometheus.

---

## Grafana

- **Datasources:** Prometheus, Loki, and Tempo are provisioned in `grafana/provisioning/datasources/`, so they are available by default after the stack starts.
- **Dashboards:** JSON dashboards can be placed in `grafana/provisioning/dashboards/json/` and are loaded into the **Ecommerce Observability** folder (or as configured in `grafana/provisioning/dashboards/dashboards.yml`).
- **Explore:** Use Explore to run ad-hoc PromQL, LogQL, and trace queries and to test correlation (trace → logs, trace → metrics).

---

## Port Reference

| Service    | Port | Purpose |
|-----------|------|---------|
| Prometheus| 9090 | UI and query API |
| Loki      | 3100 | Log API |
| Tempo     | 3200 | Trace API/UI; 4317 OTLP gRPC; 4318 OTLP HTTP |
| Grafana   | 3000 | Web UI |

For run instructions and repository layout, see [architecture.md](architecture.md) and the root [README.md](../README.md).
