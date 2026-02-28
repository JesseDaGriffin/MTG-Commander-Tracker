import { useSupabaseClient, useSupabaseUser } from "#imports";

export const useDb = () => {
    const supabase = useSupabaseClient<any>();
    const user = useSupabaseUser();

    return {
        async getPlayers() {
            if (!user.value) return [];
            const { data, error } = await supabase
                .from("players")
                .select("*")
                .order("name");

            if (error) console.error(error);
            return data || [];
        },

        async addPlayer(name: string) {
            if (!user.value) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("players")
                .insert([{ name }])
                .select();

            if (error) throw error;
            return data[0];
        },

        async getDecks() {
            if (!user.value) return [];
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
            if (!user.value) throw new Error("Not authenticated");
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
            if (!user.value) throw new Error("Not authenticated");
            const { error } = await supabase
                .from("decks")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", deckId);

            if (error) throw error;
            return true;
        },

        async getGames() {
            if (!user.value) return [];
            const { data, error } = await supabase
                .from("games")
                .select(
                    `
          *,
          players!games_winner_id_fkey ( name )
        `,
                )
                .order("played_on", { ascending: false });

            if (error) console.error(error);
            return data || [];
        },
    };
};
