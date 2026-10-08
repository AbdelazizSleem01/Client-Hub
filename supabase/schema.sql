-- ==============================================================================
-- Client Management Dashboard - Supabase Database Schema
-- ==============================================================================

-- 1. Create enum types safely (Idempotent)
DO $$ BEGIN
    CREATE TYPE client_status AS ENUM ('active', 'completed', 'pending', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('in_development', 'live', 'completed', 'maintenance', 'paused');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('paid', 'partially_paid', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    status client_status DEFAULT 'active' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    live_url TEXT,
    github_url TEXT,
    vercel_url TEXT,
    server_url TEXT,
    admin_url TEXT,
    image_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status project_status DEFAULT 'in_development' NOT NULL,
    deadline DATE,
    notes TEXT,
    
    -- Payments & Receivables
    total_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    remaining_amount NUMERIC(12, 2) GENERATED ALWAYS AS (total_price - amount_paid) STORED,
    payment_status payment_status DEFAULT 'unpaid' NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Payment Logs Table (For tracking installment payments)
CREATE TABLE IF NOT EXISTS public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    date DATE DEFAULT CURRENT_DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Indexes for fast filtering and joins
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_payment_status ON public.projects(payment_status);

-- 6. Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Trigger to keep payment_status in sync with total_price and amount_paid
CREATE OR REPLACE FUNCTION sync_project_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.amount_paid >= NEW.total_price AND NEW.total_price > 0 THEN
        NEW.payment_status = 'paid';
    ELSIF NEW.amount_paid > 0 THEN
        NEW.payment_status = 'partially_paid';
    ELSE
        NEW.payment_status = 'unpaid';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_sync_project_payment_status ON public.projects;
CREATE TRIGGER trigger_sync_project_payment_status
    BEFORE INSERT OR UPDATE OF total_price, amount_paid ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_project_payment_status();

-- 8. Row Level Security (RLS) Policies (Private Dashboard - Owner Access Only)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own clients" ON public.clients;
CREATE POLICY "Owner can manage own clients"
    ON public.clients
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owner can manage own projects" ON public.projects;
CREATE POLICY "Owner can manage own projects"
    ON public.projects
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owner can manage own payment logs" ON public.payment_logs;
CREATE POLICY "Owner can manage own payment logs"
    ON public.payment_logs
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
