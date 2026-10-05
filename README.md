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

## Architecture notes (built to grow)

The front end is structured so it can evolve into a full e-commerce store with an admin panel without a rewrite:

- `src/api.js` — the single data layer. Every view reads products through it. Today it serves the local `src/config.js` catalog; when the backend lands, only this file changes (swap for `fetch()` calls).
- `src/store.js` — observable cart store with localStorage persistence. This is where server-side cart sync and user accounts will plug in.
- `src/main.js` — views only. Product cards, shop filters, and the bag all render from the store.
- `/admin` — reserved route rendering a branded "under construction" panel. The future admin console (inventory, orders, customers, content) will mount here.

## Roadmap to full e-commerce

1. **Backend** — products/inventory API, then `src/api.js` switches from local config to `fetch()`.
2. **Checkout** — integrate the payment gateway (post-bank-approval); replace the bag drawer's "coming soon" note with real checkout.
3. **Accounts** — sign-in, order history, saved addresses; cart sync moves server-side in `src/store.js`.
4. **Admin panel** — build the real console at `/admin`: product/inventory management, order fulfillment, returns handling, and content editing.
5. **Real photography** — replace Unsplash placeholders with licensed product photos before launch.
