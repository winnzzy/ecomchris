# Socyn Crest — Resend email setup

The store sends two kinds of email through Resend:
1. **Order receipts** — via the `send-order-email` edge function (already coded, in `supabase/functions/`).
2. **Signup confirmation + password reset** — via Resend as Supabase's custom SMTP provider, with branded templates (in `supabase/email-templates/`).

Everything code-side is done and pushed. The steps below need the Resend account and domain, which only the owner can create.

## 1. Create the Resend account
- Sign up at https://resend.com
- Free tier: 100 emails/day — plenty for a new store.

## 2. Verify the socyncrest.com domain
- Resend dashboard → **Domains** → **Add Domain** → `socyncrest.com`
- Resend shows DNS records (SPF, DKIM, DMARC). Add them at the domain registrar (wherever socyncrest.com was bought).
- Wait for status to turn **Verified** (usually minutes, can take up to 24h).

## 3. Create an API key
- Resend dashboard → **API Keys** → **Create API Key**
- Name it `socyn-crest-store`, permission **Sending access**
- Copy the key (`re_...`) — it shows only once.

## 4. Point Supabase auth emails at Resend (custom SMTP)
- Supabase dashboard → **Project Settings** → **Configuration** → **Auth** → **SMTP Settings** → enable **Custom SMTP**:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: the API key from step 3
  - Sender email: `contact@socyncrest.com`
  - Sender name: `Socyn Crest`
- Save. All signup-confirmation and password-reset emails now send from your domain.

## 5. Brand the auth email templates
- Supabase dashboard → **Authentication** → **Email Templates**
- Open **Confirm signup** → replace the body with `supabase/email-templates/confirm-signup.html`
- Open **Reset Password** → replace the body with `supabase/email-templates/reset-password.html`
- Save each.

## 6. Deploy the order-receipt function
On any machine with the Supabase CLI (one-time setup):
```bash
supabase login
supabase link --project-ref wauorgolhkolavxaochj
supabase secrets set RESEND_API_KEY=re_your_key_here
# optional: supabase secrets set RESEND_FROM="Socyn Crest <orders@socyncrest.com>"
supabase functions deploy send-order-email
```
`RESEND_FROM` must be an address on the verified domain.

## 7. Test
1. Sign up on the live site with a real email → branded confirmation email arrives from `contact@socyncrest.com`.
2. Use **Forgot password** → branded reset email arrives.
3. Place a test order → receipt email arrives with order number, items, and totals.

## Notes
- The storefront calls the function fire-and-forget: if Resend is down or the key is missing, checkout still succeeds — the failure is logged to the browser console and the receipt is simply skipped.
- The function verifies the caller's JWT and checks the order belongs to them, so customers can only trigger receipts for their own orders.
- Never put the Resend API key in the website code or Vercel env vars — it lives only as a Supabase function secret.
