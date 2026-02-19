const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeText = (value, max = 5000) =>
  String(value || "")
    .trim()
    .slice(0, max);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const name = normalizeText(req.body?.name, 120);
    const email = normalizeText(req.body?.email, 200);
    const subject = normalizeText(req.body?.subject, 180);
    const message = normalizeText(req.body?.message, 5000);

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_RECEIVER_EMAIL;
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

    if (!resendApiKey || !toEmail) {
      return res.status(500).json({
        error:
          "Contact API not configured. Missing RESEND_API_KEY or CONTACT_RECEIVER_EMAIL.",
      });
    }

    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: `[Portfolio Contact] ${subject}`,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({
        error:
          data?.message || data?.error || "Email service rejected the request.",
      });
    }

    return res.status(200).json({ success: true, id: data?.id || null });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Server error." });
  }
}
