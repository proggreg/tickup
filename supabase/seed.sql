-- Create test user
-- Note: This uses Supabase's internal auth functions

-- Insert into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'testuser@example.com',
  crypt('password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Insert into auth.identities (with provider_id)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,  -- Added this
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  (SELECT id FROM auth.users WHERE email = 'testuser@example.com'),
  (SELECT id::text FROM auth.users WHERE email = 'testuser@example.com'),  -- Added this
  jsonb_build_object('sub', (SELECT id::text FROM auth.users WHERE email = 'testuser@example.com'), 'email', 'testuser@example.com'),
  'email',
  NOW(),
  NOW(),
  NOW()
);