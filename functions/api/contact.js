// functions/api/contact.js
// Stage 3: Mailgun integration (debug-friendly)

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
            return new Response("Missing required fields.", {
                status: 400,
                headers: { "Content-Type": "text/plain" },
            });
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

        debug.push("MAILGUN_API_KEY set: " + !!apiKey);
        debug.push("MAILGUN_DOMAIN set: " + !!domain);
        debug.push("MAILGUN_TO_EMAIL set: " + !!toEmail);

        if (!apiKey || !domain || !toEmail) {
            debug.push("Missing one or more Mailgun env vars.");
            return new Response(debug.join("\n"), {
                status: 500,
                headers: { "Content-Type": "text/plain" },
            });
        }

        // Build Basic auth header: api:API_KEY → base64
        const authHeader = "Basic " + btoa("api:" + apiKey);

        const params = new URLSearchParams();
        params.append("from", "G Cloud Solutions <no-reply@" + domain + ">");
        params.append("to", toEmail);
        params.append("subject", "New consulting request: " + business);
        params.append("text", bodyText);

        const url = "https://api.mailgun.net/v3/" + domain + "/messages";
        debug.push("Request URL: " + url);

        const mgRes = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        const mgText = await mgRes.text();
        debug.push("Mailgun status: " + mgRes.status);
        debug.push("Mailgun response: " + mgText);

        if (!mgRes.ok) {
            debug.push("Mailgun returned non-OK status.");
            return new Response("Mailgun error:\n" + debug.join("\n"), {
                status: 502,
                headers: { "Content-Type": "text/plain" },
            });
        }

        // Success
        return new Response("Mailgun accepted the message.\n\n" + debug.join("\n"), {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    } catch (err) {
        debug.push("Exception: " + String(err));
        return new Response("Unexpected error:\n" + debug.join("\n"), {
            status: 500,
            headers: { "Content-Type": "text/plain" },
        });
    }
}
