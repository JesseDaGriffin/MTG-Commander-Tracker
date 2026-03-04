# MTG Game Tracker - Database Setup Guide

This guide explains how to set up the Supabase database schema required for the MTG Game Tracker application. It includes all necessary tables, relationships, and authentication requirements.

## Overview

The application requires the following primary tables in your Supabase project:

1. `players` - Stores the names of the people in your playgroup.
2. `decks` - Stores the Commander decks owned by the players.
3. `games` - Stores the match records and the winner.
4. `game_participants` - A join table linking players and their chosen decks to a specific game.

---

## 1. Authentication

Currently, the application manages the playgroup locally and relies on Supabase for data storage. If you plan to deploy this on the public internet, it's highly recommended to enable Supabase Authentication and Row Level Security (RLS) so that only authorized users can read/write data.

For a private playgroup tracker, you can set up email/password authentication or magic links in your **Supabase Dashboard -> Authentication**. Ensure your Nuxt app is configured with the correct `SUPABASE_URL` and `SUPABASE_KEY` in your `.env` file.

---

## 2. Table Schemas (SQL Setup)

You can run the following SQL commands in your Supabase project by navigating to the **SQL Editor** tab and pasting the script below. It will create all necessary tables, columns, and foreign key relationships. Note that these include a `user_id` column to map records to authenticated users.

```sql
-- Create Players Table
CREATE TABLE public.players (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    name text NOT NULL,
    deleted_at timestamp with time zone
);

-- Create Decks Table
CREATE TABLE public.decks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    commander_name text NOT NULL,
    commander_image_url text,
    deleted_at timestamp with time zone
);

-- Create Games Table
CREATE TABLE public.games (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    played_on timestamp with time zone DEFAULT now() NOT NULL,
    winner_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
    is_draw boolean DEFAULT false NOT NULL,
    notes text
);

-- Create Game Participants Join Table
CREATE TABLE public.game_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    player_id uuid NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
    deck_id uuid NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,

    -- Ensure a player can't be added to the same game twice
    UNIQUE (game_id, player_id)
);
```

---

## 3. Explaining Soft Deletes

Both the `players` and `decks` tables feature a `deleted_at` column (`timestamp with time zone`).

The application implements a **soft delete** functionality. When a player or deck is deleted via the UI, the database record is not actually destroyed. Instead, the `deleted_at` column is updated with the current timestamp.

The application queries filter out components where `deleted_at IS NOT NULL`. This prevents the player or deck from showing up in active rosters, while preserving the integrity of historical match data in the `games` and `game_participants` tables.

---

## 4. Setting up Row Level Security (RLS)

By default, new tables in Supabase have RLS disabled, meaning anyone with your anonymous key can read, insert, update, or delete data.

**If your project is public facing, it is highly recommended you secure it:**

1. Navigate to the **Authentication -> Policies** section in Supabase.
2. Enable RLS on all four tables (`players`, `decks`, `games`, `game_participants`).
3. Add a policy for each table to ensure users can only access their own data.

You can run the following SQL to enable RLS and create the appropriate policies:

```sql
-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;

-- Players Policies
CREATE POLICY "Users can only access their own players"
ON players FOR ALL USING (auth.uid() = user_id);

-- Decks Policies
CREATE POLICY "Users can only access their own decks"
ON decks FOR ALL USING (auth.uid() = user_id);

-- Games Policies
CREATE POLICY "Users can only access their own games"
ON games FOR ALL USING (auth.uid() = user_id);

-- Game Participants Policies
CREATE POLICY "Users can only access their own game participants"
ON game_participants FOR ALL USING (auth.uid() = user_id);
```

### 5. What This Changes in the App

- Supabase will automatically set the `user_id` to the logged-in user when records are created (thanks to the `DEFAULT auth.uid()` constraint).
- When fetching data, Supabase will silently filter the records so that a user only receives data matching their specific `user_id`.
