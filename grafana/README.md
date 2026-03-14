# Grafana provisioning

Grafana loads these at startup. No need to add data sources or dashboards manually.

## Login (default)

| Field    | Value    |
|----------|----------|
| **URL**  | http://localhost:3000 |
| **User** | `admin`  |
| **Pass** | `admin`  |

Change `GF_SECURITY_ADMIN_USER` and `GF_SECURITY_ADMIN_PASSWORD` in `docker-compose.monitoring.yml` to set different credentials.

## Folder structure

```
grafana/
├── provisioning/
│   ├── datasources/
│   │   └── datasources.yml    # Prometheus, Loki, Tempo
│   └── dashboards/
│       ├── dashboards.yml     # Provider: load JSON from json/
│       └── json/              # Place dashboard .json files here
└── README.md
```

## Data sources (auto-added)

| Name       | Type      | URL                    |
|-----------|-----------|------------------------|
| Prometheus | prometheus | http://prometheus:9090 |
| Loki      | loki      | http://loki:3100       |
| Tempo     | tempo     | http://tempo:3200      |

Prometheus is the default. Tempo is configured for trace-to-logs (Loki) and trace-to-metrics (Prometheus).

## Dashboards

- Provider name: `default`
- Folder in Grafana: **Ecommerce Observability** (uid: `ecommerce`)
- Add JSON files under `provisioning/dashboards/json/`; they are picked up on startup and every 30s.

## Docker Compose

Volumes in `docker-compose.monitoring.yml`:

- `./grafana/provisioning/datasources` → `/etc/grafana/provisioning/datasources`
- `./grafana/provisioning/dashboards` → `/etc/grafana/provisioning/dashboards`

Start the stack: `docker-compose -f docker-compose.monitoring.yml up -d`
