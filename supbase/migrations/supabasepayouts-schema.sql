-- PAGGAWA NG PAYOUTS DISBURSAL LEDGER TABLE SCHEMAS
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    gateway_method TEXT NOT NULL CHECK (gateway_method IN ('gcash', 'maya', 'bdo')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
    
    -- MULTI-TENANT ISOLATION KEY BINDINGS
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

-- ENABLE ROW LEVEL SECURITY PRIVILEGES GATES
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow merchant owners to manage their own payouts ledger" 
ON public.payouts FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.payouts.store_id 
    AND public.stores.owner_id = auth.uid()
));
