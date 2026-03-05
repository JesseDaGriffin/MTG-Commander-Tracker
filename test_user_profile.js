import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://bxymviuvdnnvmotkonvn.supabase.co";
const SUPABASE_KEY =
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4eW12aXV2ZG5udm1vdGtvbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzk0ODMsImV4cCI6MjA4NzcxNTQ4M30.kyZ35zp3ajS9oxzX56CQUMzVuicHyeXWkdxtcXSWc78";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
            email: "arcaneledgersite@gmail.com",
            password: "QtzP233SpkAaeRh",
        });

    if (authError) {
        console.error("Login failed:", authError.message);
        return;
    }

    console.log("Logged in! User ID:", authData.user.id);

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

    if (error) {
        if (error.code === "PGRST116") {
            console.log("NO PROFILE EXISTS FOR THIS USER IN THE DB!");
        } else {
            console.error("Error fetching profile:", error);
        }
    } else {
        console.log("Profile EXISTS:", profile);
    }
}

test();
