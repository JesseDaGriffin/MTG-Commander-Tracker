import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import * as nodemailer from "npm:nodemailer";
import { createClient } from "npm:@supabase/supabase-js";

const GMAIL_USER = Deno.env.get("GMAIL_USER") || "";
const GMAIL_PASSWORD = Deno.env.get("GMAIL_PASSWORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASSWORD,
    },
});

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const payload = await req.json();

        // Database Webhooks send the inserted record in the `record` field for INSERT events
        if (payload.type !== "INSERT" || !payload.record) {
             return new Response("Not an insert event", { status: 400 });
        }

        const newFriendship = payload.record;
        const friendId = newFriendship.friend_id;
        const userId = newFriendship.user_id;

        if (!friendId || !userId) {
             return new Response("Missing friend_id or user_id", { status: 400 });
        }

        // Fetch the friend's email address
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(friendId);
        
        if (userError || !userData?.user?.email) {
            console.error("Error fetching user email:", userError);
            return new Response("Failed to fetch user email", { status: 500 });
        }

        const friendEmail = userData.user.email;
        
        // Fetch the sender's display name to personalize the email
        const { data: senderProfile, error: profileError } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', userId)
            .single();

        const senderName = (!profileError && senderProfile?.display_name) 
                            ? senderProfile.display_name 
                            : "Someone";

        // HTML Email content
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; background-color: #0b1120; color: #e2e8f0; padding: 40px; text-align: center;">
                <div style="background-color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
                    <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); padding: 30px;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Arcane Ledger</h1>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="color: white; margin-top: 0;">New Friend Request</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.5;">
                            Great news! <strong style="color: #38bdf8;">${senderName}</strong> has sent you a friend request.
                        </p>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                            Log in to your dashboard to review and accept the request.
                        </p>
                        <a href="https://arcaneledger.netlify.app/friends" style="background-color: #0ea5e9; color: white; text-decoration: none; padding: 14px 30px; border-radius: 6px; font-weight: bold; display: inline-block;">View Friend Requests</a>
                    </div>
                </div>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Arcane Ledger" <${GMAIL_USER}>`,
            to: friendEmail,
            subject: "You have a new friend request on Arcane Ledger!",
            html: htmlBody,
        });

        return new Response(
            JSON.stringify({ message: "Email sent successfully", info }),
            { headers: { "Content-Type": "application/json" } },
        );
    } catch (err: any) {
        console.error("Function error:", err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
