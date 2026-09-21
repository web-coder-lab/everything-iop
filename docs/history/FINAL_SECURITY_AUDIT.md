# Everything — Final Security & UX Pass

## Included hardening
- Helmet security headers and `x-powered-by` disabled.
- Global API rate limiting plus stricter auth/payment/upload limits.
- JSON/urlencoded body limits; media raw parsing is scoped to the upload route.
- Same-origin frontend/API/Socket.IO deployment path.
- Server-only private API and payment secrets.
- Private API authentication uses a server-side secret and forwards the user's bearer token to the private auth contract without putting it in a URL.
- Unknown gateway API routes are denied instead of being blindly proxied.
- Payment webhook endpoint verifies an HMAC-SHA256 signature before writing financial webhook records. Provider-specific header/algorithm mapping remains to be finalized when the gateway contract is supplied.
- Socket.IO requires authenticated connections and restricts room identifiers and typing broadcasts to conversation rooms.
- Request IDs are validated before being echoed in response headers.
- API responses are marked `no-store` to reduce sensitive response caching.
- Production env validation bounds port, private API timeout, and stream retention; stream retention cannot exceed 6 hours.
- Error logging avoids dumping full exception objects into logs.
- Client auth tokens remain in memory rather than localStorage.
- Legacy project storage keys were removed from the frontend source.
- Unknown frontend routes render a 404 surface instead of silently opening Home.
- Responsive layout rules cover desktop, tablet, and mobile workflow surfaces.

## Still intentionally external
1. Private API / database / media API contract and credentials.
2. Payment gateway contract, credentials, and provider-specific webhook signature/header mapping.

No application database (SQLite/PostgreSQL/MongoDB) was added.
