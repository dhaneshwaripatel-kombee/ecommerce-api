# Postman collection

Import **Ecommerce-API.postman_collection.json** into Postman to test the API.

## Quick start

1. **Import**
   - Open Postman → **Import** → select `Ecommerce-API.postman_collection.json`.
   - Optionally import `Ecommerce-API-Local.postman_environment.json` and select it as the active environment.

2. **Base URL**
   - Collection variable `base_url` defaults to `http://localhost:8000`. Change it in the collection or in the environment if your server runs elsewhere.

3. **Authentication**
   - Run **Authentication → Login** (or **Register**) with valid credentials.
   - The **Login** request has a test script that saves the returned token into the `token` variable. All protected requests use `Authorization: Bearer {{token}}`.

4. **IDs**
   - After creating a product or order, set `product_id` or `order_id` in the collection/environment to the returned ID so **Update** and **Delete** requests target the right resource.

## Requests included

| Folder        | Request                    | Method | Description                          |
|---------------|----------------------------|--------|--------------------------------------|
| Authentication | Register                   | POST   | Create user; returns token           |
| Authentication | Login                      | POST   | Get token (saved to variable)         |
| Authentication | Logout                     | POST   | Revoke current token                  |
| Products      | Create product             | POST   | Create product                        |
| Products      | List products (pagination) | GET    | `per_page`, `page`                    |
| Products      | Filter products by name    | GET    | `name`, optional `price_min`/`price_max` |
| Products      | Get single product        | GET    | `/products/:id`                      |
| Products      | Update product             | PUT    | `/products/:id`                       |
| Products      | Delete product             | DELETE | `/products/:id`                      |
| Orders        | Create order               | POST   | `product_id`, `quantity`, optional `status` |
| Orders        | List orders                | GET    | `per_page`, optional `status`        |
| Orders        | Get single order           | GET    | `/orders/:id`                         |
| Orders        | Update order               | PATCH  | `/orders/:id` (status only)           |
| Orders        | Delete order               | DELETE | `/orders/:id`                         |

Each request includes sample bodies and example responses where relevant.
