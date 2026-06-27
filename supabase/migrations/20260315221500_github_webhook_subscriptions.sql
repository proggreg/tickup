ALTER TABLE "public"."Users"
ADD COLUMN IF NOT EXISTS github_webhook_subscriptions jsonb;