-- 1. PAGGAWA NG CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- DETALYE NG KATEGORYA
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    
    -- MULTI-TENANT CONNECTIVITY: Nakatali sa tindahan ng merchant
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    -- IWAS DUPLICATE: Bawal magkapareho ang pangalan ng kategorya sa iisang tindahan
    UNIQUE (store_id, slug)
);

-- 2. PAG-ENABLE NG ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES (Public Read para sa Storefront, Owner Manage para sa Seller)
CREATE POLICY "Allow anyone to read categories" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow shop owners to manage categories" 
ON public.categories FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.categories.store_id 
    AND public.stores.owner_id = auth.uid()
));
