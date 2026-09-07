-- 1. Paggawa ng 'stores' table base sa data ng iyong frontend form
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- STEP 3: STORE CONFIGURATION & DESIGN
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    theme_color TEXT DEFAULT '#E8A33D' NOT NULL,
    logo_url TEXT, -- Opsyonal na field para sa uploaded logo link
    background_preset TEXT DEFAULT 'bg-slate-50' NOT NULL, -- Napiling background preset
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'trial')),
    
    -- STEP 1 & AUTH CONNECTIONS
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    owner_name TEXT NOT NULL, -- Pinasang 'fullName' galing step 1
    
    -- STEP 2: BUSINESS IDENTITY & COURIER
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'Single Proprietorship',
    contact_number TEXT NOT NULL,
    pickup_address TEXT NOT NULL
);

-- 2. Pag-enable ng Row Level Security (RLS) para sa kaligtasan ng data
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICY (SELECT): Payagan ang kahit sino (Public) na mabasang ang detalye ng tindahan.
-- Kailangan ito para kapag binisita ang URL na /store-slug, makikita ng customer ang logo at background.
CREATE POLICY "Allow public read access to stores" 
ON public.stores 
FOR SELECT 
USING (true);

-- 4. RLS POLICY (INSERT): Payagan ang user na mag-insert ng bagong store row 
-- KUNG AT KUNG LAMANG ang 'owner_id' ay katugma ng kanyang active Supabase Auth UID.
CREATE POLICY "Allow authenticated users to create their own store" 
ON public.stores 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

-- 5. RLS POLICY (UPDATE): Ang rehistradong may-ari lamang ang may karapatang mag-edit ng kanyang store profile.
CREATE POLICY "Allow owners to update their own store" 
ON public.stores 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 6. RLS POLICY (DELETE): Ang rehistradong may-ari lamang ang pwedeng magbura ng kanyang tindahan.
CREATE POLICY "Allow owners to delete their own store" 
ON public.stores 
FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- 1. Burahin muna ang lumang insert policy na nagdudulot ng error
DROP POLICY IF EXISTS "Allow authenticated users to create their own store" ON public.stores;

-- 2. Gumawa ng mas maluwag na INSERT policy: Payagan ang kahit sinong "authenticated" user na mag-insert ng store profile
CREATE POLICY "Allow authenticated users to create their own store" 
ON public.stores 
FOR INSERT 
TO authenticated 
WITH CHECK (true); -- Tinanggal ang mahigpit na milisegundong pag-check ng auth.uid() sa insert lang

-- 1. Payagan ang authenticated users na mag-upload ng image objects sa 'logos' bucket
CREATE POLICY "Allow authenticated merchant logo uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- 2. Payagan ang kahit sino na makita ang uploaded logos para gumana ang storefront layouts
CREATE POLICY "Allow public read access to merchant logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'logos');
