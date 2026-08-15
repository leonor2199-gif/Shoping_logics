# Product Buying & Ordering API — Phase 1

This repository currently contains the backend foundation, authentication, the
catalog layer, and the first financial-safe ordering workflow. Deposits and
withdrawals remain deferred.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` to a MongoDB database you control.
3. Replace `JWT_SECRET` with a unique random value of at least 32 characters.
4. Run `npm run dev` for development, or `npm start` for a regular server run.

The API does not start until both `MONGO_URI` and `JWT_SECRET` are configured.

## Phase 1 routes

- `GET /api/health` — reports service and MongoDB connection status.
- `POST /api/auth/user/register` — creates a user with distinct login and
  withdrawal passwords.
- `POST /api/auth/user/login` — signs in a user with their phone number and
  login password.
- `POST /api/auth/admin/login` — signs in an existing admin. Admin creation is
  intentionally not exposed as a public route.
- `GET /api/auth/me` — returns the signed-in user or admin.
- `GET /api/auth/admin/me` — returns the signed-in admin only.
- `GET/PATCH /api/users/me` — reads or updates the signed-in user's editable
  profile fields.
- `GET /api/vip-levels` — lists active VIP levels; admins can create and update
  levels at this endpoint.
- `GET /api/products` — lists active products with pagination and filters.
- `GET /api/products/available` — lists products the signed-in user's VIP level
  can access.
- `GET /api/products/next` — returns the next product in the signed-in user's
  eligible sequence.
- `POST/PATCH/DELETE /api/products/:id` — catalog management for admins.

Product `basePrice` and `cashbackBonus` are integers in the smallest unit of the
chosen currency (for example, `1999` represents $19.99). This prevents monetary
rounding errors before the financial engine is introduced.

## Order charging rule

On confirmation, an order debits the user's available balance by
`(basePrice + cashbackBonus) × quantity`. Confirmation is a MongoDB transaction:
the balance debit, stock reduction, order status, and immutable purchase ledger
record are committed together. It needs MongoDB replica-set transaction support,
which MongoDB Atlas provides.

## Order routes

- `POST /api/orders` — signed-in user creates a pending order for their next
  eligible product. Each user may have one pending order at a time.
- `GET /api/orders/my` — signed-in user's order history.
- `GET /api/orders` — admin order list.
- `PATCH /api/orders/:id/confirm` — the order owner confirms and atomically
  charges the order; an admin can also confirm as an override. The response
  includes `nextProduct` for the next step in the sequence.
- `PATCH /api/orders/:id/cancel` — cancels a pending order (admin only).

## Deposits and withdrawals

- `PUT /api/users/me/bank-details` — user saves bank details after proving their
  withdrawal password.
- `POST /api/finance/deposit` — creates a pending deposit request; balance does
  not change until an admin approves it.
- `POST /api/finance/withdraw` — verifies the withdrawal password and reserves
  the requested funds immediately, so those funds cannot be spent twice.
- `PATCH /api/finance/deposit/:id/confirm` and
  `PATCH /api/finance/withdraw/:id/confirm` — admin approval routes.
- `PATCH /api/finance/deposit/:id/reject` and
  `PATCH /api/finance/withdraw/:id/reject` — admin rejection routes. A rejected
  withdrawal creates a linked refund ledger record and restores the reserved
  funds.

## Administration and deposit banks

- `GET /api/finance/deposit/bank-details` — active deposit destinations for a
  signed-in user.
- `/api/config/banks` — administrators create, update, reorder, or remove
  deposit bank configurations.
- `GET /api/admin/dashboard/stats` — operational user, order, and settlement
  totals.
- `GET /api/admin/users` — paginated user list with optional `search` and
  `status` filters.
- `PATCH /api/admin/users/:id/status` and `/vip` — administrators control a
  user's account state and VIP access level.

## Checks

Run `npm test` to verify the health and standard error responses without needing
a running MongoDB instance.

## Frontend

The React/Vite frontend is in `frontend/`. Copy `frontend/.env.example` to
`frontend/.env`, then run `npm install` and `npm run dev` from that folder. It
supports user registration/sign-in, available balance, the next-product sequence,
and self-confirmation of an order.

## Production readiness

See [DEPLOYMENT.md](DEPLOYMENT.md). The first administrator is created only by
the explicit `npm run seed:admin` command; there is no public administrator
registration endpoint.
