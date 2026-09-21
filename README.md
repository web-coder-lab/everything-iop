# Everything IOP — Complete Platform

A unified frontend foundation for **Everything IOP**: one identity connecting social feed, Stories, Reels, videos, Live, messaging, Community OS, marketplace, events, creator tools, business tools, developer tools, subscriptions, Everything Coins, Wallet and security.

## Important product rule
There is **no platform-wide Admin Panel** in Everything IOP. Community owners/managers use a scoped **Community Control Center** for their own communities.

## Included surfaces
- Email-first signup/login flow and profile setup
- Feed, Stories, Reels, Videos and Live
- Unified 1:1/group/community messaging
- Community OS + Community Control Center
- Marketplace + Seller Center with direct buyer/seller chat workflow
- Events
- Creator Studio and monetization UI
- Business Center
- Developer Dashboard, apps, bots, OAuth, webhooks and automation UI
- Everything Coins + separate real-money Wallet UI
- Monthly / 6-month / 1-year subscription UI
- Notifications, Search, Profile, Settings and Security
- Trust & Safety report flow
- Responsive desktop/mobile experience and PWA shell

## Server-only product mode
Production product flows are server-backed. There is no seeded/mock content fallback and no fake success path. The frontend defaults to the same-origin Node API; set `VITE_API_ENABLED=false` only for development diagnostics, not as a product runtime.

## Verification
The environment used to package this archive did not have the project's dependencies installed. `npm install` timed out twice, and the available global TypeScript compiler could not run because the project dependency `vite/client` was unavailable. Therefore this archive is **not claimed as fully build-verified** in this environment.

## Unified production deployment

Everything is intentionally deployed as **one Node.js application**. The Node.js server serves the compiled React/Vite frontend and exposes `/api/v1/*` plus Socket.IO from the same origin. There is no separate frontend deployment required.

Production build:

```bash
npm install
npm run build
npm start
```

The container build is provided by `Dockerfile`; `render.yaml` is a ready blueprint for a Render web service with `autoDeploy: true`. Configure the provider's repository connection and server-side secrets there; frontend assets are rebuilt automatically as part of the same server deployment.

Connection checks:

```bash
npm run verify:connection
```

The smoke test checks the live API endpoint, readiness endpoint, and SPA root from the same origin.

### Runtime configuration

- `PRIVATE_API_BASE_URL` / `PRIVATE_API_KEY`: private content/data API; server-side only.
- Firebase variables: payment/financial integration and explicitly assigned storage only.
- `PAYMENT_*`: payment gateway integration, to be supplied after final project verification.
- `MAX_STREAM_STORAGE_HOURS=6`: maximum retained stream-recording duration.

Do not put private API, Firebase Admin, or payment secrets in `VITE_*` variables.

## Final developer handoff

This release is structured so an external developer can integrate the remaining services without searching the whole codebase.

Read in this order:

1. `docs/ARCHITECTURE.md`
2. `docs/integrations/PRIVATE_API.md`
3. `docs/integrations/PAYMENT_GATEWAY.md`
4. `docs/SECURITY.md`
5. `docs/DEPLOYMENT.md`
6. `docs/QA-CHECKLIST.md`
7. `INTEGRATION_STATUS.json`

The two intentionally unfinished external integrations are isolated to:

- `server/integrations/private-api/client.ts`
- `server/integrations/payments/gateway.ts`

The Node route boundary is in `server/routes/api.ts`.

No private API key, payment secret, Firebase Admin credential, or database credential belongs in source control or in the React bundle.
