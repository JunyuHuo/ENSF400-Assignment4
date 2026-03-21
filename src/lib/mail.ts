import nodemailer from "nodemailer";

export async function sendVerificationEmail({
  email,
  name,
  token,
}: {
  email: string;
  name: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;
  const resendFrom = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [email],
          subject: "Verify your CineMatch account",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Welcome to CineMatch, ${name}!</h1>
              <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                We're excited to have you on board. To get started and unlock your personalized movie recommendations, please verify your email address.
              </p>
              <a href="${verifyUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-bottom: 32px;">
                Verify Email Address
              </a>
              <p style="color: #94a3b8; font-size: 14px;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                &copy; ${new Date().getFullYear()} CineMatch. All rights reserved.
              </p>
            </div>
          `,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Resend API error:", error);
      }
    } catch (error) {
      console.error("Failed to send verification email via Resend:", error);
    }
    return;
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`Verification email for ${name} <${email}>: ${verifyUrl}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to: email,
    subject: "Verify your CineMatch account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px;">
        <h2>Welcome to CineMatch, ${name}</h2>
        <p>Verify your email to unlock personalized recommendations and moderation tools.</p>
        <p><a href="${verifyUrl}">Click here to verify your account</a></p>
        <p>If the button does not open, paste this link into your browser:</p>
        <p>${verifyUrl}</p>
      </div>
    `,
  });
}
