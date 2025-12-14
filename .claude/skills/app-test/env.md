# Environment Configuration

**Last Updated**: 2025-11-29
**Environment**: Local Development

> **IMPORTANT**: Read this file FIRST before executing any skill commands.
> All URLs and paths below are the ACTUAL values to use - substitute them
> wherever you see variable references (like `FRONTEND_URL`) in SKILL.md.

---

## Service URLs

| Variable | Value | Description |
|----------|-------|-------------|
| `FRONTEND_URL` | `http://localhost:5173` | Expo Web app URL |
| `BACKEND_URL` | `http://localhost:8080` | Spring Boot backend URL |
| `BACKEND_HEALTH` | `http://localhost:8080/api/hello` | Backend health check endpoint |
| `AUTH_ENDPOINT` | `http://localhost:8080/api/users` | User management endpoint (Auth not implemented) |

## Paths

| Variable | Value | Description |
|----------|-------|-------------|
| `ARTIFACTS_PATH` | `.playwright/traces/` | Screenshot/trace storage |
| `CONTAINER_APP_PATH` | `/app` | App path inside Docker containers |

## Test Credentials

| Variable | Value | Description |
|----------|-------|-------------|
| `TEST_EMAIL` | `teodora.popescu@student.upt.ro` | Test user email |
| `TEST_PASSWORD` | `TeoStudent$44` | Test user password |

## Docker Containers

| Container | Service | Port |
|-----------|---------|------|
| `db` | PostgreSQL | 5432 |
| `backend` | Spring Boot | 8080 |
| `frontend` | Vite | 5173 |

---

## Updating Values

When changing environments (e.g., local -> GCP -> production):

1. Update the values in the tables above
2. Update "Last Updated" date
3. Update "Environment" label
4. Verify by running Phase 1 (Environment Verification)

---

## Common Environment Presets

### Local Development
```
FRONTEND_URL: http://localhost:5173
BACKEND_URL: http://localhost:8080
BACKEND_HEALTH: http://localhost:8080/api/hello
AUTH_ENDPOINT: http://localhost:8080/api/users
```

### GCP (Current)
```
FRONTEND_URL: http://34.13.240.241:8081
BACKEND_URL: http://34.13.240.241:8000
BACKEND_HEALTH: http://34.13.240.241:8000/
AUTH_ENDPOINT: http://34.13.240.241:8000/auth/token
```
