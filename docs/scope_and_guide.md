# Arcane Ledger - Scope & Functional Guide

## Project Goal

Arcane Ledger is a premium, mobile-first web application designed specifically for Magic: The Gathering (MTG) Commander playgroups. Its primary goal is to provide a seamless, aesthetically pleasing interface for tracking players, managing their Commander decks, and permanently recording game outcomes to track performance history over time.

Built on Nuxt 4, Vue 3, and styled with a custom "Abyssal/Arcane" Tailwind CSS theme, the application prioritizes a lightning-fast, highly visual user experience backed by a robust Supabase Postgres database.

## Core Features & Walkthrough

### 1. Dashboard (`/`)

Provides a high-level overview of the playgroup's statistics.

- **Top Players Leaderboard:** Ranks players based on total wins, displaying their win rate and total games played. Clicking a player navigates to their detailed profile.
- **Recent Matches:** An infinite-scrolling feed of the latest recorded games, showing the date, winner, participants, and game notes.

### 2. Player Management (`/players`)

Manage the roster of people in your playgroup.

- **Add Player:** Quickly add a new participant to the tracker.
- **Player Roster:** View all active players.
- **Player Profiles (`/players/[id]`):** Detailed individual statistics including overall win rate, total games/wins/losses, a win/loss doughnut chart, and a bar chart of their most utilized Commander decks. Includes their specific match history.
- **Soft Delete:** Players can be soft-deleted via a confirmation modal (preserving historic game integrity but hiding them from active rosters).

### 3. Deck Management (`/decks`)

Track the specific Commander decks piloted by your players.

- **Add Deck:** Select an owner from the active players roster, search for a Commander using the integrated MTG Scryfall API, and save the deck. The API streams visual results for precise selection.
- **Deck Roster:** Browse all active decks grouped by their owner.
- **Deck Profiles (`/decks/[id]`):** Detailed deck statistics including overall win rate, a win/loss doughnut chart, and a bar chart of the deck's most frequently faced opponent Commanders. Includes specific match history for games where this deck was piloted.
- **Card Preview Modal:** Clicking a deck's Commander image opens a high-resolution, animated viewing modal.
- **Soft Delete:** Decks can be soft-deleted directly from their profile page via a confirmation modal.

### 4. Game Tracking (`/games`)

The core logging mechanism for recording the outcomes of Commander pods.

- **Record Game Form:** A dynamic form supporting 2 to 6 participants.
- **Smart Selection:** Participants are assigned a Player and an associated Deck (dropdown automatically filters to only show decks owned by that player).
- **Match Details:** Declare a specific winner or mark the game as a draw. Add contextual notes (e.g., "Krenko went infinite on turn 4!").
- **Quality of Life:** Features a "Load Last Group" button to quickly repopulate the form with the participants of the most recently recorded match, and a "Reset Form" button.
- **Game History:** A full log of all recorded matches, highlighting the victor with a crown icon and displaying the participating decks.

## Data Integrity & Security

- **Soft Deletes:** Deleting records (players/decks) updates a `deleted_at` timestamp. This hides them from active selection menus while preventing the corruption of historical match data in the `games` and `game_participants` tables.
- **Supabase Integration:** Powered by PostgreSQL, configured to interface with Supabase Auth and Row Level Security (RLS) to ensure users can safely isolate their private playgroup data.
