import { serverSupabaseServiceRole } from "#supabase/server";

export default defineEventHandler(async (event) => {
    try {
        const client = serverSupabaseServiceRole(event);
        const { data: profiles, error } = await client
            .from("profiles")
            .select("*");

        // get user email
        const { data: users } = await client.auth.admin.listUsers();

        return {
            success: true,
            profiles,
            error,
            users: users?.users?.map((u) => ({ id: u.id, email: u.email })),
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
});
