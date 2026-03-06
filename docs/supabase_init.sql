-- ==========================================
-- SUPABASE INITIALIZATION & SCHEMA MIGRATION
-- ==========================================

-- -----------------------------------------------------------------------------
-- PART 1: Schema Updates (Friends & Profiles)
-- -----------------------------------------------------------------------------

-- Create Profiles Table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    display_name text NOT NULL,
    friend_code text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create Friendships Table
CREATE TABLE public.friendships (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    friend_id uuid REFERENCES auth.users(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, friend_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PART 2: Modify Existing Tables
-- -----------------------------------------------------------------------------

-- Drop the unique constraint on player names if it exists
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_name_key;

-- Add `is_profile` column to `players` table
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_profile BOOLEAN DEFAULT false;

-- Backfill existing profiles into the `players` table
INSERT INTO public.players (user_id, name, is_profile)
SELECT p.id, p.display_name, true
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.players pl WHERE pl.user_id = p.id AND pl.is_profile = true
);

-- -----------------------------------------------------------------------------
-- PART 3: Triggers (Auto-create profile and player)
-- -----------------------------------------------------------------------------

-- Create a function to auto-generate friend codes and insert into profiles
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

-- Create the trigger on auth.users so that signing up automatically creates a profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Migration script to backfill existing users (e.g., your existing account)
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

-- -----------------------------------------------------------------------------
-- PART 4: Row Level Security (RLS) Policies
-- -----------------------------------------------------------------------------

-- --- Profiles Policies ---
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- --- Friendships Policies ---
CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can insert friendships" ON public.friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their friendships" ON public.friendships FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can delete their friendships" ON public.friendships FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- --- Expand Existing Data Policies for Friends ---
-- Players
CREATE POLICY "Friends can view players" ON public.players FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.friendships WHERE status = 'accepted' AND ((user_id = auth.uid() AND friend_id = players.user_id) OR (friend_id = auth.uid() AND user_id = players.user_id)))
);

-- Decks
CREATE POLICY "Friends can view decks" ON public.decks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.friendships WHERE status = 'accepted' AND ((user_id = auth.uid() AND friend_id = decks.user_id) OR (friend_id = auth.uid() AND user_id = decks.user_id)))
);

-- Games
CREATE POLICY "Friends can view games" ON public.games FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.friendships WHERE status = 'accepted' AND ((user_id = auth.uid() AND friend_id = games.user_id) OR (friend_id = auth.uid() AND user_id = games.user_id)))
);

-- Game Participants
CREATE POLICY "Friends can view game participants" ON public.game_participants FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.friendships WHERE status = 'accepted' AND ((user_id = auth.uid() AND friend_id = game_participants.user_id) OR (friend_id = auth.uid() AND user_id = game_participants.user_id)))
);

-- --- Fix RLS for the 'games' table (Updating TBD Games) ---
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Participants can update games" ON public.games;

CREATE POLICY "Users can update games they created or are participating in"
ON public.games
FOR UPDATE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.game_participants gp
    JOIN public.players p ON p.id = gp.player_id
    WHERE gp.game_id = games.id
    AND p.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- PART 5: Data Merging (Optional One-Off)
-- -----------------------------------------------------------------------------
-- MIGRATION SCRIPT: Merge local player "Jesse" to profile-linked player "Jesse"

-- DO $$
-- DECLARE
--     old_jesse_id uuid;
--     new_jesse_id uuid;
-- BEGIN
--     SELECT id INTO new_jesse_id FROM public.players WHERE name = 'Jesse' AND is_profile = true LIMIT 1;
--     SELECT id INTO old_jesse_id FROM public.players WHERE name = 'Jesse' AND (is_profile = false OR is_profile IS NULL) LIMIT 1;

--     IF new_jesse_id IS NOT NULL AND old_jesse_id IS NOT NULL THEN
--         RAISE NOTICE 'Merging Old Jesse (%) into New Profile Jesse (%)', old_jesse_id, new_jesse_id;
        
--         UPDATE public.decks SET player_id = new_jesse_id WHERE player_id = old_jesse_id;
--         UPDATE public.games SET winner_id = new_jesse_id WHERE winner_id = old_jesse_id;
--         UPDATE public.game_participants SET player_id = new_jesse_id WHERE player_id = old_jesse_id;
        
--         DELETE FROM public.players WHERE id = old_jesse_id;
--         RAISE NOTICE 'Migration from old Jesse to profile Jesse complete!';
--     END IF;
-- END;
-- $$;
