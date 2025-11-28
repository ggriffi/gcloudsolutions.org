// functions/api/contact.js
// Production version: Mailgun + redirect to #contact-success

export async function onRequestGet() {
    return new Response("Contact endpoint OK.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

export async function onRequestPost({ request, env }) {
    let debug = [];

    try {
        const formData = await request.formData();

        // Honeypot spam trap
        const extra = formData.get("extra_field");
        if (extra) {
            return new Response("OK (bot ignored)", { status: 200 });
        }

        const business = formData.get("business_name") || "";
        const phone = formData.get("phone") || "";
        const email = formData.get("email") || "";
        const website = formData.get("website") || "";
        const subject = formData.get("subject") || "New consulting request";
        const description = formData.get("description") || "";
        const bestTime = formData.get("best_time") || "";
        const bestMethod = formData.get("best_method") || "";
        const onsite = formData.get("onsite_required") || "";

        if (!email || !business || !description) {
            return new Response("Missing required fields.", { status: 400 });
        }

        const bodyText =
            "New consulting request from G Cloud Solutions website\n\n" +
            "Business Name: " + business + "\n" +
            "Phone: " + phone + "\n" +
            "Email: " + email + "\n" +
            "Website: " + website + "\n\n" +
            "Subject: " + subject + "\n" +
            "Description:\n" + description + "\n\n" +
            "Best time to contact: " + bestTime + "\n" +
            "Best method to contact: " + bestMethod + "\n" +
            "On-site presence required: " + onsite + "\n";

        const apiKey = env.MAILGUN_API_KEY;
        const domain = env.MAILGUN_DOMAIN;
        const toEmail = env.MAILGUN_TO_EMAIL;

        if (!apiKey || !domain || !toEmail) {
            console.error("[contact] Missing Mailgun env vars:", {
                apiKey: !!apiKey,
                domain: !!domain,
                toEmail: !!toEmail,
            });
            return new Response("Server misconfigured.", { status: 500 });
        }

        const authHeader = "Basic " + btoa("api:" + apiKey);

        const params = new URLSearchParams();
        params.append("from", "G Cloud Solutions <no-reply@" + domain + ">");
        params.append("to", toEmail);
        params.append("subject", "New consulting request: " + business);
        params.append("text", bodyText);

        const url = "https://api.mailgun.net/v3/" + domain + "/messages";

        const mgRes = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const mgText = await mgRes.text();

        if (!mgRes.ok) {
            console.error("[contact] Mailgun error:", mgRes.status, mgText);
            // Still redirect to success on frontend so user doesn't see internals
            return new Response(null, {
                status: 303,
                headers: { Location: "/#contact-success" },
            });
        }

        // Optional: log success for debugging
        console.log("[contact] Mailgun success:", mgRes.status, mgText);
ChatGPT said:

🔥 LET’S GOOO!! 🔥

That means:

Your Pi API is now publicly reachable(via Cloudflare Tunnel)

DNS is resolving correctly

Tunnel routing is correct

Your Docker app is accessible from the internet(securely)

The entire infrastructure path is now unblocked

This is the hard part — and you nailed it.

Now we can finish the final step that turns this entire system into a real CRM backend:

✅ FINAL STEP: Wire Cloudflare Function → Pi Lead API

So every consulting form submission automatically enters your Pi database.

            Open:
        functions / api / contact.js

And add this code right before the redirect:

        // -------- Sync to Pi Lead API --------
        try {
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

            await fetch("https://leads.gcloudsolutions.org/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(leadPayload),
            });

            console.log("[contact] Lead synced to Pi API.");
        } catch (err) {
            console.error("[contact] Failed syncing to Pi API:", err);
        }
        // Redirect back to contact section with success indicator
        return new Response(null, {
            status: 303,
            headers: { Location: "/#contact-success" },
        });
    } catch (err) {
        console.error("[contact] Unexpected error:", err);
        return new Response("Something went wrong.", { status: 500 });
    }
}
