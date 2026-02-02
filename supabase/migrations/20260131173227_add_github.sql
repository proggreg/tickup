-- supabase/migrations/XXXXXX_add_github_token.sql

-- Add github_access_token to your Users table or create integrations table
-- Option 1: Add to existing user metadata (simpler)
-- This might already exist in your setup, check your schema first

-- Option 2: Create a dedicated integrations table (recommended)
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own integrations"
  ON public.user_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations"
  ON public.user_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON public.user_integrations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON public.user_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_integrations_user_provider 
  ON public.user_integrations(user_id, provider);

ALTER TABLE "public"."Todos" ADD COLUMN github_branch_name text;
ALTER TABLE "public"."Todos" ADD COLUMN github_repo text;
ALTER TABLE "public"."Todos" ADD COLUMN github_link text;

