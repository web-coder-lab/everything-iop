# Everything Security Baseline

## Server

Implemented baseline:

- Helmet security headers.
- `X-Powered-By` disabled.
- API no-store cache policy.
- Global and route-sensitive rate limiting.
- Request IDs for tracing.
- JSON/urlencoded body limits.
- Binary upload limits.
- Strict private API path allowlist.
- No arbitrary URL proxying.
- Server-only private API/payment/Firebase secrets.
- Private API user-token separation from the server credential.
- Socket.IO authentication before connection.
- Restricted room identifiers.
- Payment webhook raw-body signature verification boundary.
- Timing-safe webhook signature comparison.
- Graceful shutdown.
- Generic production errors without stack traces/secrets.

## Frontend

The API client keeps the access token in memory rather than persistent localStorage. API calls use same-origin defaults unless explicitly configured.

HTML post content must be sanitized/sandboxed before rendering. User-generated URLs should be validated before navigation. External media should preferably use signed URLs from the private media service.

## Integration developer rules

Never:

- commit `.env` files;
- put private API/payment/Firebase Admin secrets in `VITE_*` variables;
- trust client-side `ownerId` for authorization;
- mark payments successful from a browser response;
- expose private storage credentials;
- build an unrestricted proxy endpoint;
- disable webhook signature verification;
- store raw payment credentials in logs.

## Production checklist

- [ ] HTTPS enabled.
- [ ] `CORS_ORIGIN` restricted to real frontend origins.
- [ ] `TRUST_PROXY` set only when the deployment proxy is trusted.
- [ ] All secrets injected through provider secret storage.
- [ ] Private API uses TLS.
- [ ] Payment webhook URL uses HTTPS.
- [ ] Payment webhook secret rotated if exposed.
- [ ] Firebase service account rotated if previously exposed.
- [ ] Logs checked for accidental secrets.
- [ ] Rate limits reviewed for expected traffic.
