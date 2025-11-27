// functions/api/contact.js

export async function onRequestPost(context) {
  const { request, env } = context;

  const formData = await request.formData();

  // Honeypot spam trap
  const extra = formData.get("extra_field");
  if (extra) {
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

  if (!email || !business || !description) {
    return new Response("Missing required fields.", { status: 400 });
  }

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

  // --- MAILGUN EMAIL SEND ---
  try {
    const apiKey = env.MAILGUN_API_KEY;
    const domain = env.MAILGUN_DOMAIN;
    const toEmail = env.MAILGUN_TO_EMAIL;

    if (!apiKey || !domain || !toEmail) {
      console.error("Mailgun env vars missing");
    } else {
      const auth = "Basic " + btoa(`api:${apiKey}`);

      const params = new URLSearchParams();
      params.append("from", `G Cloud Solutions <no-reply@${domain}>`);
      params.append("to", toEmail);
      params.append("subject", `New consulting request: ${business}`);
      params.append("text", bodyText);

      const mgRes = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: "POST",
        headers: {
          "Authorization": auth,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!mgRes.ok) {
        const errText = await mgRes.text();
        console.error("Mailgun error:", mgRes.status, errText);
      }
    }
  } catch (err) {
    console.error("Error sending via Mailgun:", err);
  }

  // Redirect back to the contact section with success flag
  return new Response(null, {
    status: 303,
    headers: { Location: "/#contact-success" },
  });
}

export async function onRequestGet(context) {
  return new Response(
    "Contact endpoint. Please submit the form from the website.",
    { status: 200, headers: { "Content-Type": "text/plain" } }
  );
}
