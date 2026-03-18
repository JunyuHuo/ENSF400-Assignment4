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
    await fetch("https://api.resend.com/emails", {
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
          <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>Welcome to CineMatch, ${name}</h2>
            <p>Verify your email to unlock personalized recommendations and moderation tools.</p>
            <p><a href="${verifyUrl}">Click here to verify your account</a></p>
            <p>If the button does not open, paste this link into your browser:</p>
            <p>${verifyUrl}</p>
          </div>
        `,
      }),
      cache: "no-store",
    });
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
