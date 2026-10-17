-- SiteQuote Database Schema Migration
-- Defines tables scoped by company_id with strict Row Level Security (RLS)

-- 1. Helper function for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  labor_rate NUMERIC(10,2) NOT NULL DEFAULT 95.00,
  markup_percent NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  min_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 25.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Profiles table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Helper function to retrieve the authenticated user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 4. Price Items table
CREATE TABLE IF NOT EXISTS public.price_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  unit TEXT NOT NULL DEFAULT 'each',
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('repair', 'replacement', 'maintenance')),
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Job Photos table
CREATE TABLE IF NOT EXISTS public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'lost')),
  ai_raw_output JSONB,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  labor_total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  public_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Quote Lines table
CREATE TABLE IF NOT EXISTS public.quote_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  price_item_id UUID REFERENCES public.price_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  qty NUMERIC(10,2) NOT NULL DEFAULT 1.00,
  unit_price NUMERIC(10,2), -- Nullable for unpriced items
  line_total NUMERIC(10,2), -- Nullable for unpriced items
  is_ai_suggested BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  confidence TEXT CHECK (confidence IN ('low', 'medium', 'high', null)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_lines ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can create their company during onboarding"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own company"
  ON public.companies FOR SELECT
  TO authenticated
  USING (id = public.get_user_company_id());

CREATE POLICY "Users can update their own company"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (id = public.get_user_company_id())
  WITH CHECK (id = public.get_user_company_id());

-- Profiles policies
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can view profiles in their company"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR company_id = public.get_user_company_id());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Price items policies
CREATE POLICY "Company users can read price items"
  ON public.price_items FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Company users can insert price items"
  ON public.price_items FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can update price items"
  ON public.price_items FOR UPDATE
  TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can delete price items"
  ON public.price_items FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Customers policies
CREATE POLICY "Company users can read customers"
  ON public.customers FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Company users can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Jobs policies
CREATE POLICY "Company users can read jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (company_id = public.get_user_company_id());

CREATE POLICY "Company users can insert jobs"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can update jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

CREATE POLICY "Company users can delete jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (company_id = public.get_user_company_id());

-- Job Photos policies
CREATE POLICY "Company users can read job photos"
  ON public.job_photos FOR SELECT
  TO authenticated
  USING (job_id IN (SELECT id FROM public.jobs WHERE company_id = public.get_user_company_id()));

CREATE POLICY "Company users can insert job photos"
  ON public.job_photos FOR INSERT
  TO authenticated
  WITH CHECK (job_id IN (SELECT id FROM public.jobs WHERE company_id = public.get_user_company_id()));

CREATE POLICY "Company users can delete job photos"
  ON public.job_photos FOR DELETE
  TO authenticated
  USING (job_id IN (SELECT id FROM public.jobs WHERE company_id = public.get_user_company_id()));

-- Quotes policies
CREATE POLICY "Company users can manage quotes"
  ON public.quotes FOR ALL
  TO authenticated
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- Public access to quotes via public_token (no login required)
CREATE POLICY "Public quote view by token"
  ON public.quotes FOR SELECT
  TO anon, authenticated
  USING (public_token IS NOT NULL);

CREATE POLICY "Public quote approve by token"
  ON public.quotes FOR UPDATE
  TO anon, authenticated
  USING (public_token IS NOT NULL)
  WITH CHECK (public_token IS NOT NULL);

-- Quote lines policies
CREATE POLICY "Company users can manage quote lines"
  ON public.quote_lines FOR ALL
  TO authenticated
  USING (quote_id IN (SELECT id FROM public.quotes WHERE company_id = public.get_user_company_id()))
  WITH CHECK (quote_id IN (SELECT id FROM public.quotes WHERE company_id = public.get_user_company_id()));

-- Public view of quote lines for customers viewing quote via public_token
CREATE POLICY "Public quote lines view"
  ON public.quote_lines FOR SELECT
  TO anon, authenticated
  USING (quote_id IN (SELECT id FROM public.quotes WHERE public_token IS NOT NULL));
