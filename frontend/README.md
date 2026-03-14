# Ecommerce Admin (React)

Admin UI for the Laravel E-commerce API.

## Stack

- React 18
- Vite 5
- React Router 6
- Axios
- TailwindCSS 3

## Setup

```bash
cd frontend
npm install
```

## Run

Start the dev server (with proxy to the API):

```bash
npm run dev
```

Open http://localhost:5173. Ensure the Laravel API is running at http://localhost:8000 so the proxy works.

## Build

```bash
npm run build
```

Output is in `dist/`. For production, set `VITE_API_URL` to your API base URL (e.g. `https://api.example.com`) so requests go to the correct host.

## Folder structure

- `src/components` – shared UI (Button, Input, Select, Table, Modal, Alert, Layout)
- `src/contexts` – AuthContext
- `src/hooks` – useApi
- `src/pages` – Login, Register, Dashboard, ProductList, OrderList
- `src/services` – api (axios), authService, productService, orderService
- `src/utils` – constants, format

## Features

- **Auth:** Login, Register, protected routes, token in localStorage
- **Products:** List with pagination, filter by name, sort by price; create/edit/delete modals
- **Orders:** List with pagination and status filter; create order (product + quantity); edit order status
