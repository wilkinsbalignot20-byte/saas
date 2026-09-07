-- PAGGAWA NG VOUCHERS TABLE PARA SA MARKETING HUB
CREATE TABLE IF NOT EXISTS public.vouchers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- VOUCHER PROPERTIES SPECIFICATIONS CONTRACT
    code TEXT NOT NULL, -- Halimbawa: MANIPU50
    discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true NOT NULL,
    
    -- MULTI-TENANT ISOLATION KEY
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- UNIQUE GUARD RULE: Bawal magkaparehong code ang isang merchant sa kanyang sariling shop
    UNIQUE (store_id, code)
);

-- ENABLE RLS PRIVILEGES SECURITY LOCKS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to store vouchers" 
ON public.vouchers FOR SELECT USING (true);

CREATE POLICY "Allow merchant owners to manage their vouchers" 
ON public.vouchers FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.vouchers.store_id 
    AND public.stores.owner_id = auth.uid()
));
