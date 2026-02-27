# Supabase Setup and Schema Instructions

To host the backend and database for Arcane Ledger, log into [Supabase](https://supabase.com) and create a new project. 
Once your project is created, navigate to the **SQL Editor** in the Supabase Dashboard and run the following queries to create the necessary tables.

### 1. Create Tables

```sql
-- Create PLAYERS table
CREATE TABLE players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create DECKS table (Each deck belongs to a player and defines their Commander)
CREATE TABLE decks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    commander_name TEXT NOT NULL,
    commander_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create GAMES table
CREATE TABLE games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    played_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    winner_id UUID REFERENCES players(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create GAME PARTICIPANTS table (Maps players and their decks to specific games)
CREATE TABLE game_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,
    UNIQUE(game_id, player_id) -- A player can only participate once per game
);
```

### 2. Configure Row Level Security (RLS) Policies
For a simple personal game tracker without user authentication initially built-in, you may want to disable RLS or allow anonymous read/write.
**WARNING: For a public-facing app, you MUST implement proper auth.**

To quickly test the app allowing anyone with the anon key to read/write:
```sql
ALTER TABLE players DISABLE ROW LEVEL SECURITY;
ALTER TABLE decks DISABLE ROW LEVEL SECURITY;
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants DISABLE ROW LEVEL SECURITY;
```

### 3. Adding Soft Delete Support
To allow users to hide "deleted" decks from their roster without actually breaking their previous game history records (since `game_participants` relies on the deck ID), you must run the following migration:

```sql
-- Add deleted_at column to Decks table
ALTER TABLE decks ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
```

### 4. Connect Nuxt to Supabase
In your Nuxt `.env` file, you will need to add:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_public_key
```
You can find these in Project Settings -> API in your Supabase dashboard.
