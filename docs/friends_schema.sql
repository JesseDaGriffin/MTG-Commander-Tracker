-- 1. Create Profiles Table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    display_name text NOT NULL,
    friend_code text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Create Friendships Table
CREATE TABLE public.friendships (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    friend_id uuid REFERENCES auth.users(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
-- Profiles need to be searchable by friend code, so we allow authenticated users to view all profiles.
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. Friendships Policies
-- Users can see their own friendships (either they sent it, or received it)
CREATE POLICY "Users can view their own friendships" ON public.friendships FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create a friendship request
CREATE POLICY "Users can insert friendships" ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update a friendship (to accept/reject) if they are the recipient or the sender (to cancel?)
CREATE POLICY "Users can update their friendships" ON public.friendships FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete a friendship (unfriend) or cancel a request
CREATE POLICY "Users can delete their friendships" ON public.friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 5. Expand Existing Data Policies
-- We add new SELECT policies so users can read data belonging to their 'accepted' friends.
-- These stack with existing policies via logical OR.

-- Players
CREATE POLICY "Friends can view players"
ON public.players FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE status = 'accepted' 
        AND (
            (user_id = auth.uid() AND friend_id = players.user_id) OR
            (friend_id = auth.uid() AND user_id = players.user_id)
        )
    )
);

-- Decks
CREATE POLICY "Friends can view decks"
ON public.decks FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE status = 'accepted' 
        AND (
            (user_id = auth.uid() AND friend_id = decks.user_id) OR
            (friend_id = auth.uid() AND user_id = decks.user_id)
        )
    )
);

-- Games
CREATE POLICY "Friends can view games"
ON public.games FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE status = 'accepted' 
        AND (
            (user_id = auth.uid() AND friend_id = games.user_id) OR
            (friend_id = auth.uid() AND user_id = games.user_id)
        )
    )
);

-- Game Participants
CREATE POLICY "Friends can view game participants"
ON public.game_participants FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.friendships 
        WHERE status = 'accepted' 
        AND (
            (user_id = auth.uid() AND friend_id = game_participants.user_id) OR
            (friend_id = auth.uid() AND user_id = game_participants.user_id)
        )
    )
);
