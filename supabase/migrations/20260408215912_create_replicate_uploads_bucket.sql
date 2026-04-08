/*
  # Create replicate-uploads storage bucket

  Creates a public storage bucket for temporary image uploads
  used by the Replicate API (which requires public HTTPS URLs, not base64).

  - Bucket: replicate-uploads (public)
  - Policy: service role can insert (edge function uses service role key)
  - Policy: public can read (Replicate needs to fetch the images)
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('replicate-uploads', 'replicate-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Service role can upload replicate images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'replicate-uploads');

CREATE POLICY "Public can read replicate images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'replicate-uploads');
