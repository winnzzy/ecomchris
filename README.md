# Socyn Crest storefront

A responsive static storefront for Socyn Crest LLC (clothing & textiles), built with Vite, vanilla JavaScript, and CSS. No backend, database, checkout, or payment collection is included yet — online checkout will be integrated with the payment gateway as a separate phase.

## Run locally

```sh
npm install
npm run dev
```

Build with `npm run build`. The static output is in `dist/`, including standalone HTML entry points for `/shop`, `/contact`, `/privacy`, `/terms`, `/returns`, and `/shipping`. The Render service deploys this directory on each commit to `main`.

## Before publishing or sending merchant screenshots

The supplied checklist asks for the DBA on the home page, actual product/service prices, a phone number on the contact page, and privacy, terms, cancellation/refund, and shipping policies. This initial version contains all the requested page structures and interactive catalog search, filtering, sorting, product details, and a local bag, but the screenshot did not supply the business's real details. **Do not represent preview data as the merchant's actual operations.**

1. Update `src/config.js`: verify the DBA (and legal name, if different), telephone, email, address, support hours, currency, shipping and returns details. The business email is set to socyncrestllc@gmail.com; the phone number and physical address are still placeholders and must be filled in before the site goes to the bank.
2. Replace the illustrative catalog, prices, descriptions, and remote Unsplash images with the real inventory and licensed product photos.
3. Replace the draft policy text in `src/main.js` with the company's actual processing, shipping destinations and timelines, costs, cancellation deadlines, return window, eligibility, refund timing, privacy practices, and jurisdiction-specific terms. Have the owner or legal adviser review them.
4. Remove the clearly labeled preview notices only after information is verified. Configure a custom domain and host with HTTPS.
5. If commerce is needed later, connect a real inventory, secure checkout/payment provider, order handling, and privacy-compliant analytics as a separate phase.

The bag is device-local and cannot place an order. It communicates this in the interface. No card fields or fake checkout are present.

## Accounts, checkout & admin panel

The store now includes full customer accounts and an admin console:

- **Signup / login** — header "Account" button opens the auth dialog; sessions persist. Customers get an `/account` page with order history.
- **Checkout** — bag → `/checkout` (login required) → shipping address → order placed. Online payment is not live yet (pending bank/payment-gateway approval), so checkout notes that the store will contact the customer to arrange payment.
- **Admin console** — `/admin` (linked in the footer). Dashboard (revenue, orders, products, customers), product management (add/edit/delete), order status management, and customer list.

**Two modes:** without Supabase keys the site runs on a local demo backend (browser storage) with seeded demo data — everything above is fully clickable right now. Demo admin access: `admin@socyncrest.com` / `Crest2026!`.

**Going live with Supabase:** create a project at supabase.com, run `supabase/schema.sql` in the SQL editor, copy `.env.example` to `.env` with your project URL and anon key, make your user admin (`update profiles set is_admin = true where email = 'you@example.com'`), rebuild and deploy. The site switches to Supabase automatically — no code changes.

## Architecture notes (built to grow)

The front end is structured so it can evolve into a full e-commerce store with an admin panel without a rewrite:

- `src/api.js` — the single data layer. Every view reads products through it. Today it serves the local `src/config.js` catalog; when the backend lands, only this file changes (swap for `fetch()` calls).
- `src/store.js` — observable cart store with localStorage persistence. This is where server-side cart sync and user accounts will plug in.
- `src/main.js` — views only. Product cards, shop filters, and the bag all render from the store.
- `/admin` — reserved route rendering a branded "under construction" panel. The future admin console (inventory, orders, customers, content) will mount here.

## Roadmap to full e-commerce

1. ~~**Backend** — products/inventory API, then `src/api.js` switches from local config to `fetch()`.~~ **Done** — `src/backend/` (local demo + Supabase adapters, same interface).
2. ~~**Accounts** — sign-in, order history.~~ **Done** — auth dialog, `/account` page.
3. ~~**Admin panel** — product/inventory management, order fulfillment.~~ **Done** — `/admin` console (dashboard, products, orders, customers).
4. **Checkout** — partially done (order placement works); integrate the payment gateway (post-bank-approval) for live card payments.
5. **Unify catalog** — serve the storefront product grid from the backend products table (single source of truth) instead of the local config.
6. **Real photography** — replace Unsplash placeholders with licensed product photos before launch.
