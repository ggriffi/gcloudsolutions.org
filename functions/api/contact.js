// functions/api/contact.js
export async function onRequestPost() {
    return new Response("Contact POST is alive.", { status: 200 });
}

export async function onRequestGet() {
    return new Response("Contact endpoint OK.", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
    });
}
// functions/api/contact.js