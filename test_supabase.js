import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://bxymviuvdnnvmotkonvn.supabase.co";
const SUPABASE_KEY =
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4eW12aXV2ZG5udm1vdGtvbnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzk0ODMsImV4cCI6MjA4NzcxNTQ4M30.kyZ35zp3ajS9oxzX56CQUMzVuicHyeXWkdxtcXSWc78";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
    const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");
    console.log("Profiles in DB:", profiles);
    if (error) {
        console.error("Error fetching profiles:", error);
    }
}

test();
