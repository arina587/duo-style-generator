/*
  # Create generation_jobs table for async OpenAI processing

  ## Purpose
  OpenAI image generation can take 30-90 seconds. Supabase Edge Functions have a
  hard wall-clock timeout. To prevent mobile Safari "Load failed" errors (caused by
  fetch() timing out), OpenAI jobs are now processed asynchronously:
  1. POST /generate → inserts a row, returns jobId immediately
  2. GET /generate?jobId=... → returns current status + output URL
  
  ## Tables
  - `generation_jobs`: tracks async generation job state

  ## Columns
  - id: UUID primary key
  - status: pending | processing | succeeded | failed
  - provider: openai | replicate
  - output: final public image URL (Supabase Storage)
  - error: error message if failed
  - created_at / updated_at: timestamps

  ## Security
  - RLS enabled; no user authentication required for this app (anon can insert+read own jobs)
  - Jobs are identified by UUID — effectively secret by obscurity for this use case
*/

CREATE TABLE IF NOT EXISTS generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed')),
  provider text NOT NULL CHECK (provider IN ('openai', 'replicate')),
  output text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast polling lookups
CREATE INDEX IF NOT EXISTS generation_jobs_status_idx ON generation_jobs (status, created_at);

ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Anon users can insert jobs (start generation)
CREATE POLICY "anon can insert generation jobs"
  ON generation_jobs FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anon users can read jobs by id (polling)
CREATE POLICY "anon can read generation jobs"
  ON generation_jobs FOR SELECT
  TO anon
  USING (true);

-- Service role can update jobs (edge function updates status/output)
CREATE POLICY "service role can update generation jobs"
  ON generation_jobs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_generation_jobs_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS generation_jobs_updated_at ON generation_jobs;
CREATE TRIGGER generation_jobs_updated_at
  BEFORE UPDATE ON generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_jobs_updated_at();
