# Postman check

Use the Postman collection to verify the API from **postman/Ecommerce-API.postman_collection.json**.

---

## 1. Import the collection

1. Open Postman.
2. **Import** → choose **postman/Ecommerce-API.postman_collection.json** (from the repo root).
3. The collection **Ecommerce API** appears in the sidebar.

---

## 2. Set the base URL

1. Click the collection **Ecommerce API**.
2. Open the **Variables** tab.
3. Set **base_url**:
   - **Current value:** `http://localhost:8000` (or your API URL, e.g. `http://ecommerce-api.test` if using Laragon).
4. **Save**.

**If you use Laragon:** the virtual host **document root** must be `C:\Users\dhane\ecommerce-api\backend\public`, not the repo root or the root `public` folder. Otherwise you’ll get: *Failed opening required '...ecommerce-api\vendor\laravel\framework\...'*. See [Getting started – Using Laragon](getting-started.md#using-laragon-or-another-php-stack).

---

## 3. Run a quick check

**Step 1 – Health check**

- Open **Health check** → **Send**.
- You should get **200 OK** (and a body like `{"status":"ok"}` if the app exposes `/up`).
- If you get a connection error, start the backend (`php artisan serve` from `backend/`) and/or fix **base_url**.

**Step 2 – Login**

- Open **Authentication** → **Login**.
- Body is pre-filled, e.g. `jane@example.com` / `password`. Change to a user that exists in your DB (or run **Register** first).
- **Send**.
- You should get **200 OK** and a JSON body with `success: true`, `data.user`, and `data.token`.
- The collection **Tests** script saves `data.token` into the **token** variable so other requests use it automatically.

**Step 3 – Protected request**

- Open **Products** → **List products (pagination)**.
- **Send** (no need to set the header manually; it uses `Bearer {{token}}`).
- You should get **200 OK** and a list (or empty `data`).

---

## 4. Collection overview

| Folder / Request      | Purpose |
|------------------------|--------|
| **Health check**       | GET `/up` – API up? |
| **Authentication**     | Register, Login (saves token), Logout |
| **Products**           | Create, List, Filter, Get one, Update, Delete |
| **Orders**             | Create, List, Get one, Update (PATCH), Delete |

**Variables:** `base_url` (required), `token` (set by Login), `product_id`, `order_id` (for single-resource requests).

---

## 5. Typical “full” check order

1. **Health check** → 200  
2. **Register** (or use existing user)  
3. **Login** → 200, token saved  
4. **List products** → 200  
5. **Create product** → 201  
6. **Create order** (use a real `product_id`) → 201  
7. **List orders** → 200  
8. **Logout** → 200  

If any step fails, check **base_url**, that the backend is running, and that the request body/params match the API (see README or backend docs).

---

## 6. Login API troubleshooting

If the **Login** request returns an error, use this checklist:

| Response | Meaning | What to do |
|----------|---------|------------|
| **401 Unauthorized** | Invalid credentials | The user does not exist or the password is wrong. Run **Register** first (Authentication → Register), then use that email/password in Login. Or use credentials of a user you already created. |
| **422 Unprocessable Entity** | Validation failed | Ensure the body is **raw JSON**: `{"email": "jane@example.com", "password": "password"}`. Set **Content-Type** to `application/json` and **Accept** to `application/json`. |
| **404 Not Found** | Route or server wrong | **base_url** must be the API root with no path (e.g. `http://localhost:8000`). The full URL is `{{base_url}}/api/v1/login`. Run the backend from the **backend** folder: `cd backend` then `php artisan serve`. |
| **500 Server Error** | Backend exception | Check `backend/storage/logs/laravel.log`. Common causes: database not migrated (`php artisan migrate`), missing `.env`, or DB connection failure. |
| **Connection refused** | Cannot reach server | Start the API: from `backend/` run `php artisan serve`. Ensure **base_url** is `http://localhost:8000` (or the port you use). |
| **Failed opening required '...ecommerce-api\\vendor\\...'** | Wrong document root | The server is using the repo root; Laravel lives in **backend**. **Laragon:** set document root to `C:\Users\dhane\ecommerce-api\backend\public`. **Or** run `php artisan serve` from the `backend` folder and use `http://localhost:8000`. |

**Quick fix:** Run **Register** with the same body as in the collection (or your own email/password), then run **Login** with that email and password.
