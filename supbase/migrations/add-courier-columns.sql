-- Magdaragdag ng tatlong bagong logistics columns sa iyong umiiral na stores table
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS courier_jand BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS courier_flash BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS courier_lalamove BOOLEAN DEFAULT true NOT NULL;
