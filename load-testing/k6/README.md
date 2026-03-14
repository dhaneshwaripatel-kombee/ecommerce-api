# k6 Load Tests

Scripts in this folder run with [k6](https://k6.io/). Install k6 first: [Installation guide](https://k6.io/docs/getting-started/installation/).

## Scripts

| Script | Description |
|--------|-------------|
| **basic-load-test.js** | 50 concurrent users for 2 minutes; GET `/api/v1/products`. |
| **spike-test.js** | Ramp to 20 VUs, sudden spike to 200 VUs, hold 1 min, ramp down. |
| **api-load.js** | Light smoke test (root `/`); ramp 10 → 20 → 0 VUs. |

## How to run

From the **repository root**:

```bash
k6 run load-testing/k6/basic-load-test.js
```

```bash
k6 run load-testing/k6/spike-test.js
```

From **this folder** (`load-testing/k6/`):

```bash
k6 run basic-load-test.js
```

```bash
k6 run spike-test.js
```

## Override base URL

Default API base URL is `http://localhost:8000`. Override with:

```bash
k6 run -e BASE_URL=http://localhost:8000 load-testing/k6/basic-load-test.js
```

## Auth (products endpoint)

`basic-load-test.js` and `spike-test.js` call GET `/api/v1/products`, which requires a Bearer token. They log in once in `setup()` using:

- `TEST_USER_EMAIL` (default: `test@example.com`)
- `TEST_USER_PASSWORD` (default: `password`)

Create this user (e.g. via register or seed) before running. Override with:

```bash
k6 run -e TEST_USER_EMAIL=user@test.com -e TEST_USER_PASSWORD=secret load-testing/k6/basic-load-test.js
```

If login fails, the script still runs but requests may return 401; thresholds allow 200 or 401 for the products check.
