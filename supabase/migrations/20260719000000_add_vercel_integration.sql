ALTER TABLE "public"."Todos" ADD COLUMN vercel_project_id text;
ALTER TABLE "public"."Todos" ADD COLUMN vercel_deployment_url text;
ALTER TABLE "public"."Todos" ADD COLUMN vercel_deployment_status text;

ALTER TABLE "public"."Users" ADD COLUMN vercel_access_token text;
ALTER TABLE "public"."Users" ADD COLUMN vercel_team_id text;
ALTER TABLE "public"."Users" ADD COLUMN vercel_webhook_subscriptions jsonb;
