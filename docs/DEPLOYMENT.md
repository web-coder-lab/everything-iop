# Everything Deployment / Handoff

## One service

Build and run:

```bash
npm install
npm run build
npm start
```

Node serves:

```text
GET /                    React SPA
GET /api/v1/health/live  liveness
GET /api/v1/health/ready readiness + non-secret integration flags
GET /api/v1/integration/status integration state
/api/v1/*                application API boundary
/socket.io/*             realtime
```

## Docker

The supplied `Dockerfile` builds frontend and backend together and starts `dist-server/index.js`.

## Render

`render.yaml` is configured as a single web service with `autoDeploy: true`. Connect the repository in the provider dashboard and add production secrets as server environment variables.

## Environment variables

Required later:

```env
PRIVATE_API_BASE_URL=
PRIVATE_API_KEY=
PAYMENT_GATEWAY_BASE_URL=
PAYMENT_GATEWAY_SECRET=
PAYMENT_WEBHOOK_SECRET=
```

Firebase variables are only needed when the financial/storage layer is enabled.

## Do not deploy secrets in the repository

Use the provider's secret manager/environment settings. `.env.example` contains names only.

## Health verification

After deployment:

```bash
SMOKE_BASE_URL=https://your-domain.example npm run verify:connection
```

The smoke test verifies the liveness endpoint, readiness endpoint and SPA root.
