# Everything — Integrated Frontend + Node.js Server

This repository is now one application. The Node.js server serves the built React frontend and exposes `/api/v1/*` from the same origin in production.

## Data ownership

- **Private API:** all application/content data and media: users, posts, reels, videos, streams, stories, messages, communities, products, events, etc.
- **Firebase:** payment/financial records and only the storage responsibilities explicitly assigned to Firebase.
- **Node.js:** authentication gateway, authorization, business logic, security, payment orchestration, realtime transport, API proxying, and media authorization.
- **No SQLite/PostgreSQL/MongoDB is required.**

## Media

`POST /api/v1/media/upload` accepts raw media bodies and forwards them to the private API. `GET /api/v1/media/:id` resolves media through the private API. The exact private API upload contract will be adapted when its documentation/key is supplied.

The stream recording retention rule is configurable with `MAX_STREAM_STORAGE_HOURS` and defaults to **6 hours**.

## External credentials

Do not put private API keys, Firebase service-account credentials, or payment gateway secrets in the React app. They belong only in server environment/secret storage.

The private API and payment gateway are intentionally not hard-coded because their contracts have not been supplied yet. The server returns explicit configuration errors rather than inventing a provider protocol.

## Run

```bash
npm install
npm run dev
```

For production:

```bash
npm run build
npm start
```

The production Node server serves `dist/` and API routes from the same origin.
