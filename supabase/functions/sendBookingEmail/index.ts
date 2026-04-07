// functions/sendBookingEmail/index.ts
import { serve } from "https://deno.land/std@0.201.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    const { to, subject, html } = body;

    // Use environment variables defined in Supabase secrets
    const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN"); // e.g., "mg.jnvent.com"
    const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY"); // your Mailgun private API key

    if (!MAILGUN_DOMAIN || !MAILGUN_API_KEY) {
      return new Response("Mailgun not configured", { status: 500 });
    }

    const auth = "Basic " + btoa(`api:${MAILGUN_API_KEY}`);

    const formData = new URLSearchParams();
    formData.append("from", `Booking <no-reply@${MAILGUN_DOMAIN}>`);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("html", html);

    const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(`Mailgun error: ${text}`, { status: 500 });
    }

    return new Response("Email sent!");
  } catch (error) {
    return new Response("Error: " + error.message, { status: 500 });
  }
});