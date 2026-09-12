-- ==============================================================================
-- Transformer Oil Service & Warranty Management System
-- Schema Migration 001: Core Tables, Relationships, Indexes, & RLS Policies
-- ==============================================================================

-- 1. Create Trigger Function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Table: Companies
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for companies updated_at
DROP TRIGGER IF EXISTS set_companies_updated_at ON public.companies;
CREATE TRIGGER set_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. Table: Transformers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transformers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    model_number VARCHAR(100),
    capacity_kva NUMERIC(10, 2),
    location VARCHAR(255),
    installation_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for transformers updated_at
DROP TRIGGER IF EXISTS set_transformers_updated_at ON public.transformers;
CREATE TRIGGER set_transformers_updated_at
    BEFORE UPDATE ON public.transformers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 4. Table: Service Records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.service_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transformer_id UUID NOT NULL REFERENCES public.transformers(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    warranty_expiry_date DATE NOT NULL,
    oil_type VARCHAR(100),
    quantity_liters NUMERIC(10, 2),
    technician_notes TEXT,
    serviced_by UUID, -- Foreign key reference to auth.users(id) when Auth is enabled in Phase 3
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. Performance Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transformers_company_id 
    ON public.transformers(company_id);

CREATE INDEX IF NOT EXISTS idx_service_records_transformer_id 
    ON public.service_records(transformer_id);

CREATE INDEX IF NOT EXISTS idx_service_records_warranty_expiry 
    ON public.service_records(warranty_expiry_date);

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Configuration
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;

-- Production Security Policy Strategy:
-- In Phase 3, authentication will be connected and policies will restrict access
-- based on authenticated user session token (auth.role() = 'authenticated').

-- Authenticated Users Access Policies
CREATE POLICY "Enable read/write for authenticated users on companies" 
    ON public.companies 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Enable read/write for authenticated users on transformers" 
    ON public.transformers 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Enable read/write for authenticated users on service_records" 
    ON public.service_records 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
