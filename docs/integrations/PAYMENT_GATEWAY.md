# Payment Gateway Integration Contract

Payment integration is intentionally left unconfigured in this release.

## 1. Configure

Set only on the Node server:

```env
PAYMENT_GATEWAY_BASE_URL=https://gateway.example
PAYMENT_GATEWAY_SECRET=server-only-secret
PAYMENT_GATEWAY_TIMEOUT_MS=15000
PAYMENT_WEBHOOK_SECRET=webhook-signing-secret
```

Do not put payment secrets in the frontend.

## 2. Adapter location

The integration boundary is:

```text
server/integrations/payments/gateway.ts
```

Implement gateway-specific request/response mapping there. Do not scatter provider-specific code throughout React components or generic routes.

## 3. Payment creation flow

Recommended:

```text
Frontend
  -> Node
  -> PaymentGateway.request(...)
  -> Payment Provider
  -> checkout/payment UI
```

The frontend must never declare a payment successful by itself.

## 4. Webhook flow

Endpoint:

```text
POST /api/v1/payments/webhook
```

The current Node boundary:

1. receives the raw webhook body;
2. verifies HMAC-SHA256 using `PAYMENT_WEBHOOK_SECRET`;
3. requires an event ID;
4. passes the verified event to `PaymentGateway.handleWebhook()`;
5. returns an acknowledgement.

The exact signature/header format must be adapted to the chosen provider. Current accepted signature headers are `X-Webhook-Signature` and `X-Payment-Signature` using the generic `sha256=<hex>` convention.

## 5. Idempotency — mandatory

Before marking a payment successful:

- validate provider event ID;
- check whether that event was already processed;
- ignore/replay safely if already processed;
- verify amount, currency, merchant/order reference and user/customer reference with the provider;
- only then write the financial result.

Never trust a browser callback as the source of truth.

## 6. Financial storage

Firebase is reserved for the financial/payment layer and explicitly assigned storage. The application content database remains the private API.

A typical successful event should result in a server-side record containing at minimum:

```text
provider
providerEventId
transactionId/orderId
userId
amount
currency
status
createdAt
verifiedAt
```

The exact Firebase collection/schema should be finalized with the selected gateway before production payments are enabled.

## 7. Coins and wallet

Everything Coins and real-money Wallet are separate ledgers.

For a coin purchase:

```text
User -> Node -> Payment Gateway -> verified webhook -> financial record -> coin credit
```

For a coin message:

```text
User -> Node -> verify balance -> financial/coin ledger -> private API pinned message -> owner notification
```

The browser is never authoritative for the coin balance or payment result.
