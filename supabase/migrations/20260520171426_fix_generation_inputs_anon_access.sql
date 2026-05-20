/*
  # Fix generation-inputs bucket: allow anon uploads

  ## Problem
  The existing policies only allow `authenticated` role to INSERT/SELECT.
  This app has no auth system — all users are `anon`.
  The result: every upload returns HTTP 400 and generation never starts.

  ## Changes
  1. Drop the authenticated-only policies
  2. Add anon INSERT, SELECT, DELETE policies
  3. Keep service_role policies as-is (they may already exist; added idempotently)

  ## Security
  - anon users can upload, read, and delete any file in the bucket
  - This is acceptable: files are short-lived input images, bucket is private,
    and each path is scoped to a random requestId prefix so collisions are negligible
  - Service role retains full access for the edge function
*/

-- Drop the authenticated-only policies that block anon uploads
DROP POLICY IF EXISTS "authenticated users can upload input images" ON storage.objects;
DROP POLICY IF EXISTS "authenticated users can read own input images" ON storage.objects;

-- Allow anon users to upload input images
CREATE POLICY "anon users can upload input images"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'generation-inputs');

-- Allow anon users to read input images (needed for signed URL generation)
CREATE POLICY "anon users can read input images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'generation-inputs');

-- Allow anon users to delete input images (cleanup)
CREATE POLICY "anon users can delete input images"
  ON storage.objects FOR DELETE
  TO anon
  USING (bucket_id = 'generation-inputs');

-- Ensure service_role policies exist (idempotent)
DROP POLICY IF EXISTS "service role can read input images" ON storage.objects;
DROP POLICY IF EXISTS "service role can delete input images" ON storage.objects;

CREATE POLICY "service role can read input images"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'generation-inputs');

CREATE POLICY "service role can delete input images"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'generation-inputs');
