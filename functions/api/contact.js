// functions/api/contact.js
// Safe, minimal version: no Mailgun, no external calls.
// Just logs the form data and redirects back with 303.

export async function onRequestGet() {
    return new Response("Contact endpoint OK v2", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}

export async function onRequestPost({ request }) {
    try {
        const formData = await request.formData();

        // Basic logging so you can see submissions in Cloudflare logs
        const entries = [];
        for (const [key, value] of formData.entries()) {
            entries.push([key, value]);
        }
        console.log("[contact] Form submission:", JSON.stringify(entries));

        // Honeypot check (extra_field)
        const extra = formData.get("extra_field");
        if (extra) {
            console.warn("[contact] Honeypot field filled, treating as bot.");
            // Pretend success, but don't do anything else.
            return new Response(null, {
                status: 303,
                headers: { Location: "/#contact-success" },
            });
        }

        // If we got here, treat as success
        return new Response(null, {
            status: 303,
            headers: { Location: "/#contact-success" },
        });
    } catch (err) {
        console.error("[contact] Unexpected error:", err);
        // Even on error, don’t break UX – still show success page
        return new Response(null, {
            status: 303,
            headers: { Location: "/#contact-success" },
        });
    }
}
