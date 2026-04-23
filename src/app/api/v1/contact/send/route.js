import nodemailer from "nodemailer";

const escapeHTML = (str = "") =>
  str.replace(/[&<>"']/g, (m) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[m];
  });

export async function POST(req) {
  try {
    const body = await req.json();

    const name = escapeHTML(body.name);
    const email = escapeHTML(body.email);
    const role = escapeHTML(body.role || "-");
    const company = escapeHTML(body.company || "-");
    const subject = escapeHTML(body.subject);
    const message = escapeHTML(body.message);

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
      from: `"Portfolio Contact" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_FROM,
      replyTo: email,
      subject: subject,
      text: `
New Contact Message

Name: ${name}
Email: ${email}
Role: ${role}
Company: ${company}

Message:
${message}
      `,
      html: `
<div style="background:#eef2ff;padding:30px 0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.1);">

          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:25px;color:#fff;">
              <h2 style="margin:0;">📩 New Portfolio Message</h2>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                Someone reached out through your portfolio
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px;">
              <table width="100%" style="font-size:14px;margin-bottom:20px;">
                <tr><td style="padding:6px 0;"><strong>Name:</strong> ${name}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Email:</strong> ${email}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Role:</strong> ${role}</td></tr>
                <tr><td style="padding:6px 0;"><strong>Company:</strong> ${company}</td></tr>
              </table>

              <div style="background:#f9fafb;border-radius:10px;padding:15px;border:1px solid #e5e7eb;">
                <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-line;">
                  ${message}
                </p>
              </div>

              <div style="margin-top:20px;text-align:center;">
                <a href="mailto:${email}" style="display:inline-block;padding:10px 18px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">
                  Reply to ${name}
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Portfolio
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
      `,
    });

    await transporter.sendMail({
      from: `"Swastik Jha" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Thanks for reaching out 👋",
      text: `
Hi ${name},

Thanks for contacting me. I’ve received your message and will respond soon.

Best regards,
Swastik Jha
      `,
      html: `
<div style="background:#f3f4f6;padding:30px 0;font-family:Arial,sans-serif;">
  <table width="100%">
    <tr>
      <td align="center">
        <table width="600" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:25px;color:#fff;">
              <h2 style="margin:0;">Thank You 👋</h2>
              <p style="margin:6px 0 0;font-size:13px;opacity:0.9;">
                Your message has been received
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:25px;color:#333;">
              <p style="margin-bottom:15px;">Hi <strong>${name}</strong>,</p>

              <p style="font-size:14px;margin-bottom:20px;">
                I appreciate you reaching out. I’ve received your message and will get back to you shortly.
              </p>

              <div style="background:#eef2ff;border-radius:10px;padding:15px;border:1px solid #c7d2fe;">
                <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-line;">
                  ${message}
                </p>
              </div>

              <p style="margin-top:20px;font-size:14px;">
                Meanwhile, feel free to explore my work or connect with me on my platforms.
              </p>

              <div style="margin-top:20px;text-align:center;">
                <a href="mailto:${process.env.SMTP_FROM}" style="display:inline-block;padding:10px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;">
                  Contact Me Directly
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;padding:12px;text-align:center;font-size:12px;color:#888;">
              © ${new Date().getFullYear()} Swastik Jha
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
