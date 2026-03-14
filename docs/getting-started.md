# Getting Started

A short guide to run and use the Observability-First E-Commerce project on your machine.

---

## What This Project Is

- **Frontend:** React admin UI (products, orders) at **http://localhost:5173**
- **Backend:** Laravel REST API at **http://localhost:8000** (auth, products, orders)
- **Database:** MySQL in Docker (port 3306)
- **Observability:** Prometheus (metrics), Loki (logs), Tempo (traces), Grafana (UI) — all via Docker

You’ll run MySQL and the observability stack in Docker, then run the Laravel API and React app on your machine.

---

## Prerequisites

- **Docker Desktop** (for MySQL + observability stack)
- **PHP 8.2+** and **Composer** (for Laravel)
- **Node.js 18+** and **npm** (for React)

---

## Step 1: Start MySQL and the observability stack

Open a terminal in the **project root** (`ecommerce-api`):

```powershell
cd c:\Users\dhane\ecommerce-api
```

Start MySQL:

```powershell
docker compose up --build -d
```

Start the monitoring stack (Prometheus, Loki, Tempo, Grafana, Promtail):

```powershell
docker compose -f docker-compose.monitoring.yml up -d
```

Check that containers are running:

```powershell
docker ps
```

You should see `mysql`, `prometheus`, `loki`, `tempo`, `grafana`, `promtail`.

---

## Step 2: Set up and run the backend

In a **new terminal**:

```powershell
cd c:\Users\dhane\ecommerce-api\backend
```

Create `.env` from the example:

```powershell
copy .env.example .env
```

Edit `.env` and set the database connection. When MySQL runs in Docker and you run Laravel on the host, use:

- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_DATABASE=observability_db`
- `DB_USERNAME=app_user`
- `DB_PASSWORD=app_password`

Install dependencies and prepare the app:

```powershell
composer install
php artisan key:generate
php artisan migrate
```

Start the API:

```powershell
php artisan serve
```

Leave this terminal open. The API is at **http://localhost:8000**.

---

## Step 3: Set up and run the frontend

In **another terminal**:

```powershell
cd c:\Users\dhane\ecommerce-api\frontend
npm install
npm run dev
```

Leave this terminal open. The app is at **http://localhost:5173**.

---

## Step 4: Use the application

1. **Open the frontend:** http://localhost:5173  
   - Register a new user or log in.  
   - Use the UI to view/create products and orders (the frontend talks to the API at http://localhost:8000).

2. **Open Grafana:** http://localhost:3000  
   - Login: **admin** / **admin**  
   - Go to **Explore** (compass icon). Select **Prometheus**, **Loki**, or **Tempo** and run a query to see metrics, logs, or traces.

3. **Open Prometheus:** http://localhost:9090  
   - **Status → Targets** to see scrape status.  
   - **Graph** to run PromQL queries (e.g. `up`).

---

## Step 5 (optional): Run a load test

With the API running (`php artisan serve`), in a new terminal from the project root:

```powershell
cd c:\Users\dhane\ecommerce-api
k6 run load-testing/k6/api-load.js
```

(Install k6 first if needed: https://k6.io/docs/getting-started/installation/.)

For the products endpoint (requires a user to exist):

```powershell
k6 run load-testing/k6/basic-load-test.js
```

Use the same email/password as in `.env` or set `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`. Create the user via the frontend (Register) if you haven’t already.

---

## Quick reference

| What            | URL or command |
|-----------------|----------------|
| Frontend        | http://localhost:5173 |
| Backend API     | http://localhost:8000 |
| Grafana         | http://localhost:3000 (admin / admin) |
| Prometheus      | http://localhost:9090 |
| Stop Docker     | `docker compose down` and `docker compose -f docker-compose.monitoring.yml down` |

---

## Using Laragon (or another PHP stack)

The Laravel API lives in the **backend** folder. Laragon’s document root **must** point at **backend\\public**, not at the repo root or the root `public` folder.

1. In Laragon: **Menu → Apache → Virtual Hosts** (or **Nginx → …** if you use Nginx).
2. Edit the virtual host for this project (e.g. `ecommerce-api.test`).
3. Set **Document Root** to:
   ```text
   C:\Users\dhane\ecommerce-api\backend\public
   ```
   Do **not** use:
   - `C:\Users\dhane\ecommerce-api`
   - `C:\Users\dhane\ecommerce-api\public`
4. Save and restart Apache/Nginx.

Then use **http://ecommerce-api.test** (or your configured URL) as **base_url** in Postman. If you keep using the built-in PHP server instead, run it from the backend: `cd backend` then `php artisan serve`, and use **http://localhost:8000** as **base_url**.

---

## Troubleshooting

- **"Failed to open stream... vendor\\laravel\\framework\\... server.php" / "No such file or directory" / "Failed opening required ... ecommerce-api\\vendor\\..."**  
  The server is using the **repo root** instead of the **backend**. The Laravel app and `vendor` are in **backend**, so PHP is looking for `ecommerce-api\vendor`, which does not exist.  
  **Fix:**  
  1. **If using Laragon:** Set the virtual host document root to `C:\Users\dhane\ecommerce-api\backend\public` (see **Using Laragon** above).  
  2. **If using `php artisan serve`:** Run it from the backend folder: `cd c:\Users\dhane\ecommerce-api\backend`, then `php artisan serve`. Use **http://localhost:8000** in Postman.
- **"Connection refused" to MySQL:** Ensure `docker compose up -d` ran and `DB_HOST=127.0.0.1` in `backend/.env`. Wait a few seconds after starting MySQL before running migrations.
- **Frontend can’t reach API:** Confirm the API is at http://localhost:8000 and the frontend is configured to use that base URL (check `frontend` env or API client config).
- **No logs in Loki:** Promtail reads Docker container logs. If the Laravel app runs on the host (not in Docker), only container logs (e.g. Prometheus, Loki) appear; run the app in Docker to see its logs in Loki.
- **Prometheus targets down:** The default config may scrape `laravel:9000` (container). If Laravel runs on the host, change the scrape target in `prometheus/prometheus.yml` to `host.docker.internal:8000` (or your host IP).

For more detail, see the main [README](../README.md) and [submission-checklist.md](submission-checklist.md).
