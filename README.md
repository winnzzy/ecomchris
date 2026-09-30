# Ecom Chris storefront

A responsive static storefront built with Vite, vanilla JavaScript, and CSS. No backend, database, checkout, or payment collection is included.

## Run locally

```sh
npm install
npm run dev
```

Build with `npm run build`. The static output is in `dist/`. Any static host must serve `index.html` as a fallback for `/shop`, `/contact`, `/privacy`, `/terms`, `/returns`, and `/shipping`.

## Before publishing or sending merchant screenshots

The supplied checklist asks for the DBA on the home page, actual product/service prices, a phone number on the contact page, and privacy, terms, cancellation/refund, and shipping policies. This initial version contains all the requested page structures, but the screenshot did not supply the business's real details. **Do not represent preview data as the merchant's actual operations.**

1. Update `src/config.js`: verify the DBA (and legal name, if different), telephone, email, address, support hours, currency, shipping and returns details.
2. Replace the illustrative catalog, prices, descriptions, and remote Unsplash images with the real inventory and licensed product photos.
3. Replace the draft policy text in `src/main.js` with the company's actual processing, shipping destinations and timelines, costs, cancellation deadlines, return window, eligibility, refund timing, privacy practices, and jurisdiction-specific terms. Have the owner or legal adviser review them.
4. Remove the clearly labeled preview notices only after information is verified. Configure a custom domain and host with HTTPS.
5. If commerce is needed later, connect a real inventory, secure checkout/payment provider, order handling, and privacy-compliant analytics as a separate phase.

The bag is device-local and cannot place an order. It communicates this in the interface. No card fields or fake checkout are present.
