# Final QA Checklist

## Static checks

- [x] `npm run static:check`
- [ ] `npm run server:check`
- [ ] `npm run build`
- [ ] `npm run verify:connection`
- [x] `unzip -t` on release archive

## Frontend

- [ ] Auth/signup/OTP screens
- [ ] Feed tabs and post actions
- [ ] Stories viewer
- [ ] Reels viewer
- [ ] Videos/watch page
- [ ] Live/watch/studio
- [ ] Messaging/group messaging
- [ ] Communities/control center
- [ ] Marketplace/seller/buyer flows
- [ ] Events
- [ ] Wallet/Coins/subscriptions
- [ ] Creator/Business/Developer surfaces
- [ ] Notifications
- [ ] Search
- [ ] Profile/settings/security
- [ ] Deep links after refresh
- [ ] Mobile width / tablet / desktop
- [ ] Loading / empty / error states
- [ ] Modal / dropdown / overflow behavior

## Backend

- [ ] Health endpoints
- [ ] Auth boundary
- [ ] Private API connectivity
- [ ] Resource allowlist
- [ ] Upload limits
- [ ] Socket authentication
- [ ] Rate limiting
- [ ] CORS
- [ ] Security headers
- [ ] Payment webhook signature verification
- [ ] Payment event idempotency
- [ ] Firebase financial/storage integration

## External integrations

The release is intentionally considered **not financially/live-content complete** until the private API and payment gateway are connected and their provider-specific tests pass.

## Current audit status

See `docs/AUDIT-REPORT.md` for the verified PASS / BLOCKED / NOT_CONFIGURED matrix. Runtime/build checks remain blocked until dependencies can be installed and the external Private API/payment contracts are configured.
