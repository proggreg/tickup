-- Add GitHub-related columns to Users table (for installations created before init_schema included them)
ALTER TABLE "public"."Users"
ADD COLUMN IF NOT EXISTS github_installation_id bigint,
ADD COLUMN IF NOT EXISTS github_username text;
