-- 1. PAGGAWA NG PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- MGA DETALYE NG PRODUKTO (Galing sa iyong listahan)
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT, -- Stock Keeping Unit para sa tracking
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    stock INT NOT NULL DEFAULT 0,
    category TEXT,
    brand TEXT,
    image_url TEXT, -- Link ng uploaded item photo galing storage
    
    -- MULTI-TENANT CONNECTIVITY: Nakakandado sa saktong tindahan
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 2. PAGGAWA NG ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- MGA DETALYE NG TRANSACTION
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'completed', 'cancelled')),
    
    -- CUSTOMER PROFILE BINDINGS (Opsyonal para sa tracking)
    customer_name TEXT,
    customer_phone TEXT,
    shipping_address TEXT,
    
    -- MULTI-TENANT CONNECTIVITY: Kung aling tindahan ang nagkabenta
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE
);

-- 3. PAG-ENABLE NG ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES PARA SA PRODUCTS (Public Read, Owner Write)
CREATE POLICY "Allow anyone to browse products" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow shop owners to manage products" 
ON public.products FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.products.store_id 
    AND public.stores.owner_id = auth.uid()
));

-- 5. RLS POLICIES PARA SA ORDERS (Shop Owner Only Read/Write)
CREATE POLICY "Allow shop owners to manage their own orders" 
ON public.orders FOR ALL TO authenticated 
USING (EXISTS (
    SELECT 1 FROM public.stores 
    WHERE public.stores.id = public.orders.store_id 
    AND public.stores.owner_id = auth.uid()
));
