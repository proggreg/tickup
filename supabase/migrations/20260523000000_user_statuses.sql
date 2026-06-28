ALTER TABLE "public"."Users"
    ADD COLUMN IF NOT EXISTS statuses jsonb DEFAULT '[]'::jsonb;
