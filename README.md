# Truck Assist Admin Portal

Next.js + Supabase admin portal starter for the existing Truck Assist PostgreSQL/Supabase backend.

## Current database assumptions

Tables already identified from the existing schema:
- users
- drivers
- mechanics
- vehicles
- service_requests
- request_status_history
- service_categories
- mechanic_services
- payments
- auth_otps

Roles currently reported:
- DRIVER
- MECHANIC

Request statuses currently reported:
- CREATED
- SEARCHING
- ASSIGNED
- MECHANIC_EN_ROUTE
- ARRIVED
- IN_PROGRESS
- PAYMENT_PENDING
- COMPLETED
- CANCELLED

## Local setup

1. Install Node.js 20.9+.
2. Copy `.env.example` to `.env.local`.
3. Put the Supabase project URL and publishable key into `.env.local`.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open http://localhost:3000.

## Security

Do not put a Supabase service-role/secret key in the browser or in NEXT_PUBLIC_* variables. Use the publishable key with RLS. The admin role/table policy still needs to be finalized before production access is enabled.
