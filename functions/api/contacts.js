// functions/api/contact.js
export async function onRequestPost(context) {
  const { request } = context;

  // Parse form data
  const formData = await request.formData();

  // Basic honeypot check
  const extra = formData.get("extra_field");
  if (extra) {
    // Bot likely filled hidden field, drop it quietly
    return new Response("OK", { status: 200 });
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

  // Very basic validation
  if (!email || !business || !description) {
    return new Response("Missing required fields.", { status: 400 });
  }

  // Build a message body
  const bodyText =
    `New consulting request from G Cloud Solutions website\n\n` +
    `Business Name: ${business}\n` +
    `Phone: ${phone}\n` +
    `Email: ${email}\n` +
    `Website: ${website}\n\n` +
    `Subject: ${subject}\n` +
    `Description:\n${description}\n\n` +
    `Best time to contact: ${bestTime}\n` +
    `Best method to contact: ${bestMethod}\n` +
    `On-site presence required: ${onsite}\n`;

  // -----
  // OPTION 1: For now, just log it and return a success.
  // This lets you test that the function is being hit.
  // -----
  console.log(bodyText);

  // Later you’ll plug in an email API call here (SendGrid/Mailgun/etc.)
  // and/or write to a KV store / D1 database.

  // Decide how to respond:
  // If you want to handle this as a traditional form POST, redirect to a thank-you anchor:
  const headers = {
    Location: "/#contact-success",
  };
  return new Response(null, { status: 303, headers });
}

// Optional: handle GET so you don't get weird errors if someone visits /api/contact
export async function onRequestGet(context) {
  return new Response("Contact endpoint. Please submit the form from the website.", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
