/*
  # Create generated-images storage bucket

  1. Storage
    - Creates public bucket `generated-images` for storing AI-generated images
      uploaded by the backend edge function (OpenAI b64_json responses)
  2. Policies
    - service_role can INSERT (upload) — used by the edge function
    - Public SELECT (read) — images are publicly accessible via signed/public URL
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'generated-images',
  'generated-images',
  true,
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow service_role (edge functions) to upload
CREATE POLICY "service_role can upload generated images"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'generated-images');

-- Allow public read access
CREATE POLICY "public can read generated images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'generated-images');
