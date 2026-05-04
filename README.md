# A-Z Housing Solutions — Next.js Migration

A production-ready real estate platform built with **Next.js 14 (App Router)**, **Supabase**, **Tailwind CSS**, and **Google Maps API**. Migrated from a single-file HTML/CSS/JS application.

---

## 📁 Project Structure

```
az-housing/
├── .env.example                    # Environment variable template
├── .env.local                      # Your local secrets (never commit this)
├── next.config.js                  # Next.js config (image domains, etc.)
├── tailwind.config.js              # Tailwind + design tokens
├── tsconfig.json                   # TypeScript config
├── package.json
└── src/
    ├── app/                        # Next.js App Router pages
    │   ├── layout.tsx              # Root layout (Navbar, Footer, Maps loader)
    │   ├── page.tsx                # Home page (/)
    │   ├── buy/
    │   │   └── page.tsx            # For-sale listings (/buy)
    │   ├── rent/
    │   │   └── page.tsx            # For-rent listings (/rent)
    │   ├── property/
    │   │   └── [id]/
    │   │       └── page.tsx        # Property detail (/property/:id)
    │   ├── map-search/
    │   │   └── page.tsx            # Map-based search (/map-search)
    │   ├── blog/
    │   │   ├── page.tsx            # Blog listing (/blog)
    │   │   └── [id]/
    │   │       └── page.tsx        # Blog post (/blog/:id)
    │   ├── landlord/
    │   │   └── page.tsx            # Landlord landing page (/landlord)
    │   ├── post-listing/
    │   │   └── page.tsx            # Create/edit listing (/post-listing)
    │   ├── dashboard/
    │   │   └── page.tsx            # User dashboard (/dashboard)
    │   ├── admin/
    │   │   └── page.tsx            # Admin panel (/admin)
    │   └── auth/
    │       ├── login/
    │       │   └── page.tsx        # Login (/auth/login)
    │       └── register/
    │           └── page.tsx        # Register (/auth/register)
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx          # Sticky navigation bar
    │   │   └── Footer.tsx          # Site footer
    │   ├── listings/
    │   │   ├── PropertyCard.tsx    # Listing card (used in grids)
    │   │   ├── Gallery.tsx         # Photo gallery for property detail
    │   │   └── SearchBar.tsx       # Home-page search bar
    │   ├── map/
    │   │   ├── GoogleMapsLoader.tsx # Loads Maps script once globally
    │   │   ├── MapView.tsx          # Full map search view
    │   │   └── PropertyMap.tsx      # Single-property map
    │   └── ui/
    │       ├── Toast.tsx            # Toast notification
    │       └── HouseSVG.tsx         # Placeholder house icon
    ├── hooks/
    │   ├── useAuth.ts              # Auth state + signIn/signUp/signOut
    │   ├── useListings.ts          # Listings with 60s TTL cache
    │   └── useToast.ts             # Toast notification state
    ├── lib/
    │   ├── api.ts                  # All Supabase CRUD operations
    │   ├── utils.ts                # Helpers, constants, seed data, blog posts
    │   └── supabase/
    │       ├── client.ts           # Browser Supabase client (singleton)
    │       └── server.ts           # Server Supabase client (RSC / Route Handlers)
    ├── styles/
    │   └── globals.css             # Global CSS (design tokens + all component styles)
    └── types/
        └── index.ts                # TypeScript interfaces
```

---

## 🗄️ Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**, choose your organisation, pick a region close to Canada (e.g. **us-east-1**), and set a strong database password.
3. Wait ~2 minutes for the project to provision.

### 2. Run the Database Schema

Open the **SQL Editor** in your Supabase dashboard and run the following SQL in order.

#### Users table

```sql
-- Extend auth.users with profile data
create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  fname       text not null default '',
  lname       text not null default '',
  email       text not null,
  phone       text default '',
  role        text not null default 'buyer',   -- 'buyer' | 'landlord' | 'agent'
  created_at  timestamptz default now()
);

-- Let users read/update their own row; admins see everything
alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Service role can manage users"
  on public.users for all
  using (true)
  with check (true);
```

#### Listings table

```sql
create table public.listings (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  price        numeric not null default 0,
  price_type   text not null default 'sale',        -- 'sale' | 'rent'
  type         text not null default 'House',
  bedrooms     int default 3,
  bathrooms    int default 2,
  area         int default 0,                       -- sq ft
  location     text not null default '',
  address      text default '',
  city         text default '',
  province     text default '',
  lat          double precision,
  lng          double precision,
  description  text default '',
  features     jsonb default '[]',
  images       jsonb default '[]',
  agent_name   text default '',
  agent_email  text default '',
  agent_phone  text default '',
  status       text not null default 'pending',     -- 'pending' | 'approved' | 'rejected'
  author       text default '',                     -- user id or 'seed'
  created_at   timestamptz default now()
);

alter table public.listings enable row level security;

-- Everyone can view approved listings
create policy "Anyone can view approved listings"
  on public.listings for select
  using (status = 'approved');

-- Authenticated users can insert
create policy "Authenticated users can insert listings"
  on public.listings for insert
  with check (auth.role() = 'authenticated');

-- Users can update/delete their own listings
create policy "Users can update own listings"
  on public.listings for update
  using (auth.uid()::text = author);

create policy "Users can delete own listings"
  on public.listings for delete
  using (auth.uid()::text = author);

-- Service role has full access (used by admin)
create policy "Service role full access"
  on public.listings for all
  using (true)
  with check (true);
```

#### Messages table

```sql
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  listing_id   uuid references public.listings(id) on delete cascade,
  name         text not null,
  email        text not null,
  phone        text default '',
  message      text not null,
  viewing_date text default '',
  created_at   timestamptz default now()
);

alter table public.messages enable row level security;

-- Anyone can insert a message (enquiry form)
create policy "Anyone can send a message"
  on public.messages for insert
  with check (true);

-- Only authenticated users can read messages for their own listings
create policy "Listing owner can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = messages.listing_id
      and listings.author = auth.uid()::text
    )
  );

create policy "Service role full access messages"
  on public.messages for all
  using (true)
  with check (true);
```

#### Saved listings table

```sql
create table public.saved (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  listing_id  uuid references public.listings(id) on delete cascade,
  created_at  timestamptz default now(),
  unique(user_id, listing_id)
);

alter table public.saved enable row level security;

create policy "Users manage own saved listings"
  on public.saved for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 3. Create the Storage Bucket

1. In your Supabase dashboard, go to **Storage → New bucket**.
2. Name it `property-photos`.
3. Set it to **Public** (so images can be displayed without signed URLs).
4. Under **Policies**, allow authenticated users to upload:

```sql
-- Allow authenticated uploads
create policy "Authenticated users can upload photos"
  on storage.objects for insert
  with check (
    bucket_id = 'property-photos'
    and auth.role() = 'authenticated'
  );

-- Allow anyone to read photos
create policy "Anyone can view photos"
  on storage.objects for select
  using (bucket_id = 'property-photos');
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
# .env.local

# From Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# From Google Cloud Console → Maps JavaScript API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Admin panel password (choose anything strong)
ADMIN_SECRET=your-admin-password-here
```

### How to find your Supabase keys

1. Go to your project in Supabase dashboard.
2. Click **Project Settings** (gear icon) → **API**.
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### How to get a Google Maps API key

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Enable **Maps JavaScript API** and **Geocoding API**.
4. Go to **Credentials → Create Credentials → API Key**.
5. Restrict the key to your domain for production.

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18.17 or later
- npm 9+ or yarn/pnpm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Add your environment variables (see above)
cp .env.example .env.local
# Edit .env.local with your actual keys

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🌐 Deploying to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follow the prompts)
vercel

# For production
vercel --prod
```

### Option B — GitHub Integration (recommended for teams)

1. Push your project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
3. Import your GitHub repo.
4. Under **Environment Variables**, add all four variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - `ADMIN_SECRET`
5. Click **Deploy**.

Vercel will automatically redeploy on every push to `main`.

### Post-deployment

After deploying, update your Google Maps API key restrictions in Google Cloud Console to allow your Vercel domain (e.g. `your-app.vercel.app`).

In Supabase, go to **Authentication → URL Configuration** and add your Vercel URL to **Redirect URLs**.

---

## 🔐 Authentication Flow

The app uses **Supabase Auth** (email/password) combined with a custom `users` table for profile data.

| Action | How it works |
|--------|-------------|
| Register | Creates a Supabase auth user + inserts a row into `public.users` |
| Login | `supabase.auth.signInWithPassword` |
| Session | `@supabase/ssr` syncs session via cookies (works with SSR) |
| Logout | `supabase.auth.signOut` + clears cookies |
| Protected pages | `useAuth` hook redirects to `/auth/login` if no session |
| Admin panel | Password gate using `ADMIN_SECRET` env var (stored in `localStorage`) |

---

## 🗺️ Maps Integration

- **GoogleMapsLoader** in `layout.tsx` loads the Maps JS script once globally.
- **MapView** (`/map-search`) uses Google Maps for pin markers with InfoWindows. Falls back to a Leaflet map with Nominatim geocoding if the API key is missing.
- **PropertyMap** (`/property/[id]`) geocodes the property address and shows a single pin. Falls back to Leaflet → iframe.
- Map search page uses `dynamic(() => import(...), { ssr: false })` to avoid SSR hydration issues.

---

## 🏗️ Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Global CSS (not Tailwind utilities) | Preserves the exact original design without visual regression |
| Tailwind config maps design tokens | Available for new components needing utility classes |
| Listings cache with 60s TTL | Reduces Supabase reads on repeat navigation |
| Static blog posts in `utils.ts` | Blog content doesn't need a CMS for this scale |
| Seed data via `ensureSeedData()` | First-load auto-seeding so the app never looks empty |
| Admin password in localStorage | Matches original app behaviour; upgrade to Supabase Auth roles for production |

---

## 🐛 Troubleshooting

**Maps not showing**
- Check that `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Ensure **Maps JavaScript API** is enabled in Google Cloud Console
- The app gracefully falls back to Leaflet if the key is missing

**Supabase connection errors**
- Verify your `NEXT_PUBLIC_SUPABASE_URL` ends in `.supabase.co` (no trailing slash)
- Check the anon key hasn't been regenerated in Supabase settings

**Images not loading**
- Ensure the `property-photos` bucket is set to **Public** in Supabase Storage

**RLS blocking reads**
- Re-run the policy SQL above; make sure the `approved` policy exists on `listings`
- For admin operations, verify the `Service role full access` policy was created

**Seed data not appearing**
- Open the browser console; look for errors from `ensureSeedData()`
- Confirm the `listings` table exists and the anon key has insert privileges

---

## 📄 Licence

MIT — free to use, modify, and distribute.
