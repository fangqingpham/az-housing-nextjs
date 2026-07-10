# A-Z Housing Marketing Dashboard - Stage 1

Stage 1 adds first-party conversion tracking and an admin-only marketing dashboard. It does not connect the Google Analytics Data API or Meta Marketing API.

## SQL migration

Run `supabase/migrations/20260710010000_marketing_dashboard_stage_1.sql`.

The migration creates `public.marketing_events`, adds indexes for common dashboard filters, enables RLS, and allows only authenticated `public.users.role = 'admin'` users to read events. Public visitors do not insert directly into Supabase; events go through `/api/marketing/events`.

The migration also adds attribution columns to existing business tables where practical: `messages`, `tenant_placement_orders`, `referral_partners`, and `referral_submissions`.

## Event names

Primary events: `contact_form_submit`, `whatsapp_click`, `messenger_click`, `phone_click`, `email_click`, `order_form_start`, `order_form_submit`, `referral_signup`, `referral_submission`.

Secondary events supported by the API: `cta_click`, `pricing_view`, `faq_open`.

## Attribution behavior

The client attribution utility captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, and `gclid`.

Attribution is stored for 30 days in local storage and a same-site cookie. First-touch attribution is preserved and is not overwritten by later direct visits. Latest-touch attribution updates only when a new campaign source or click ID is present. Form submissions include the attribution bundle and an anonymous session identifier.

## Tracked forms and buttons

Tracked now:

- Contact page form: `contact_form_submit` after `/api/contact` accepts the message.
- Contact page email card: `email_click`.
- Contact page phone card: `phone_click`.
- Contact page live chat card: `messenger_click`.
- Tenant Placement order form: `order_form_start` after meaningful form interaction; `order_form_submit` after successful server submission.
- Landing Arrangement order form: `order_form_start` after meaningful form interaction; `order_form_submit` after successful server submission.
- Referral Program partner signup: `referral_signup` after successful server submission.
- Referral Program referral submission: `referral_submission` after successful server submission.

The existing GA4 client tag also receives these meaningful events through `window.gtag` when configured. No GA4 reporting data is fetched in Stage 1.

## Admin access

Admins access the dashboard at `/admin/marketing`.

The page uses the existing CRM admin layout and `AdminGuard`. The data API at `/api/admin/marketing` also requires a bearer token and verifies `public.users.role = 'admin'` server-side with the existing `requireStaff` helper.

## How to test events

1. Open the public site with a campaign URL, for example `/contact?utm_source=test&utm_medium=cpc&utm_campaign=stage1&gclid=test-click`.
2. Submit the contact form successfully.
3. Open `/admin/marketing` as an admin.
4. Confirm the event appears in the Events table.
5. Confirm status shows `Tracking active`.
6. Try posting an invalid event to `/api/marketing/events`; it should return `400`.
7. Try reading `marketing_events` from an anonymous Supabase client; RLS should block access.

## Data quality notes

- Full IP addresses are not stored.
- Form message bodies and identity documents are not stored in `marketing_events`.
- Duplicate form conversion events are rejected by the server route and also deduped in session storage on the client.
- Paid orders and revenue show `N/A` where the existing order records do not provide a reliable customer payment status of `paid` or `cleared`.

## Existing forms or records not fully connected

- Paid order and revenue metrics are not calculated from order records yet because the current order table does not expose a reliable customer payment status.
- No generic click tracking was added across the whole website.

## Stage 2

Stage 2 will add the Google Analytics Data API for GA4 reporting such as users, sessions, landing pages, and traffic acquisition.

## Stage 3

Stage 3 will add the Meta Marketing API for campaign spend, impressions, clicks, and ad-level performance.
