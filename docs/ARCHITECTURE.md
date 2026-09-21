# Everything — Final Architecture

## Deployment shape

Everything is one deployable Node.js application:

```text
Browser / Android WebView
        |
        | HTTPS + Socket.IO
        v
Everything Node.js
  |       |       |
  |       |       +--> Firebase Admin (financial records / explicitly assigned storage)
  |       +----------> Payment Gateway (external, not configured in this release)
  +------------------> Private API / Database / Media Storage (external, not configured in this release)
```

The React/Vite frontend is compiled into `dist/` and served by the same Node process. API traffic is `/api/v1/*`; realtime traffic uses Socket.IO on the same origin.

## Source layout

```text
src/                         React frontend
  components/                UI and product surfaces
  lib/api/                   typed frontend API adapters
  lib/                       API, websocket, notification and client infrastructure
  lib/websocket/             realtime client
  stores/                    app state
  types/                     shared frontend types
server/
  config/                    environment parsing and validation
  core/                      auth, errors, request IDs
  integrations/
    private-api/             private API gateway adapter
    payments/                payment gateway adapter + webhook boundary
    firebase/                Firebase Admin adapter
  routes/                    Node API boundary and safe proxy allowlist
  index.ts                   HTTP + Socket.IO server
scripts/                     static and runtime verification helpers
docs/                        handoff and integration documentation
```

## Important boundary

The browser never receives:

- `PRIVATE_API_KEY`
- Firebase Admin private key
- `PAYMENT_GATEWAY_SECRET`
- `PAYMENT_WEBHOOK_SECRET`
- database credentials

Only the Node server talks to the private API and payment gateway with server-side credentials.

## Data ownership

- Product/content/social data: private API/database.
- Media files: private API/media storage.
- Payment/financial records: Firebase financial layer plus payment gateway events as specified by the payment integration.
- No SQLite/PostgreSQL/MongoDB is introduced by this project.

## Stream retention

`MAX_STREAM_STORAGE_HOURS` is validated to a maximum of **6 hours**. The private media system must enforce deletion/expiry of retained stream recordings using this value.
