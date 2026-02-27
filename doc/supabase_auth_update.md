# Supabase Authentication Update Instructions

To secure Arcane Ledger for individual users, we need to associate the data with authenticated users and lock down the tables using **Row Level Security (RLS)**.

Please run the following SQL commands in your Supabase SQL Editor.

### 1. Update Existing Tables

First, we need to add a `user_id` column to all top-level tables so that data is tied to the specific user who created it.

```sql
-- Add user_id column to tables, defaulting to the authenticated user's ID.
ALTER TABLE players ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE decks ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE games ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE game_participants ADD COLUMN user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- If you have existing data and want to assign it to your first user, 
-- you will need to manually UPDATE those rows with your auth.users ID, 
-- or delete the data to start fresh:
-- TRUNCATE TABLE games, decks, players CASCADE;

-- Enforce the columns as NOT NULL going forward (Only run this AFTER cleaning or migrating previous data)
ALTER TABLE players ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE decks ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE games ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE game_participants ALTER COLUMN user_id SET NOT NULL;
```

### 2. Enable Row Level Security (RLS)

Now that we have a `user_id` column on each table, we must activate RLS.

```sql
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
```

### 3. Create RLS Policies

Create policies that ensure authenticated users can only view, insert, update, or delete their **own** data.

```sql
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

### 4. What This Changes in the App
- Supabase will automatically set the `user_id` to the logged-in user when records are created (thanks to the `DEFAULT auth.uid()` constraint).
- When fetching data, Supabase will silently filter the records so that a user only receives data matching their specific `user_id`.
