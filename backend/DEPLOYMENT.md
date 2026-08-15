# Deployment checklist

1. Set `NODE_ENV=production`, a unique 32+ character `JWT_SECRET`, the production
   MongoDB replica-set URI, and the exact production `CORS_ORIGIN`.
2. Deploy the API behind HTTPS. Set `TRUST_PROXY=1` and `ENFORCE_HTTPS=true` only
   when the proxy forwards HTTPS requests correctly.
3. Create the first admin once: set the three `BOOTSTRAP_ADMIN_*` variables, run
   `npm run seed:admin`, then remove those variables immediately.
4. Build the frontend with `VITE_API_URL=https://your-api.example/api` and serve
   the `frontend/dist` directory from HTTPS hosting. Configure SPA fallback so
   `/admin` returns `index.html`.
5. Run `npm test` for local checks and `npm run test:integration` only against a
   dedicated non-production Atlas database. That test verifies transaction support
   and rolls its database write back.

Never point integration tests or bootstrap variables at a production database.
