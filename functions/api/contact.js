// functions/api/contact.js
// G Cloud Solutions contact handler
//  - Accepts POSTed form data from /#contact
//  - Honeypot for bots
//  - Sends email via Mailgun
//  - Optionally syncs lead to Pi API
//  - Redirects back to /#contact-success

const MAILGUN_API_BASE = "https://api.mailgun.net/v3";

export async function onRequestGet() {
    return new Response("Contact endpoint OK.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.formData();

        // ---------- Honeypot ----------
        const extra = formData.get("extra_field");
        if (extra) {
            // Bot filled hidden field – silently succeed.
            return new Response("OK", { status: 200 });
        }

        // ---------- Extract fields ----------
        const business = (formData.get("business_name") || "").trim();
        const phone = (formData.get("phone") || "").trim();
        const email = (formData.get("email") || "").trim();
        const website = (formData.get("website") || "").trim();
        const subject = (formData.get("subject") || "").trim() || "New G Cloud Solutions inquiry";
        const description = (formData.get("description") || "").trim();
        const bestTime = (formData.get("best_time") || "").trim();
        const bestMethod = (formData.get("best_method") || "").trim();
        const onsite = (formData.get("onsite_required") || "").trim();

        if (!email || !description) {
            return new Response("Missing required fields.", { status: 400 });
        }

        // ---------- Compose email ----------
        const toEmail = env.MAILGUN_TO || env.CONTACT_TO || "";
        const fromEmail =
            env.MAILGUN_FROM || `G Cloud Solutions <no-reply@${env.MAILGUN_DOMAIN || "example.com"}>`;

        if (!env.MAILGUN_API_KEY || !env.MAILGUN_DOMAIN || !toEmail) {
            console.error("[contact] Missing Mailgun env vars.");
            return new Response("Server misconfigured. Please try again later.", { status: 500 });
        }

        const textBody = [
            "New contact form submission:",
            "",
            `Business:     ${business || "(not provided)"}`,
            `Name / Email: ${email}`,
            `Phone:        ${phone || "(not provided)"}`,
            `Website:      ${website || "(not provided)"}`,
            "",
            `Best time:    ${bestTime || "(not provided)"}`,
            `Best method:  ${bestMethod || "(not provided)"}`,
            `On-site?:     ${onsite || "(not specified)"}`,
            "",
            "Description:",
            description,
            "",
            "— G Cloud Solutions contact form",
        ].join("\n");

        // Mailgun expects URL-encoded form data
        const mgBody = new URLSearchParams();
        mgBody.set("from", fromEmail);
        mgBody.set("to", toEmail);
        mgBody.set("subject", subject);
        mgBody.set("text", textBody);

        const authHeader = "Basic " + btoa(`api:${env.MAILGUN_API_KEY}`);

        // ---------- Send via Mailgun ----------
        const mgRes = await fetch(`${MAILGUN_API_BASE}/${env.MAILGUN_DOMAIN}/messages`, {
            method: "POST",
            headers: {
                Authorization: authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: mgBody.toString(),
        });

        if (!mgRes.ok) {
            const errText = await mgRes.text();
            console.error("[contact] Mailgun error:", mgRes.status, errText);
            // We still continue to Pi sync + redirect so user doesn’t see a failure.
        } else {
            console.log("[contact] Mailgun email sent.");
        }

        // ---------- Optional: Pi Lead API Sync ----------
        try {
            if (env.PI_LEAD_API_URL) {
                const leadPayload = {
                    business_name: business,
                    phone,
                    email,
                    website,
                    subject,
                    description,
                    best_time: bestTime,
                    best_method: bestMethod,
                    onsite_required: onsite,
                };

                const piRes = await fetch(env.PI_LEAD_API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(leadPayload),
                });

                if (!piRes.ok) {
                    const text = await piRes.text();
                    console.error("[contact] Pi API error:", piRes.status, text);
                } else {
                    console.log("[contact] Lead synced to Pi API.");
                }
            }
        } catch (err) {
            console.error("[contact] Pi API exception:", err);
        }

        // ---------- Redirect back to the site ----------
        return new Response(null, {
            status: 303,
            headers: {
                Location: "/#contact-success",
            },
        });
    } catch (err) {
        console.error("[contact] Unexpected error:", err);
        return new Response("Something went wrong.", { status: 500 });
    }
}
