// functions/api/contact.js
// Stage 2: reads form fields, no Mailgun yet

export async function onRequestGet() {
    return new Response("Contact endpoint OK.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

export async function onRequestPost({ request }) {
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

    return new Response(
        "Contact function OK.\n\nHere is what I parsed:\n\n" + bodyText,
        { status: 200, headers: { "Content-Type": "text/plain" } }
    );
}
