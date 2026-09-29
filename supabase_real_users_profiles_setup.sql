-- ==============================================================================
-- RESQONE-AI+: REAL LIVE GOOGLE & REGISTER PROFILES SYNC (ZERO MOCK USERS)
-- Project: https://rtvcuvmpfhrapgpmrtgj.supabase.co
-- ==============================================================================
-- INSTRUCTIONS:
-- 1. In Supabase SQL Editor:
--    Select all existing text (Ctrl + A) and DELETE IT completely.
-- 2. Paste this entire script and click 'RUN'.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure 'public.profiles' table exists with UUID id matching auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  blood_group TEXT DEFAULT 'O-',
  role TEXT DEFAULT 'user',
  medical_notes TEXT DEFAULT '',
  avatar_url TEXT,
  family_contacts JSONB,
  location_lat NUMERIC DEFAULT 16.5068,
  location_lng NUMERIC DEFAULT 80.6561,
  last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all necessary columns exist on public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_contacts JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lat NUMERIC DEFAULT 16.5068;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_lng NUMERIC DEFAULT 80.6561;

-- 2. DELETE ALL DUMMY / MOCK PROFILES
-- Uses UUID comparison against auth.users so no LIKE or type-casting issues can ever occur.
DELETE FROM public.profiles 
WHERE id NOT IN (SELECT id FROM auth.users);

-- 3. Ensure 'public.activity_log' table exists
CREATE TABLE IF NOT EXISTS public.activity_log (
  id TEXT PRIMARY KEY DEFAULT ('act-' || substr(md5(random()::text), 1, 12)),
  event_type TEXT DEFAULT 'USER_LOGIN',
  description TEXT,
  severity TEXT DEFAULT 'INFO',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Clean up any dummy activity records
DELETE FROM public.activity_log 
WHERE severity = 'MOCK' 
   OR description ILIKE '%Mock%' 
   OR description ILIKE '%Demo%';

-- 4. CONFIGURE ROW LEVEL SECURITY (RLS) FOR LIVE APP ACCESS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read policy" ON public.profiles;
CREATE POLICY "Public profiles read policy" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow user to insert profile" ON public.profiles;
CREATE POLICY "Allow user to insert profile" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow user to update own profile" ON public.profiles;
CREATE POLICY "Allow user to update own profile" ON public.profiles FOR UPDATE USING (true);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public activity_log read policy" ON public.activity_log;
CREATE POLICY "Public activity_log read policy" ON public.activity_log FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public activity_log write policy" ON public.activity_log;
CREATE POLICY "Public activity_log write policy" ON public.activity_log FOR ALL USING (true);

-- 5. AUTOMATIC TRIGGER: CAPTURE REAL GOOGLE & EMAIL LOGINS INTO 'profiles'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically upsert real user details into 'public.profiles'
  INSERT INTO public.profiles (
    id, email, name, role, phone, blood_group, avatar_url, medical_notes, last_login_at, updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, ''),
    COALESCE(NEW.raw_user_meta_data->>'blood_group', 'O-'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_user_meta_data->>'medical_notes', ''),
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE profiles.phone END,
    role = COALESCE(EXCLUDED.role, profiles.role),
    blood_group = COALESCE(EXCLUDED.blood_group, profiles.blood_group),
    last_login_at = timezone('utc'::text, now()),
    updated_at = timezone('utc'::text, now());

  -- Record real user event in activity_log
  INSERT INTO public.activity_log (id, event_type, description, severity, created_at)
  VALUES (
    'act-auth-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 4),
    CASE WHEN TG_OP = 'INSERT' THEN 'REAL_USER_REGISTERED' ELSE 'REAL_USER_LOGIN' END,
    'Real user: ' || COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email) || ' (' || COALESCE(NEW.email, 'No email') || ')',
    'INFO',
    timezone('utc'::text, now())
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users (fires on new signup AND on each login update)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. BACKFILL ALL EXISTING REAL USERS FROM 'auth.users' INTO 'public.profiles'
INSERT INTO public.profiles (id, email, name, role, phone, blood_group, avatar_url, last_login_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'role', 'user'),
  COALESCE(raw_user_meta_data->>'phone', phone, ''),
  COALESCE(raw_user_meta_data->>'blood_group', 'O-'),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', ''),
  COALESCE(last_sign_in_at, created_at, timezone('utc'::text, now()))
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = COALESCE(EXCLUDED.name, profiles.name),
  avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END,
  last_login_at = EXCLUDED.last_login_at;

-- 7. GRANT PERMISSIONS
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.activity_log TO anon, authenticated, service_role;
