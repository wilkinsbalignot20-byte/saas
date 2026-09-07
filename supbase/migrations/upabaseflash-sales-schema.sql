-- PAGGAWA NG FLASH SALES TABLE CONNECTIVITY SCHEMAS
CREATE TABLE IF NOT EXISTS public.flash_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    campaign_name TEXT NOT NULL DEFAULT 'Mega Flash Sale',
    flash_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- SYSTEM RELATION LINKS
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

-- ENABLE ROW LEVEL SECURITY PRIVILEGES GATES
ALTER TABLE public.flash_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to flash sales" 
ON public.flash_sales FOR SELECT USING (true);

CREATE POLICY "Allow merchant owners to manage flash sales" 
ON public.flash_sales FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.flash_sales.store_id 
    AND public.stores.owner_id = auth.uid()
));
