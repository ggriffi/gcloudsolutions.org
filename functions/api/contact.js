// functions/api/contact.js

export async function onRequestPost({ request, env }) {
    const formData = await request.formData();

    // Honeypot
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

    // Just check env vars for now
    const apiKey = env.MAILGUN_API_KEY;
    const domain = env.MAILGUN_DOMAIN;
    const toEmail = env.MAILGUN_TO_EMAIL;

    return new Response(
        [
            "Contact function OK.",
            "",
            "MAILGUN_API_KEY set: " + !!apiKey,
            "MAILGUN_DOMAIN set: " + !!domain,
            "MAILGUN_TO_EMAIL set: " + !!toEmail,
        ].join("\n"),
        { status: 200, headers: { "Content-Type": "text/plain" } }
    );
}

export async function onRequestGet() {
    return new Response(
        "Contact endpoint. Please submit the form from the website.",
        { status: 200, headers: { "Content-Type": "text/plain" } }
    );
}
