# Everything — Final Integrated Project

This repository contains the complete Everything frontend and Node.js backend as ONE deployable application.

## One application

Node.js serves:
- the production React frontend
- `/api/v1/*`
- Socket.IO realtime connections
- SPA deep-link fallback

The frontend uses same-origin `/api/v1` and same-origin Socket.IO in production.

## Data ownership

No SQLite, PostgreSQL, MongoDB, Prisma, or other application database is included.

The intended external data source is the user's private API/database/media API. The private API key is server-side only.

Firebase is reserved for payment/financial records and storage explicitly assigned to Firebase.

## Intentionally pending external integrations

Only these provider-specific integrations remain to be configured:

1. Private API/database/media API: `PRIVATE_API_BASE_URL`, `PRIVATE_API_KEY`
2. Payment gateway: `PAYMENT_GATEWAY_BASE_URL`, `PAYMENT_GATEWAY_SECRET`, `PAYMENT_WEBHOOK_SECRET`

No credentials are included in this archive.

## Media

The server provides the media gateway layer for uploads/pulls through the private API. The stream-recording retention setting defaults to a maximum of 6 hours via `MAX_STREAM_STORAGE_HOURS=6`.

## Verification

Static integrated-connection verification passes.

A full TypeScript/build verification could not be executed in this environment because npm dependency installation timed out and the runtime therefore lacks installed `node_modules`. No claim of runtime bug-free status is made until dependencies can be installed and the actual provider contracts are supplied.
