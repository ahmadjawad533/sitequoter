# SiteQuote

Mobile-first web app that lets small HVAC contractors turn job photos and notes into an AI-drafted, priced quote that a human reviews and sends.

---

## Tech Stack

- **Framework:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS and shadcn/ui
- **Backend & Database:** Supabase (Auth, Postgres with Row-Level Security, Storage)
- **AI Processing:** Google Gemini API (via server-side module `lib/ai/generateQuote.ts` with offline mock mode)
- **PDF Generation:** `@react-pdf/renderer` and print-friendly styles
- **Validation:** Zod

---

## Design System & Hard Rules

- **Mobile First:** Single-column layout, bottom tab bar (`Jobs`, `Dashboard`, `Prices`). Desktop: centered with max width 720px.
- **Palette:**
  - Primary: `#1D4ED8` (deep blue)
  - Accent / Primary button: `#F97316` (safety orange)
  - Success: `#16A34A`
  - Warning: `#D97706`
  - Error: `#DC2626`
  - Background: `#FFFFFF` and `#F3F4F6`
  - Text: `#111827`
  - Border: `#E5E7EB`
- **Typography:** Inter, 16px body text, 48px minimum touch targets.
- **Strict Clean Design:** Flat colors only, no gradients, no emojis as UI icons, no pill buttons (8px or 12px radius), no em dashes, no AI badges.

---

## Getting Started (Step-by-Step for Beginners)

### 1. Prerequisites
Ensure you have Node.js 20+ installed on your computer. Check with:
```bash
node -v
npm -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Open `.env.local` in your editor and fill in the values:
- `NEXT_PUBLIC_SUPABASE_URL`: From your Supabase Project Settings -> API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: From your Supabase Project Settings -> API.
- `SUPABASE_SERVICE_ROLE_KEY`: From your Supabase Project Settings -> API.
- `GEMINI_API_KEY`: From [Google AI Studio](https://aistudio.google.com/app/apikey) (or leave `AI_MODE="mock"` to run without a key).

### 4. Run Database Migrations
In your Supabase SQL Editor, run:
1. `supabase/migrations/20261018000000_init_schema.sql` (Creates all tables and RLS policies)
2. `supabase/migrations/20261018000001_storage.sql` (Creates the private job-photos storage bucket)

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
sitequote/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/          # Authentication routes (login, signup, onboarding)
│   ├── (app)/           # Protected contractor app (jobs, dashboard, prices)
│   ├── q/[token]/       # Public customer quote review page (no login required)
│   ├── privacy/         # Privacy Policy
│   └── terms/           # Terms and Conditions
├── components/          # React components
│   ├── layout/          # AppShell, BottomNav, TopHeader
│   └── ui/              # shadcn/ui primitives (Button, Input, Card, etc.)
├── docs/                # Product requirements & wireframes (MVP_PLAN.md)
├── lib/                 # Core utilities
│   ├── ai/              # AI quote generation (Gemini + mock fallback)
│   ├── supabase/        # Supabase client and server helpers
│   └── utils.ts         # Style merging helpers
├── supabase/            # Database schema & storage migrations
├── .env.example         # Environment template
└── README.md            # Project documentation
```

---

## License

Proprietary. Built for small HVAC contractors.
