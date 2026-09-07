-- 1. PAGGAWA NG RETURNS TABLE
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- DETALYE NG DISPUTE
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- 2. PAG-ENABLE NG ROW LEVEL SECURITY (RLS)
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR SECURE ISOLATION LOCK
CREATE POLICY "Allow shop owners to manage returns" 
ON public.returns FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.returns.store_id 
    AND public.stores.owner_id = auth.uid()
));
