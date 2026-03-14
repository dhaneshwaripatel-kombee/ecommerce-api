# Dashboards

This folder is the canonical place for **dashboard definitions** used by the observability stack.

- **Grafana:** Provisioned dashboards are loaded from `grafana/provisioning/dashboards/json/`. You can copy or symlink JSON files from this folder into that directory so Grafana picks them up on startup.
- **Ecommerce Observability:** Pre-provisioned dashboards appear in the **Ecommerce Observability** folder in Grafana.

To add a new dashboard, export it from Grafana (JSON) and place it under `grafana/provisioning/dashboards/json/` (or here and then copy there), then restart the Grafana container.
