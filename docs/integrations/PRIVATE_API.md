# Private API / Database Integration Contract

This project intentionally does **not** contain the application's database. The private API is the source of truth for users, profiles, posts, reels, videos, stories, live streams, messages, communities, marketplace data, events, and media metadata.

## 1. Configure

Set these variables only on the Node server:

```env
PRIVATE_API_BASE_URL=https://your-private-api.example
PRIVATE_API_KEY=server-only-secret
PRIVATE_API_TIMEOUT_MS=15000
PRIVATE_API_UPLOAD_MAX_MB=100
```

Never put these in `VITE_*` variables.

## 2. Authentication contract

Everything receives the user's access token from the frontend as:

```http
Authorization: Bearer <user-access-token>
```

Node verifies it by calling:

```http
GET /auth/me
Authorization: Bearer <PRIVATE_API_KEY>
X-User-Token: <user-access-token>
```

Expected successful shape:

```json
{
  "user": {
    "id": "user_123"
  }
}
```

`id`, `uid`, `user.id`, or `user.uid` are accepted by the current auth adapter.

## 3. Resource API contract

Frontend requests are sent to Node as `/api/v1/<resource>`. Node safely forwards the same application path to the private API after checking the resource-family allowlist.

Allowed resource families:

```text
/auth
/users
/profiles
/feed
/posts
/reels
/videos
/stories
/live
/conversations
/communities
/events
/products
/seller
/wallet
/coins
/subscriptions
/creator
/business
/ads
/developer
/bots
/notifications
/search
/safety
/settings
/media
/uploads
/html
```

Examples:

```text
GET  /api/v1/posts/123
POST /api/v1/posts
GET  /api/v1/reels/abc
GET  /api/v1/videos/xyz
GET  /api/v1/communities/123
POST /api/v1/conversations/123/messages
GET  /api/v1/products/456
```

The private API should return JSON. The Node gateway wraps successful results in the standard Everything response:

```json
{
  "success": true,
  "data": {},
  "meta": { "requestId": "..." }
}
```

If your private API already returns `{ success, data, meta }`, the frontend client also tolerates that shape.

## 4. User authorization

Node adds the end-user token to the private API as `X-User-Token`. The private API remains responsible for resource-level authorization:

- Can this user edit this post?
- Can this user read this conversation?
- Can this user moderate this community?
- Can this user access this wallet/creator/business resource?

Do not trust `ownerId`, `userId`, `creatorId`, or similar IDs sent by the browser as proof of ownership.

## 5. Media

Media metadata belongs to the private API. The recommended flow is:

```text
Browser
  -> Node /api/v1/media/upload or /uploads
  -> Private API
  -> Private media storage
  -> signed/authorized media URL returned
  -> Browser player/viewer
```

Uploads are binary and are protected by a configurable size limit (`PRIVATE_API_UPLOAD_MAX_MB`, default 100 MB).

For media delivery, prefer short-lived signed URLs or an authenticated media endpoint. Do not expose private storage credentials to the browser.

## 6. Stream recordings

Set:

```env
MAX_STREAM_STORAGE_HOURS=6
```

The private media service must apply this as the maximum retention window for stream recordings. The Node server does not silently extend it.

## 7. Error contract

Recommended private API error shape:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Never return private API secrets, database connection strings, stack traces, or internal credentials in error responses.

## 8. Required implementation checklist

The private API developer should confirm:

- [ ] `/auth/me` works with `X-User-Token`.
- [ ] All resource families above are implemented as needed by the enabled frontend features.
- [ ] Authorization is enforced server-side.
- [ ] Pagination is supported for feeds, search, messages, notifications, members, products, etc.
- [ ] IDs are opaque and validated.
- [ ] Upload MIME/type/size validation exists.
- [ ] Signed media URLs expire.
- [ ] Stream recordings expire within 6 hours maximum.
- [ ] Idempotency exists for money/coin/notification operations where required.
- [ ] Audit logs exist for security-sensitive operations.
- [ ] Rate limits exist on auth, messaging, uploads, search, and mutation endpoints.
