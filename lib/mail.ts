import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

/**
 * Lazily creates a singleton SMTP transporter. Defaults to Gmail's SMTP
 * service (GMAIL_USER / GMAIL_APP_PASSWORD), but any SMTP host works if
 * SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are set instead — used for testing
 * against a throwaway inbox (e.g. Ethereal) without touching a real account.
 */
export function getMailTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      // Google displays app passwords with spaces for readability
      // ("abcd efgh ijkl mnop") — strip them, since some auth paths are
      // strict about the credential matching the un-spaced 16 characters.
      pass: (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s+/g, ""),
    },
  });
  return transporter;
}

export function getMailSenderAddress(): string {
  return process.env.SMTP_USER || process.env.GMAIL_USER || "";
}

export function isMailConfigured(): boolean {
  return Boolean(
    (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ||
      (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
  );
}
