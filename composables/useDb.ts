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

            const userId = user.value?.id || user.value?.sub;
            const mapped = (data || []).map((p) => ({
                ...p,
                _is_you: p.is_profile && p.user_id === userId,
                _is_friend: p.is_profile && p.user_id !== userId,
            }));

            const filtered = mapped.filter(
                (p) => p.is_profile || p.user_id === userId,
            );

            return filtered.sort((a, b) => {
                if (a._is_you && !b._is_you) return -1;
                if (!a._is_you && b._is_you) return 1;
                if (a._is_friend && !b._is_friend) return -1;
                if (!a._is_friend && b._is_friend) return 1;
                return a.name.localeCompare(b.name);
            });
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
            // First check if this is a profile-linked player
            const { data: player } = await supabase
                .from("players")
                .select("is_profile")
                .eq("id", playerId)
                .single();

            if (player?.is_profile) {
                throw new Error("Cannot delete a profile-linked player.");
            }

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
          players ( name, user_id, is_profile )
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
          players ( name, user_id, is_profile )
        `,
                )
                .is("deleted_at", null)
                .order("created_at", { ascending: false });

            if (error) console.error(error);

            const userId = user.value?.id || user.value?.sub;

            // Filter out decks belonging to non-profile players created by other users
            return (data || []).filter(
                (d) => d.players?.is_profile || d.players?.user_id === userId,
            );
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

        async getGames(options?: { involvedOnly?: boolean }) {
            const { data, error } = await supabase
                .from("games")
                .select(
                    `
          *,
          players!games_winner_id_fkey ( name, user_id, is_profile ),
          game_participants (
            id,
            player_id,
            deck_id,
            players ( name, user_id, is_profile ),
            decks ( id, commander_name, commander_image_url )
          )
        `,
                )
                .order("played_on", { ascending: false });

            if (error) {
                console.error(error);
                return [];
            }

            let games = data || [];

            // Filter out games that the logged-in user isn't involved in
            if (options?.involvedOnly) {
                const userId = user.value?.id || user.value?.sub;
                if (userId) {
                    games = games.filter((g: any) =>
                        g.game_participants?.some(
                            (p: any) =>
                                p.players?.user_id === userId &&
                                p.players?.is_profile,
                        ),
                    );
                }
            }

            return games;
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
