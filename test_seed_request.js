import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://bxymviuvdnnvmotkonvn.supabase.co";
const SUPABASE_KEY =
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4eW12aXV2ZG5udm1vdGtvbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzk0ODMsImV4cCI6MjA4NzcxNTQ4M30.kyZ35zp3ajS9oxzX56CQUMzVuicHyeXWkdxtcXSWc78";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    const { data: users, error: err } = await supabase.auth.admin.listUsers();

    if (err || !users || !users.users) {
        console.error("error listing users", err);
        return;
    }

    const currentUser = users.users.find(
        (u) => u.email === "arcaneledgersite@gmail.com",
    );
    const otherUser = users.users.find(
        (u) => u.email !== "arcaneledgersite@gmail.com",
    );

    if (!currentUser || !otherUser) {
        console.error("Could not find both users", currentUser, otherUser);
        return;
    }

    // Create a pending request FROM otherUser TO currentUser
    const { data, error } = await supabase
        .from("friendships")
        .upsert({
            user_id: otherUser.id,
            friend_id: currentUser.id,
            status: "pending",
        })
        .select();

    if (error) {
        console.error("Error creating friend request:", error);
    } else {
        console.log("Successfully created pending request:", data);
    }
}

test();
