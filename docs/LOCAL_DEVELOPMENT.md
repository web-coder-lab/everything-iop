# Everything IOP — Development

Everything IOP is server-backed by design. The React client defaults to the same-origin Node API and does not ship seeded/mock content or fake success responses.

## Required development flow

1. Configure the Node server using `.env.example`.
2. Configure `PRIVATE_API_BASE_URL` and `PRIVATE_API_KEY` for the real private API/data system.
3. Run `npm install`.
4. Run `npm run dev`.
5. Keep `VITE_API_ENABLED=true` (the default).

If the private API is unavailable, the UI must show an error/loading state; it must not silently switch to local fake data.

## Optional browser features

Web Push requires a real VAPID public key. Payment/Firebase integrations are separately configured server-side.

## Admin boundary

There is no platform-wide public Admin Panel. Community owners/managers use the scoped Community Control Center. Any future platform operations tooling must remain outside the normal user surface and enforce backend authorization.
