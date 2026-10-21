# SiteQuote MVP: Production Deployment Guide

This guide walks you through deploying SiteQuote to production using **Supabase** (database, authentication, and file storage) and **Vercel** (Next.js hosting and edge functions), with **Google Gemini 2.5 Flash** powering the AI quotation engine.

---

## 1. Architecture Overview

- **Frontend & Server**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, shadcn/ui.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) policies and Email/Password authentication.
- **Object Storage**: Supabase Storage (`job-photos` bucket) for job site equipment photos.
- **AI Engine**: Google Gemini API (`gemini-2.5-flash`) via the official `@google/genai` SDK.
- **Dual Persistence Architecture**: Supports instant offline mock mode (`AUTH_MODE=mock`, `AI_MODE=mock`) for local demos, and live cloud persistence (`AUTH_MODE=live`, `AI_MODE=live`) for production.

---

## 2. Prerequisites

Before starting, ensure you have:
1. **GitHub Account**: To host the repository.
2. **Supabase Account**: Sign up free at [supabase.com](https://supabase.com).
3. **Google AI Studio Account**: Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).
4. **Vercel Account**: Sign up free at [vercel.com](https://vercel.com).
5. **Node.js**: Version 18.17 or higher (Node 20 recommended).

---

## 3. Step-by-Step Deployment Instructions

### Step 1: Provision Supabase Database & Storage

1. **Create a New Project**:
   - Log in to your [Supabase Dashboard](https://app.supabase.com).
   - Click **New Project**.
   - Select your organization, enter a project name (e.g., `sitequote-prod`), set a secure database password, and choose your preferred region.
   - Wait 1 to 2 minutes for the database to provision.

2. **Execute Database Migrations**:
   - In your Supabase project, navigate to the **SQL Editor** in the left sidebar.
   - Click **New Query**.
   - Open [`supabase/migrations/20261018000000_init_schema.sql`](supabase/migrations/20261018000000_init_schema.sql) in this repository.
   - Copy the entire SQL script, paste it into the SQL Editor, and click **Run**.
   - Confirm that tables are created: `companies`, `profiles`, `customers`, `price_book_items`, `jobs`, `job_photos`, `quotes`, `quote_lines`, and `quote_revisions`.

3. **Configure Storage Bucket**:
   - In Supabase, navigate to **Storage** in the left sidebar.
   - Confirm that a bucket named `job-photos` exists. If not, click **New Bucket**, enter `job-photos`, and leave it set to public or restricted to authenticated uploads as defined in the migration.
   - Ensure the file size limit is set to at least `10MB` and allowed MIME types include `image/jpeg`, `image/png`, and `image/webp`.

4. **Retrieve API Credentials**:
   - Go to **Project Settings** > **API**.
   - Copy the following three values:
     - **Project URL**: (e.g., `https://your-project.supabase.co`)
     - **Project API Keys - `anon` public key**: (Used on frontend and client requests)
     - **Project API Keys - `service_role` secret key**: (Used for secure server-side route handlers)

---

### Step 2: Obtain Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com).
2. Sign in with your Google account.
3. Click **Get API key** in the top navigation.
4. Click **Create API key** and select or create a Google Cloud project.
5. Copy your generated API key (e.g., `AIzaSy...`).

---

### Step 3: Local Environment Verification

Before deploying to Vercel, verify that the application compiles and passes all checks locally:

```bash
# 1. Clone your repository
git clone <your-repo-url>
cd sitequote

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Fill in your keys in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# GEMINI_API_KEY=your-gemini-api-key
# NEXT_PUBLIC_APP_URL=http://localhost:3000
# AUTH_MODE=live
# AI_MODE=live

# 5. Run typecheck and lint
npm run lint
npx tsc --noEmit

# 6. Verify production build
npm run build
```

---

### Step 4: Deploy to Vercel

1. **Push Code to GitHub**:
   - Ensure your latest commits are pushed to your GitHub repository on branch `main`.
   - Confirm `.env.local` is **never committed** (it is protected in `.gitignore`).

2. **Import into Vercel**:
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New...** > **Project**.
   - Choose your GitHub Git repository and click **Import**.

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js (detected automatically).
   - **Root Directory**: `./`
   - **Build Command**: `next build` (default).
   - **Output Directory**: `.next` (default).

4. **Add Environment Variables**:
   Under **Environment Variables**, enter the following keys for **Production**, **Preview**, and **Development**:

| Variable Name | Environment | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview | Your Supabase project URL (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview | Your Supabase anon public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview | Your Supabase service role secret key |
| `GEMINI_API_KEY` | Production, Preview | Your Google Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | Production, Preview | Model identifier, defaults to `gemini-3.8-flash` |
| `NEXT_PUBLIC_APP_URL` | Production | Your canonical public URL (e.g., `https://quote.yourdomain.com`) |
| `AUTH_MODE` | Production | Set to `live` for real Supabase authentication |
| `AI_MODE` | Production | Set to `live` for live Gemini quote drafting |

5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build the application, optimize images and font bundles, and deploy edge middleware.
   - Deployment typically completes in under 90 seconds.

---

### Step 5: Custom Domain & DNS Setup

To use your own company domain (e.g., `quote.apexhvac.com` or `sitequote.io`):

1. In your Vercel project, go to **Settings** > **Domains**.
2. Enter your desired domain or subdomain and click **Add**.
3. Vercel will provide DNS records:
   - For a **subdomain** (e.g., `quote.apexhvac.com`): Add a `CNAME` record in your DNS provider pointing `quote` to `cname.vercel-dns.com`.
   - For an **apex domain** (e.g., `sitequote.io`): Add an `A` record pointing `@` to `76.76.21.21`.
4. Wait for DNS propagation (typically 2 to 15 minutes).
5. Vercel automatically provisions and renews a free Let's Encrypt SSL/TLS certificate.
6. Update `NEXT_PUBLIC_APP_URL` in Vercel Environment Variables to your custom domain, and redeploy the latest commit.

---

## 4. Production Smoke Test Checklist

Once deployed, complete this 5-minute walkthrough on a mobile device or desktop browser:

1. **Authentication & Onboarding**:
   - Visit your production URL (e.g., `https://quote.yourcompany.com`).
   - Click **Sign up** and register a test account (`owner@yourcompany.com`).
   - Complete the onboarding form: Enter company name, phone number, default hourly labor rate ($95), markup (20%), and minimum margin (25%).

2. **Price Book Management**:
   - Go to the **Prices** tab.
   - Click **Import CSV** and upload [`public/sample_price_book.csv`](public/sample_price_book.csv) or add individual items.
   - Confirm parts appear with pricing, units, and categories.

3. **Create Job with Mobile Capture**:
   - Navigate to the **Jobs** tab and tap **+ New Job**.
   - Enter a homeowner name and address.
   - Upload 1 to 3 equipment photos or nameplate photos.
   - Dictate or type technician notes (e.g., *"Dual run capacitor swollen and leaking oil. 45/5 MFD replacement required."*).
   - Tap **Generate quote**.

4. **Review and Send Quote**:
   - Review AI draft line items on Screen 4.
   - Tap `[why?]` to verify the diagnostic reasoning explanation.
   - Inspect the real-time profit margin indicator.
   - Tap **Send quote** to copy the public homeowner link.

5. **Customer One-Tap Approval**:
   - Open the copied `/q/[token]` link in a private browser window or mobile phone.
   - Verify company branding, customer details, parts and labor subtotal, and grand total.
   - Tap **Approve this quote**.
   - Verify green celebratory approval state with timestamp.

6. **Technician Dashboard Verification**:
   - Return to your technician account.
   - Go to **Jobs**: Verify the job has automatically moved to the **Won** tab.
   - Go to **Dashboard**: Verify the **Quotes sent**, **Approved quotes**, **Approved value ($)**, and **Avg time to send** metrics reflect the completed quote.

---

## 5. Troubleshooting & FAQ

### Problem: "AI quote draft failed" or timeout
- **Resolution**: Verify `GEMINI_API_KEY` is set in Vercel Environment Variables and does not contain extra spaces or quotes. Check that your Google Cloud account has billing enabled if you exceed standard free tier request quotas.

### Problem: Photo uploads fail
- **Resolution**: In the Supabase Dashboard, go to **Storage** > **Policies** for the `job-photos` bucket. Verify that authenticated users have `INSERT` and `SELECT` permissions as defined in `supabase/migrations/20261018000000_init_schema.sql`.

### Problem: Voice dictation does not start
- **Resolution**: Web Speech API requires an active `HTTPS` connection and microphone permissions in mobile Safari or Chrome. Local testing over `http://localhost` is allowed by browsers, but production testing must be served over `https://`.

### Problem: Next.js CSR bailout error during build
- **Resolution**: Next.js App Router requires any page calling `useSearchParams()` to be wrapped in `<React.Suspense>`. All SiteQuote routes have been pre-configured with Suspense boundaries.

---

## 6. Maintenance & Support

- **Database Backups**: Supabase performs automatic daily backups for paid tiers, and point-in-time recovery (PITR) is available.
- **Monitoring**: Check Vercel Analytics and Supabase Database Reports for API latency and query execution times.
- **Support**: For questions or assistance, contact support@sitequote.local or refer to the official documentation in `docs/MVP_PLAN.md`.
