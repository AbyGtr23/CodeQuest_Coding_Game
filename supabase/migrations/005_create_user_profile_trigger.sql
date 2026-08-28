CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
BEGIN
    base_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'user_name',
        NEW.raw_user_meta_data->>'preferred_username',
        split_part(COALESCE(NEW.email, 'user'), '@', 1)
    );

    final_username := base_username;

    IF EXISTS (
        SELECT 1
        FROM public.users
        WHERE username = final_username
    ) THEN
        final_username := base_username || '_' ||
                          substr(replace(NEW.id::text, '-', ''), 1, 6);
    END IF;

    INSERT INTO public.users (
        id,
        email,
        username,
        avatar_url
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, ''),
        final_username,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();