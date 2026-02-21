-- 1. Fix Storage Bucket Policies (Allows anonymous QR uploads with upsert)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public Updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow Public ALL" ON storage.objects;

CREATE POLICY "Allow Public ALL" 
ON storage.objects FOR ALL 
USING (bucket_id = 'public-assets') 
WITH CHECK (bucket_id = 'public-assets');

-- 2. Fix Settings Table Policies (Allows password changes)
DROP POLICY IF EXISTS "Allow public access to settings" ON public.settings;

CREATE POLICY "Allow public access to settings" 
ON public.settings FOR ALL 
USING (true) WITH CHECK (true);
