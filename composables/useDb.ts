import { useSupabaseClient, useSupabaseUser } from "#imports";

export const useDb = () => {
    const supabase = useSupabaseClient<any>();
    const user = useSupabaseUser();

    return {
        async getPlayers() {
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .is("deleted_at", null)
                .order("name");

            if (error) console.error(error);
            return data || [];
        },

        async addPlayer(name: string) {
            const { data, error } = await supabase
                .from("players")
                .insert([{ name }])
                .select();

            if (error) throw error;
            return data[0];
        },

        async getPlayerById(id: string) {
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },

        async deletePlayer(playerId: string) {
            const { error } = await supabase
                .from("players")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", playerId);

            if (error) throw error;
            return true;
        },

        async getDeckById(id: string) {
            const { data, error } = await supabase
                .from("decks")
                .select(
                    `
          *,
          players ( name )
        `,
                )
                .eq("id", id)
                .single();

            if (error) throw error;
            return data;
        },

        async getDecks() {
            const { data, error } = await supabase
                .from("decks")
                .select(
                    `
          *,
          players ( name )
        `,
                )
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (error) console.error(error);
            return data || [];
        },

        async addDeck(
            playerId: string,
            commanderName: string,
            commanderImageUrl: string,
        ) {
            const { data, error } = await supabase
                .from("decks")
                .insert([
                    {
                        player_id: playerId,
                        commander_name: commanderName,
                        commander_image_url: commanderImageUrl,
                    },
                ])
                .select();

            if (error) throw error;
            return data[0];
        },

        async deleteDeck(deckId: string) {
            const { error } = await supabase
                .from("decks")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", deckId);

            if (error) throw error;
            return true;
        },

        async getGames() {
            const { data, error } = await supabase
                .from("games")
                .select(
                    `
          *,
          players!games_winner_id_fkey ( name ),
          game_participants (
            id,
            player_id,
            deck_id,
            players ( name ),
            decks ( id, commander_name, commander_image_url )
          )
        `,
                )
                .order("played_on", { ascending: false });

            if (error) console.error(error);
            return data || [];
        },

        async getGamesCount() {
            const { count, error } = await supabase
                .from("games")
                .select("*", { count: "exact", head: true });

            if (error) console.error(error);
            return count || 0;
        },

        async getGamesPaginated(page: number, pageSize: number = 10) {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("games")
                .select(
                    `
          *,
          players!games_winner_id_fkey ( name ),
          game_participants (
            id,
            player_id,
            deck_id,
            players ( name ),
            decks ( id, commander_name, commander_image_url )
          )
        `,
                )
                .order("played_on", { ascending: false })
                .range(from, to);

            if (error) console.error(error);
            return data || [];
        },

        async updateGameWinner(
            gameId: string,
            winnerId: string,
            notes: string = "",
        ) {
            const { error } = await supabase
                .from("games")
                .update({ winner_id: winnerId, is_draw: false, notes })
                .eq("id", gameId);

            if (error) throw error;
            return true;
        },
    };
};
