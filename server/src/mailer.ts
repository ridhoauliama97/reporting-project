import nodemailer from "nodemailer";

interface MailMessage {
  to: string;
  subject: string;
  text: string;
}

const smtpHost = process.env.SMTP_HOST;
const isDev = !smtpHost;

const transporter = isDev
  ? null
  : nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

export async function sendMail({ to, subject, text }: MailMessage): Promise<void> {
  if (transporter) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? "Reporting App <no-reply@reporting.local>",
      to,
      subject,
      text,
    });
    return;
  }
  // Dev transport: log the mail (and its links) instead of sending.
  const link = text.match(/https?:\/\/[^\s]+/)?.[0] ?? "";
  console.log(`[mailer DEV] to=${to} | subject=${subject}`);
  console.log(`[mailer DEV] ---`);
  console.log(text);
  if (link) console.log(`[mailer DEV] LINK: ${link}`);
  console.log(`[mailer DEV] ---`);
}
