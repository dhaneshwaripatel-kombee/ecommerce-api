# Development Guide

Short guidelines for contributing to this repository: commit conventions, suggested commit order, and example messages.

---

## 1. Commit message conventions

Use **Conventional Commits** so history is consistent and tooling (changelogs, semver) works.

### Format

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

- **Type** (required): `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`, `hotfix`.
- **Scope** (optional): area of change, e.g. `api`, `ui`, `docker`, `observability`, `auth`.
- **Subject**: imperative, lowercase after type, no period at the end, ~50–72 chars.
- **Body** (optional): wrap at 72 chars; explain *what* and *why*, not only *what*.
- **Footer** (optional): `Closes #123`, `BREAKING CHANGE:`.

### Examples

| Message | When to use |
|--------|-------------|
| `feat(api): add product CRUD API` | New product endpoints |
| `fix(api): resolve order stock validation bug` | Bug in order/stock logic |
| `chore(docker): add docker configuration` | Dockerfile, compose, scripts |
| `docs: update README with observability architecture` | README or docs only |
| `feat(ui): add product list and create form` | New frontend feature |
| `chore(observability): add Prometheus scrape config` | Observability config only |

### Rules

- Use **imperative**: “add feature” not “added feature”.
- **No real secrets** in messages or code.
- Reference issues with `Closes #123` or `Refs #456` when relevant.
- Mark breaking changes in the footer: `BREAKING CHANGE: description`.

---

## 2. Suggested commit order for the project

Use this order when building or reorganizing the repo so history tells a clear story:

| Step | Focus | Scope |
|------|--------|--------|
| 1 | Initial project scaffolding | Root layout, .gitignore, README skeleton |
| 2 | Backend API | Laravel app, auth, products, orders |
| 3 | Frontend UI | React app, pages, API client |
| 4 | Docker infrastructure | Dockerfile, compose, MySQL |
| 5 | Observability stack | Prometheus, Loki, Tempo, Grafana, Promtail configs |
| 6 | Metrics instrumentation | Backend `/metrics`, Prometheus scrape |
| 7 | Logging integration | Structured logs, Promtail → Loki |
| 8 | Tracing instrumentation | OTLP/Tempo integration in app |
| 9 | Dashboards | Grafana dashboards and provisioning |
| 10 | Load testing scripts | k6 scripts under `load-testing/k6/` |

---

## 3. Example commit messages per step

Use these as templates; adjust scope and description to match your changes.

| Step | Example message |
|------|-----------------|
| 1 | `chore: add project scaffolding and root .gitignore` |
| 2 | `feat(api): add product CRUD API` |
| 2 | `feat(api): add order API and stock validation` |
| 2 | `feat(auth): add Sanctum login and registration` |
| 3 | `feat(ui): add product list and create form` |
| 3 | `feat(ui): add order management and API integration` |
| 4 | `chore(docker): add Dockerfile and docker-compose for MySQL` |
| 5 | `chore(observability): add Prometheus, Loki, Tempo, Grafana, Promtail configs` |
| 6 | `feat(api): expose /metrics endpoint for Prometheus` |
| 7 | `feat(api): add structured logging for request and errors` |
| 8 | `feat(api): add OpenTelemetry tracing and Tempo export` |
| 9 | `chore(observability): add Grafana dashboards and provisioning` |
| 10 | `chore(load-testing): add k6 API load test script` |

---

## Quick reference

- **Conventions:** Conventional Commits (`type(scope): subject`).
- **Order:** Scaffolding → Backend → Frontend → Docker → Observability → Metrics → Logging → Tracing → Dashboards → Load tests.
- **Examples:** Use the table above; keep messages short and imperative.

For repository layout and architecture, see [ARCHITECTURE.md](ARCHITECTURE.md).
