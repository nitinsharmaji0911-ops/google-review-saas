import nodemailer from "nodemailer";

/**
 * Real Email Dispatch Service
 * Supports Gmail, Brevo, SendGrid, Resend, or custom SMTP.
 * Automatically falls back to Ethereal Email for instant live preview if no credentials are configured.
 */
export async function sendPasswordResetEmail({
  to,
  resetLink,
  businessName = "Your Business",
}: {
  to: string;
  resetLink: string;
  businessName?: string;
}): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
  try {
    let transporter: nodemailer.Transporter;

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
    const smtpFrom = process.env.SMTP_FROM || `"RevüAssist" <noreply@revuassist.com>`;

    let isEthereal = false;

    // Use configured live SMTP (e.g. Gmail / Resend / Brevo)
    if (smtpHost && smtpUser && smtpPass) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      // Direct Gmail App Password shortcut
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });
    } else {
      // Auto-create an Ethereal test inbox for instant live email delivery testing
      isEthereal = true;
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    // High-converting Apple/Linear-styled HTML Email Template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #0f172a; }
          .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px 36px; box-shadow: 0 10px 30px rgba(0,0,0,0.04); }
          .logo { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 24px; display: inline-block; }
          .badge { display: inline-block; padding: 4px 12px; background: #f1f5f9; border-radius: 9999px; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 16px; }
          h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; letter-spacing: -0.02em; }
          p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn { display: inline-block; background: #0f172a; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(15,23,42,0.2); }
          .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; line-height: 1.5; }
          .link-fallback { word-break: break-all; color: #6366f1; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="logo">R <span style="color:#cbd5e1; font-weight:300;">|</span> RevüAssist</div>
          <div class="badge">Security Notification</div>
          <h1>Password Reset Request</h1>
          <p>Hello,</p>
          <p>We received a request to reset the password for your business account associated with <strong>${to}</strong>. Click the button below to set a new password:</p>
          
          <div class="btn-container">
            <a href="${resetLink}" target="_blank" class="btn">Reset My Password</a>
          </div>

          <p>This confirmation link is valid for <strong>1 hour</strong>. If you did not request this, you can safely ignore this email and your password will remain unchanged.</p>
          
          <div class="footer">
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p><a href="${resetLink}" class="link-fallback">${resetLink}</a></p>
            <p style="margin-top: 16px;">© 2026 RevüAssist • 100% Google Policy Compliant Review Assistant</p>
          </div>
        </div>
      </body>
    </html>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject: `Reset your RevüAssist account password`,
      text: `Reset your password by opening this link in your browser: ${resetLink} (Valid for 1 hour)`,
      html: htmlContent,
    });

    let previewUrl: string | undefined;
    if (isEthereal) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log("==================================================");
      console.log(`[ETHEREAL LIVE EMAIL SENT] To: ${to}`);
      console.log(`[VIEW EMAIL ONLINE]: ${previewUrl}`);
      console.log("==================================================");
    } else {
      console.log(`[LIVE EMAIL DELIVERED] To: ${to} (MessageId: ${info.messageId})`);
    }

    return { success: true, previewUrl };
  } catch (err: any) {
    console.error("Failed to send reset email:", err);
    return { success: false, error: err.message };
  }
}
