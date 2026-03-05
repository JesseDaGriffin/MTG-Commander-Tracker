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

        // --- Profile Methods ---
        async getProfile(userId?: string) {
            const targetId = userId || user.value?.id || user.value?.sub;
            if (!targetId) return null;

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", targetId)
                .single();

            if (error && error.code !== "PGRST116") {
                // 116 means zero rows
                console.error(error);
                return null;
            }
            return data;
        },

        async upsertProfile(displayName: string, friendCode: string) {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            const userId = authUser?.id || user.value?.id || user.value?.sub;

            if (!userId) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("profiles")
                .upsert({
                    id: userId,
                    display_name: displayName,
                    friend_code: friendCode,
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getProfileByFriendCode(friendCode: string) {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("friend_code", friendCode)
                .single();

            if (error) {
                if (error.code === "PGRST116") return null;
                throw error;
            }
            return data;
        },

        async getFriendships() {
            const userId = user.value?.id || user.value?.sub;
            if (!userId) return [];

            const { data, error } = await supabase
                .from("friendships")
                .select("*")
                .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

            if (error) {
                console.error(error);
                return [];
            }
            if (!data || data.length === 0) return [];

            // Fetch attached profiles manually since friendships references auth.users
            const profileIds = new Set<string>();
            data.forEach((f) => {
                profileIds.add(f.user_id);
                profileIds.add(f.friend_id);
            });

            const { data: profilesData, error: pError } = await supabase
                .from("profiles")
                .select("id, display_name, friend_code")
                .in("id", Array.from(profileIds));

            if (pError) console.error(pError);

            const profilesMap: Record<string, any> = {};
            if (profilesData) {
                profilesData.forEach((p) => {
                    profilesMap[p.id] = p;
                });
            }

            return data.map((f) => ({
                ...f,
                user_profile: profilesMap[f.user_id],
                friend_profile: profilesMap[f.friend_id],
            }));
        },

        async getPendingIncomingRequestsCount() {
            const userId = user.value?.id || user.value?.sub;
            if (!userId) return 0;

            const { count, error } = await supabase
                .from("friendships")
                .select("*", { count: "exact", head: true })
                .eq("friend_id", userId)
                .eq("status", "pending");

            if (error) console.error(error);
            return count || 0;
        },

        async sendFriendRequest(friendId: string) {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            const userId = authUser?.id || user.value?.id || user.value?.sub;

            if (!userId) throw new Error("Not authenticated");
            const { data, error } = await supabase
                .from("friendships")
                .insert({
                    user_id: userId,
                    friend_id: friendId,
                    status: "pending",
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async updateFriendshipStatus(
            friendshipId: string,
            status: "accepted" | "rejected",
        ) {
            const { data, error } = await supabase
                .from("friendships")
                .update({
                    status,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", friendshipId)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async deleteFriendship(friendshipId: string) {
            const { error } = await supabase
                .from("friendships")
                .delete()
                .eq("id", friendshipId);

            if (error) throw error;
            return true;
        },
    };
};
