export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            players: {
                Row: {
                    id: string;
                    created_at: string;
                    name: string;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    name: string;
                    user_id?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    name?: string;
                    user_id?: string;
                };
            };
            decks: {
                Row: {
                    id: string;
                    created_at: string;
                    deleted_at: string | null;
                    player_id: string;
                    commander_name: string;
                    commander_image_url: string | null;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    deleted_at?: string | null;
                    player_id: string;
                    commander_name: string;
                    commander_image_url?: string | null;
                    user_id?: string;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    deleted_at?: string | null;
                    player_id?: string;
                    commander_name?: string;
                    commander_image_url?: string | null;
                    user_id?: string;
                };
            };
            games: {
                Row: {
                    id: string;
                    played_on: string;
                    winner_id: string | null;
                    notes: string | null;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    played_on?: string;
                    winner_id?: string | null;
                    notes?: string | null;
                    user_id?: string;
                };
                Update: {
                    id?: string;
                    played_on?: string;
                    winner_id?: string | null;
                    notes?: string | null;
                    user_id?: string;
                };
            };
            game_participants: {
                Row: {
                    id: string;
                    game_id: string;
                    player_id: string;
                    deck_id: string | null;
                    user_id: string;
                };
                Insert: {
                    id?: string;
                    game_id: string;
                    player_id: string;
                    deck_id?: string | null;
                    user_id?: string;
                };
                Update: {
                    id?: string;
                    game_id?: string;
                    player_id?: string;
                    deck_id?: string | null;
                    user_id?: string;
                };
            };
            profiles: {
                Row: {
                    id: string;
                    display_name: string;
                    friend_code: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    display_name: string;
                    friend_code: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    display_name?: string;
                    friend_code?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            friendships: {
                Row: {
                    id: string;
                    user_id: string;
                    friend_id: string;
                    status: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string;
                    friend_id: string;
                    status: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    friend_id?: string;
                    status?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
