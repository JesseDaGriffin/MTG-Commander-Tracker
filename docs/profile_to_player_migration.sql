-- 1. Drop the unique constraint on player names if it exists
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_name_key;

-- 2. Add `is_profile` column to `players` table
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_profile BOOLEAN DEFAULT false;

-- 3. Backfill existing profiles into the `players` table
-- For each profile, we insert a player row if one does not already exist for that user_id where is_profile is true.
INSERT INTO public.players (user_id, name, is_profile)
SELECT p.id, p.display_name, true
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.players pl WHERE pl.user_id = p.id AND pl.is_profile = true
);
