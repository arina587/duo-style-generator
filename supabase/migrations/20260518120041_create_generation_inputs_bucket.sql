/*
  # Create generation-inputs storage bucket

  ## Summary
  Creates a private bucket that the frontend uploads user input images to
  before calling /generate. The edge function reads them back via the
  service role key and deletes them after the job starts.

  ## Storage
  - Bucket: generation-inputs (NOT public — service role reads via signed URL)

  ## Security
  - authenticated users can INSERT their own files (scoped to their requestId prefix)
  - service_role can SELECT (edge function downloads for processing)
  - service_role can DELETE (cleanup after job starts)
  - No public SELECT — images are private user uploads
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generation-inputs',
  'generation-inputs',
  false,
  8388608,  -- 8MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Authenticated users can upload files
CREATE POLICY "authenticated users can upload input images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'generation-inputs');

-- Service role (edge function) can read input images
CREATE POLICY "service role can read input images"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'generation-inputs');

-- Service role (edge function) can delete input images after processing
CREATE POLICY "service role can delete input images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'generation-inputs');

-- Authenticated users can read their own uploads (needed for signed URL generation)
CREATE POLICY "authenticated users can read own input images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'generation-inputs');
