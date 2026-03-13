# Setting up Email with Gmail (SMTP)

This guide outlines the steps to set up your personal Gmail account for sending emails from your Supabase project. We'll cover two main use cases:

1. Sending verification emails for new accounts via Auth.
2. Sending notification emails when a new friend request is created via Database Webhooks and Edge Functions.

Using a Gmail account is a great free alternative to services like Resend, especially when you do not own a custom domain name.

## 1. Gmail Account Setup

To use Google's SMTP servers, you must generate an "App Password". You cannot use your normal Google account password.

1. **Enable 2-Step Verification:** Go to your [Google Account Security settings](https://myaccount.google.com/security) and ensure 2-Step Verification is turned on.
2. **Generate an App Password:**
    - Go to the [App Passwords page](https://myaccount.google.com/apppasswords).
    - Give it a name (e.g., "Supabase App").
    - Click **Create**.
    - **Save this 16-character password securely**, you will need it later. (It usually displays with spaces, but you use it without spaces).

---

## 2. Using Gmail for Account Verification (Supabase Auth)

Supabase Auth uses its own built-in email service by default with strict rate limits (typically 3 per hour). To overcome this and use your Gmail account for password resets and signup confirmations, you need to configure Supabase's Custom SMTP settings.

### Supabase Dashboard Configuration

1. Go to your **Supabase Dashboard**.
2. Navigate to **Project Settings** -> **Authentication**.
3. Scroll down to the **SMTP Settings** section.
4. Enable **Use custom SMTP server**.
5. Fill in the Gmail SMTP details:
    - **Host:** `smtp.gmail.com`
    - **Port:** `465`
    - **User:** Your full Gmail address (e.g., `youremail@gmail.com`)
    - **Password:** The 16-character App Password you generated (no spaces)
    - **Sender email:** Your full Gmail address
    - **Sender name:** `MTG Game Tracker` (or your app name)
6. Click **Save**.

### Email Templates

You can customize the HTML for the confirmation email in Supabase:

1. Go to **Authentication** -> **Email Templates**.
2. Select **Confirm Signup**.
3. Edit the Subject and Message Body. You can use variables like `{{ .ConfirmationURL }}` to inject the auth links into your HTML.

---

## 3. Sending "New Friend Request" Emails (Edge Functions & Webhooks)

To send an email when a specific database event occurs (like creating a new row in a `friendships` table), you need to combine **Supabase Database Webhooks** with a **Supabase Edge Function**. Because we are using Gmail, our Edge Function needs an SMTP client.

### Step 3a: Create the Edge Function

1. Initialize Supabase locally if you haven't already:
    ```bash
    supabase init
    ```
2. Create a new Edge Function:
    ```bash
    supabase functions new send-friend-request-email
    ```
3. Update the generated file (`supabase/functions/send-friend-request-email/index.ts`) to use Deno's native SMTP library to send the email:

    ```typescript
    import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
    import * as nodemailer from "npm:nodemailer";

    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_PASSWORD = Deno.env.get("GMAIL_PASSWORD");

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASSWORD,
        },
    });

    serve(async (req) => {
        // Validate request method
        if (req.method !== "POST")
            return new Response("Method Not Allowed", { status: 405 });

        try {
            // Parse the payload from the Database Webhook
            const payload = await req.json();

            // Example payload structure from an Insert webhook
            // { type: 'INSERT', table: 'friendships', record: { user_id: '...', friend_id: '...' } }
            const newFriendship = payload.record;

            // TODO: You may need to fetch the friend's email address from a profiles table
            // using the Supabase client here if you only have their user_id.

            // Send the email
            const info = await transporter.sendMail({
                from: `"MTG Game Tracker" <${GMAIL_USER}>`, // sender address
                to: "friend@example.com", // list of receivers (Replace with the fetched email)
                subject: "You have a new friend request!", // Subject line
                html: "<p>Someone added you as a friend. Log in to accept!</p>", // html body
            });

            return new Response(
                JSON.stringify({ message: "Email sent successfully", info }),
                { headers: { "Content-Type": "application/json" } },
            );
        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    });
    ```

### Step 3b: Deploy and Configure Secrets

1. Add your Gmail credentials to your Supabase project's secrets. Use your real password for `GMAIL_PASSWORD`:
    ```bash
    supabase secrets set GMAIL_USER="your-email@gmail.com" GMAIL_PASSWORD="your-16-character-app-password"
    ```
2. Deploy your generic function:
    ```bash
    supabase functions deploy send-friend-request-email
    ```

### Step 3c: Setup the Database Webhook

1. Go to the **Supabase Dashboard** -> **Database** -> **Webhooks**.
2. Click **Create Webhook**.
3. **Name:** `Friend Request Email Notifier`
4. **Table:** `friendships` (or whatever your table is named)
5. **Events:** Check `Insert`
6. **Type:** `HTTP Request`
    - **Method:** `POST`
    - **URL:** The deployed Edge Function URL (e.g., `https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/send-friend-request-email`)
7. **HTTP Headers:**
    - Click `Add Http Header`
    - Set Header to `Authorization`, and value to `Bearer <YOUR_ANON_KEY>` (to bypass function auth if required, though for webhooks it's best to verify internal requests).
8. Click **Save Webhook**.

Now, whenever a row is inserted into the `friendships` table, Supabase will POST that row's data to your Edge Function, which will trigger an email via your Gmail account!
