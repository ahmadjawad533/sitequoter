-- SiteQuote Storage Setup for Job Photos (Private Bucket)

-- 1. Create a private storage bucket for job photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job-photos',
  'job-photos',
  false,
  10485760, -- 10MB limit per photo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies
-- Allow authenticated company users to upload photos to job-photos
CREATE POLICY "Authenticated users can upload job photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'job-photos');

-- Allow authenticated company users to read job photos
CREATE POLICY "Authenticated users can read job photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'job-photos');

-- Allow authenticated users to delete job photos
CREATE POLICY "Authenticated users can delete job photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'job-photos');
