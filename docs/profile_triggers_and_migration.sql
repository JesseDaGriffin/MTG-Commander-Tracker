-- 1. Create a function to auto-generate friend codes and insert into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    gen_friend_code text;
    base_name text;
    is_unique boolean := false;
BEGIN
    -- Extract display name from metadata, fallback to 'Player'
    base_name := COALESCE(new.raw_user_meta_data->>'display_name', 'Player');
    
    -- Generate unique friend code
    WHILE NOT is_unique LOOP
        gen_friend_code := base_name || '#' || lpad(floor(random() * 10000)::text, 4, '0');
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE friend_code = gen_friend_code) THEN
            is_unique := true;
        END IF;
    END LOOP;

    -- Insert new profile
    INSERT INTO public.profiles (id, display_name, friend_code)
    VALUES (new.id, base_name, gen_friend_code);

    -- Also create an associated record in the players table
    INSERT INTO public.players (user_id, name, is_profile)
    VALUES (new.id, base_name, true);

    RETURN new;
END;
$$;

-- 2. Create the trigger on auth.users so that signing up automatically creates a profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Migration script to backfill existing users (e.g., your existing account)
-- This creates profiles for ANY user in auth.users that doesn't already have one in public.profiles.
DO $$
DECLARE
    usr RECORD;
    gen_friend_code text;
    base_name text;
    is_unique boolean;
BEGIN
    FOR usr IN SELECT id, email, raw_user_meta_data FROM auth.users WHERE id NOT IN (SELECT id FROM public.profiles) LOOP
        -- Fallback to splitting the email if they don't have display_name metadata
        base_name := COALESCE(usr.raw_user_meta_data->>'display_name', SPLIT_PART(usr.email, '@', 1));
        
        is_unique := false;
        WHILE NOT is_unique LOOP
            gen_friend_code := base_name || '#' || lpad(floor(random() * 10000)::text, 4, '0');
            IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE friend_code = gen_friend_code) THEN
                is_unique := true;
            END IF;
        END LOOP;
        
        INSERT INTO public.profiles (id, display_name, friend_code)
        VALUES (usr.id, base_name, gen_friend_code);

        -- Create associated player record
        INSERT INTO public.players (user_id, name, is_profile)
        VALUES (usr.id, base_name, true);
    END LOOP;
END;
$$;
