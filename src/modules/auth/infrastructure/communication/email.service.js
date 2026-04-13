import nodemailer from "nodemailer";
import logger from "@/shared/lib/logger";

export class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(email, verificationUrl) {
    try {
      const html = this.buildVerificationTemplate(verificationUrl);

      const info = await this.transporter.sendMail({
        from: `"Your App" <${process.env.SMTP_FROM}>`,
        to: email,
        subject: "Verify your email",
        html,
      });

      logger.info("📧 Verification email sent", {
        to: email,
        messageId: info.messageId,
      });

      return true;
    } catch (err) {
      logger.error("Email send failed", {
        message: err.message,
      });
      throw err;
    }
  }

  buildVerificationTemplate(url) {
    return `
  <div style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <!-- Card -->
          <table width="480" cellpadding="0" cellspacing="0" 
                 style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:#4f46e5;padding:30px;text-align:center;color:white;">
                <h1 style="margin:0;font-size:24px;">🚀 Verify Your Email</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px;text-align:center;color:#333;">
                <p style="font-size:16px;margin-bottom:20px;">
                  Welcome! Please confirm your email address to get started.
                </p>

                <!-- Solid Button -->
                <a href="${url}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    font-size:16px;
                    font-weight:bold;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    background:#2563eb;
                  ">
                  Verify Email
                </a>

                <!-- Backup Link -->
                <p style="margin-top:20px;font-size:13px;color:#666;">
                  If the button doesn't work, use this link:
                </p>

                <p style="word-break:break-all;font-size:12px;">
                  <a href="${url}" style="color:#2563eb;">
                    ${url}
                  </a>
                </p>

                <p style="margin-top:20px;font-size:13px;color:#666;">
                  This link expires in 15 minutes.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px;text-align:center;font-size:12px;color:#999;">
                If you didn’t request this, you can safely ignore this email.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </div>
  `;
  }
}
