# Load Testing

Load testing is done with **k6** to generate scripted HTTP traffic against the application. The goal is to validate behavior under load and to produce observable effects (latency, throughput, errors) that can be inspected in Prometheus and Grafana.

---

## Prerequisites

- **k6** installed on the machine that will run the tests (not inside the app container).  
  Install: [k6 documentation](https://k6.io/docs/getting-started/installation/) (e.g. `brew install k6`, Windows Chocolatey, or direct binary).

- **Application and observability stack running** so you can correlate load with metrics, logs, and traces. Start the backend (and optionally frontend), then start the monitoring stack:

  ```bash
  docker compose -f docker-compose.monitoring.yml up -d
  ```

---

## Script Location and Structure

Scripts live under **`load-testing/k6/`**. The default script used in this repo is **`api-load.js`**.

### What the script does

- **Target:** HTTP GET requests to a configurable base URL (default `http://localhost:8000`), hitting the root path `/` (Laravel web route). You can change the path or add more requests (e.g. `/api/v1/products`) in the script.
- **Load pattern:** Configurable **stages** in `options.stages`:
  - Ramp up to 10 virtual users over 30s.
  - Hold 20 virtual users for 1m.
  - Ramp down to 0 over 30s.
- **Thresholds:** The script defines success criteria in `options.thresholds`:
  - `http_req_duration`: e.g. p95 under 2000 ms.
  - `http_req_failed`: e.g. failure rate under 10%.

If a threshold is violated, k6 exits with a non-zero status, which is useful for CI or runbooks.

---

## How to Run

From the **repository root**:

```bash
k6 run load-testing/k6/api-load.js
```

This uses the default base URL `http://localhost:8000`. Ensure the Laravel backend is listening on that host/port.

### Overriding the base URL

To point at another host or port:

```bash
k6 run -e BASE_URL=http://localhost:8000 load-testing/k6/api-load.js
```

Or, for a remote API:

```bash
k6 run -e BASE_URL=https://api.example.com load-testing/k6/api-load.js
```

### Optional: more iterations or duration

You can override stages or add a fixed number of iterations; see [k6 options](https://k6.io/docs/using-k6/options/). Example with 10 VUs and 100 iterations:

```bash
k6 run --vus 10 --iterations 100 load-testing/k6/api-load.js
```

---

## Interpreting Results

- **k6 stdout:** Summary and trend data (request count, rate, duration percentiles, failure rate) are printed at the end. Use this for a quick pass/fail and approximate numbers.
- **Grafana / Prometheus:** While the test runs, observe request rate and latency (e.g. from the Laravel `/metrics` endpoint scraped by Prometheus), error rate, logs in Loki, and traces in Tempo. This correlation is what makes the load test useful for observability.

---

## Extending the Tests

- **More endpoints:** Add extra `http.get()` or `http.post()` calls in the default function (e.g. login then call `/api/v1/products` with an auth header). Use k6 `check()` and thresholds to assert status codes.
- **Auth:** Store the token from a login response and set `Authorization: Bearer <token>` on subsequent requests.
- **New scripts:** Add more `.js` files under `load-testing/k6/` for different scenarios. Run them with `k6 run load-testing/k6/<script>.js`.
- **CI:** The same command can be run in CI against a staging URL; set `BASE_URL` and tune thresholds for the environment.

---

## Summary

| Item        | Detail |
|------------|--------|
| Tool       | k6 |
| Script     | `load-testing/k6/api-load.js` |
| Default URL| `http://localhost:8000` |
| Override   | `-e BASE_URL=<url>` |
| Thresholds | p95 duration, failure rate (see script) |
| Observability | Correlate with Prometheus, Loki, Tempo in Grafana |

For anomaly injection (e.g. slow queries or artificial delays) used while load testing, see [anomaly-injection.md](anomaly-injection.md).
