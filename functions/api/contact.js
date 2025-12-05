// functions/api/contact.js
// G Cloud Solutions contact handler (Mailgun optional)
//
// - Always returns 303 redirect to /#contact-success for POST
// - Uses honeypot (extra_field) to filter bots
// - Sends email via Mailgun if env vars are present
// - Optionally POSTs to PI_LEAD_API_URL

const MAILGUN_API_BASE = "https://api.mailgun.net/v3";

export async function onRequestGet() {
    return new Response("Contact endpoint OK v3", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

export async function onRequestPost({ request, env }) {
    let redirectResponse = new Response(null, {
        status: 303,
        headers: { Location: "/#contact-success" },
    });

    try {
        const formData = await request.formData();

        // ---------- Honeypot ----------
        const extra = formData.get("extra_field");
        if (extra) {
            console.warn("[contact] Honeypot filled, treating as bot.");
            return redirectResponse;
        }

        // ---------- Extract fields ----------
        const business = (formData.get("business_name") || "").trim();
        const phone = (formData.get("phone") || "").trim();
        const email = (formData.get("email") || "").trim();
        const website = (formData.get("website") || "").trim();
        const subject =
            (formData.get("subject") || "").trim() || "New G Cloud Solutions inquiry";
        const description = (formData.get("description") || "").trim();
        const bestTime = (formData.get("best_time") || "").trim();
        const bestMethod = (formData.get("best_method") || "").trim();
        const onsite = (formData.get("onsite_required") || "").trim();

        // HTML `required` attributes already enforce key fields,
        // so we don’t block here – just log if something is weird.
        if (!email || !description) {
            console.warn("[contact] Email or description missing:", { email, descriptionPresent: !!description });
        }

        // ---------- Build email body ----------
        const textBody = [
            "New contact form submission:",
            "",
            `Business:     ${business || "(not provided)"}`,
            `Email:        ${email || "(not provided)"}`,
            `Phone:        ${phone || "(not provided)"}`,
            `Website:      ${website || "(not provided)"}`,
            "",
            `Best time:    ${bestTime || "(not provided)"}`,
            `Best method:  ${bestMethod || "(not provided)"}`,
            `On-site?:     ${onsite || "(not specified)"}`,
            "",
            "Description:",
            description || "(none)",
            "",
            "— G Cloud Solutions contact form",
        ].join("\n");

        // ---------- Mailgun config ----------
        const toEmail = env.MAILGUN_TO || env.CONTACT_TO || "";
        const fromEmail =
            env.MAILGUN_FROM ||
            `G Cloud Solutions <no-reply@${env.MAILGUN_DOMAIN || "example.com"}>`;

        const mailEnabled =
            !!env.MAILGUN_API_KEY && !!env.MAILGUN_DOMAIN && !!toEmail;

        if (!mailEnabled) {
            console.warn("[contact] Mailgun not fully configured – skipping email send.", {
                hasApiKey: !!env.MAILGUN_API_KEY,
                hasDomain: !!env.MAILGUN_DOMAIN,
                hasTo: !!toEmail,
            });
        } else {
            try {
                const mgBody = new URLSearchParams();
                mgBody.set("from", fromEmail);
                mgBody.set("to", toEmail);
                mgBody.set("subject", subject);
                mgBody.set("text", textBody);

                const authHeader = "Basic " + btoa(`api:${env.MAILGUN_API_KEY}`);

                const mgRes = await fetch(
                    `${MAILGUN_API_BASE}/${env.MAILGUN_DOMAIN}/messages`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: authHeader,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: mgBody.toString(),
                    }
                );

                if (!mgRes.ok) {
                    const errText = await mgRes.text();
                    console.error("[contact] Mailgun error:", mgRes.status, errText);
                } else {
                    console.log("[contact] Mailgun email sent.");
                }
            } catch (err) {
                console.error("[contact] Mailgun exception:", err);
            }
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

        // Always give the user a success redirect
        return redirectResponse;
    } catch (err) {
        console.error("[contact] Top-level error:", err);
        // Even on unexpected error, keep UX consistent
        return redirectResponse;
    }
}
