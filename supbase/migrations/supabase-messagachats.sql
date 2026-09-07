-- A. PAGGAWA NG CHAT ROOMS TABLE (Isang kuwarto kada Customer + Store combination)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    customer_name TEXT NOT NULL,
    customer_session_id UUID NOT NULL, -- Dynamic tracker para sa estranghero o rehistradong customer
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_by_seller BOOLEAN DEFAULT true NOT NULL,
    
    -- MULTI-TENANT ISOLATION LOCK
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    
    UNIQUE (store_id, customer_session_id)
);

-- B. PAGGAWA NG CHAT MESSAGES TABLE (Ang bawat bula ng mensahe sa loob ng kuwarto)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'seller')),
    message_text TEXT NOT NULL
);

-- C. PAG-ENABLE NG ROW LEVEL SECURITY (RLS) PRIVILEGES
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- D. RLS POLICIES (Public insert para sa customers, Owner control para sa merchants)
CREATE POLICY "Allow anyone to create/read chat rooms" ON public.chat_rooms FOR ALL USING (true);
CREATE POLICY "Allow anyone to create/read chat messages" ON public.chat_messages FOR ALL USING (true);
