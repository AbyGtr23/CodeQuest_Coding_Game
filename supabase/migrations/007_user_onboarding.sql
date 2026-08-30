-- Migration 007: User Onboarding, IT Role, Tech Stack & Safe Auth Profile Trigger
-- Adds onboarding tracking columns to public.users and enhances handle_new_user trigger

-- 1. Add onboarding and role columns to users table if they do not exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS it_role TEXT,
ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';

-- 2. Enhanced handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
BEGIN
    -- Extract username from metadata (OAuth or signup form) with fallback to email prefix
    base_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'user_name',
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        split_part(COALESCE(NEW.email, 'recruit'), '@', 1)
    );

    -- Sanitize username (remove special characters, replace spaces with underscores)
    base_username := regexp_replace(lower(trim(base_username)), '[^a-z0-9_]', '_', 'g');
    IF base_username = '' OR base_username IS NULL THEN
        base_username := 'recruit';
    END IF;

    final_username := base_username;

    -- Ensure unique username on initial insert
    IF EXISTS (
        SELECT 1 FROM public.users WHERE username = final_username AND id != NEW.id
    ) THEN
        final_username := base_username || '_' || substr(replace(NEW.id::text, '-', ''), 1, 6);
    END IF;

    INSERT INTO public.users (
        id, 
        email, 
        username,
        avatar_url,
        current_rank,
        total_xp,
        current_streak,
        longest_streak,
        onboarding_completed
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        final_username,
        COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            ''
        ),
        'Cadet',
        0,
        0,
        0,
        FALSE
    )
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email, 
        avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.users.avatar_url);
    
    RETURN NEW;
END;
$$;

-- Recreate trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
