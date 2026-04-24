import nodemailer from "nodemailer";

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(str = "") {
  return escapeHtml(str).replace(/\n/g, "<br/>");
}

function adminTemplate({ name, email, message }) {
  return `
  <div style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#a855f7,#ec4899);padding:1px;">
        <div style="background:#111827;border-radius:15px;padding:24px;color:#e5e7eb;">
          
          <div style="margin-bottom:20px;">
            <h2 style="margin:0;font-size:20px;color:#fff;">🚀 New Hire Me Request</h2>
            <p style="margin:6px 0 0;color:#9ca3af;font-size:13px;">
              Portfolio Inquiry Notification
            </p>
          </div>

          <div style="background:#1f2937;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 6px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin:0;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          </div>

          <div style="background:#1f2937;border-radius:12px;padding:16px;">
            <p style="margin:0 0 8px;"><strong>Message</strong></p>
            <div style="font-size:14px;line-height:1.6;color:#d1d5db;">
              ${nl2br(message)}
            </div>
          </div>

          <div style="margin-top:20px;font-size:12px;color:#6b7280;text-align:center;">
            This email was generated from your portfolio Hire Me form.
          </div>

        </div>
      </div>
    </div>
  </div>
  `;
}

function userTemplate({ name }) {
  return `
  <div style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#a855f7,#ec4899);padding:1px;">
        <div style="background:#111827;border-radius:15px;padding:24px;color:#e5e7eb; text-align:center;">
          
          <h2 style="margin:0 0 10px;color:#fff;">Thanks for reaching out, ${escapeHtml(
            name,
          )}! 🙌</h2>

          <p style="font-size:14px;color:#9ca3af;margin-bottom:20px;">
            I’ve received your message and will get back to you shortly.
          </p>

          <div style="background:#1f2937;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;">
              In the meantime, feel free to explore my work or connect directly.
            </p>
          </div>

          <a href="https://your-portfolio-url.com"
             style="display:inline-block;padding:10px 16px;border-radius:8px;
             background:linear-gradient(135deg,#a855f7,#ec4899);
             color:#fff;text-decoration:none;font-size:14px;">
             View Portfolio
          </a>

          <div style="margin-top:20px;font-size:12px;color:#6b7280;">
            — Swastik Jha
          </div>

        </div>
      </div>
    </div>
  </div>
  `;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required" }),
        { status: 400 },
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email" }),
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Hire Me Form" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `New Hire Me Request from ${name}`,
      html: adminTemplate({ name, email, message }),
    });

    await transporter.sendMail({
      from: `"Swastik Jha" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Thanks for reaching out 🚀",
      html: userTemplate({ name }),
    });

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Hire Me Email Error:", error);

    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500 },
    );
  }
}
