# Anomaly Injection

Anomaly injection is the **intentional introduction of faults or degraded behavior** into the system so that teams can practice detecting and diagnosing issues using the observability stack. This document describes the patterns used in this project: slow queries, artificial delays, and error spikes, and how they appear in metrics, logs, and traces.

---

## Purpose

- **Validate observability:** Confirm that metrics, logs, and traces actually capture the anomaly (e.g. latency spike, error count, slow span).
- **Practice runbooks:** Use Grafana, Prometheus, and Loki to go from symptom (e.g. “high latency”) to cause (e.g. “slow query on route X”).
- **Hackathon/demo:** Demonstrate correlation between injected behavior and observability signals in a controlled way.

Anomaly injection should be **controllable** (e.g. feature flag or dedicated route) and **safe** (no data corruption, no impact on real users in production if accidentally left on).

---

## Slow Queries

### What it is

Artificially slow database access: extra sleep in a query, a heavy query (e.g. full scan), or an intentional `SLEEP()` in raw SQL. The goal is to increase database-bound time so it shows up in traces and latency metrics.

### How it can be implemented

- **Laravel:** In a specific route or controller, run a raw query that includes a delay (e.g. `DB::select('SELECT SLEEP(2)')`) or execute a deliberately heavy query. Alternatively, wrap the DB call in `usleep()` or a loop that holds the request open.
- **Scope:** Restrict to a dedicated “chaos” or “demo” route (e.g. `GET /api/v1/demo/slow`) or guard with an environment variable so it is disabled in production.

### What you should see

- **Traces (Tempo):** A long span for the database or the HTTP handler; the span duration and hierarchy make it clear the time is spent in the DB layer.
- **Metrics (Prometheus):** Higher request duration (e.g. histogram or p95) for that route or globally; possibly higher DB connection or query duration if such metrics are exported.
- **Logs (Loki):** Request logs with higher duration or slow-query log lines if the app logs them.

Use this to practice: “We see high p95 latency → open Tempo → find slow trace → see long DB span → check logs for query/details.”

---

## Artificial Delays

### What it is

Controlled latency added at the application layer (e.g. middleware or route handler) without touching the database. Typically implemented with `usleep()` or `sleep()` in PHP so that every request to a given endpoint is delayed by a fixed or random amount.

### How it can be implemented

- **Laravel:** In middleware or in a specific controller action, call `usleep(500_000)` (0.5s) or `sleep(2)` (2s) before continuing. Attach the middleware to a demo route (e.g. `GET /api/v1/demo/delay`) or toggle via config so it does not affect normal traffic.
- **Variation:** Random delay within a range (e.g. 1–3 seconds) to simulate variable latency.

### What you should see

- **Traces (Tempo):** The HTTP span (or a dedicated “delay” span) shows the added time; total trace duration increases.
- **Metrics (Prometheus):** Request duration for that endpoint (or overall if traffic is concentrated there) increases; rate may stay the same.
- **Load tests (k6):** When running `load-testing/k6/api-load.js` against the delayed endpoint, k6 reports higher latency and possibly threshold failures. Correlate with Grafana to confirm the spike is visible in the same time window.

Use this to practice: “k6 shows high latency → Prometheus shows high duration for route X → Tempo shows long span for X → we know the delay is in the app, not the DB.”

---

## Error Spikes

### What it is

Forcing a subset of requests to fail (e.g. 500, 503) or to return errors at a configurable rate. This exercises error-rate metrics, error logs, and failed spans in traces.

### How it can be implemented

- **Laravel:** In a demo route or middleware, use a random check (e.g. `random_int(1, 100) <= $errorRate`) to throw an exception or return a 5xx response. The error rate can be read from config or an env var (e.g. `CHAOS_ERROR_RATE=0` for off, `30` for 30%).
- **Scope:** Limit to a specific route (e.g. `GET /api/v1/demo/errors`) so normal API behavior is unchanged.

### What you should see

- **Metrics (Prometheus):** Increase in `http_requests_total{status="500"}` or similar; error rate and possibly alerting if configured.
- **Logs (Loki):** More error-level entries; stack traces or error messages in log context. Filter by `log_level="error"` or `container_name="laravel"`.
- **Traces (Tempo):** Spans marked as failed (error status); trace view shows which span failed.
- **k6:** Higher `http_req_failed` rate; threshold on failure rate may fail.

Use this to practice: “Error rate alert → Loki for recent errors → Tempo for a failed trace → identify route and exception.”

---

## Safe Usage

- **Feature flag or env:** Gate all anomaly injection (e.g. `CHAOS_ENABLED=false`, `CHAOS_SLOW_QUERY=false`) so it is off by default and in production.
- **Dedicated routes:** Prefer routes like `/api/v1/demo/*` or `/internal/chaos/*` that are not used by the real frontend and can be restricted by network or auth in production.
- **Documentation:** Document which routes or flags control anomaly injection (e.g. in this file or in a runbook) so evaluators and operators know what to turn on for demos or drills.

---

## Summary

| Anomaly        | Implementation idea                    | Observable in |
|----------------|----------------------------------------|---------------|
| Slow queries   | `SLEEP()` or heavy query in Laravel   | Tempo (long DB span), Prometheus (latency), Loki (slow-query logs) |
| Artificial delay | `usleep()` / `sleep()` in route/middleware | Tempo (long span), Prometheus (latency), k6 (high latency) |
| Error spikes   | Random 5xx or exception in demo route  | Prometheus (error rate), Loki (error logs), Tempo (failed spans), k6 (failures) |

Combined with [load-testing.md](load-testing.md), anomaly injection gives a repeatable way to validate that the observability stack correctly captures and correlates real-world failure modes.
