-- Fix Row Level Security (RLS) for the 'games' table
-- This policy allows users to update a game's winner if they:
-- 1. Created the game originally (auth.uid() = user_id)
-- 2. Are a participant in the game (linked via game_participants and players tables)

-- Ensure RLS is enabled
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Remove existing update policies (names might vary, but standard pattern is covered)
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Participants can update games" ON public.games;

-- Create the new, more permissive UPDATE policy
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
