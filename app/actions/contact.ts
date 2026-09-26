"use server";

import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations";
import { getMailTransporter, getMailSenderAddress, isMailConfigured } from "@/lib/mail";
import { extractFormValues } from "@/lib/formState";
import { headers } from "next/headers";
import { consumeRateLimit, getClientIp, minutesUntil, rateLimitKey } from "@/lib/rateLimit";

export type ContactFormState = {
  error?: string;
  success?: boolean;
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "message"];
const CONTACT_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 }; // per visitor per hour

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    _gotcha: formData.get("_gotcha"),
  });

  if (!parsed.success) {
    // A filled-in honeypot fails validation too — respond as if it worked
    // so bots don't learn anything, without actually sending mail.
    if (formData.get("_gotcha")) {
      console.warn("[contact] Honeypot field was filled — treating as spam and not sending. If a real visitor reports a lost message, this is why: their browser autofill likely filled it.");
      return { success: true };
    }
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  if (!isMailConfigured()) {
    return {
      error: "This site can't send email yet — the owner hasn't configured mail delivery. Reach out directly instead.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  const profile = await prisma.profile.findUnique({ where: { id: "profile" } });
  const to = profile?.email;

  if (!to) {
    return {
      error: "No contact email is configured for this site yet.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  const limit = await consumeRateLimit(rateLimitKey("contact", getClientIp(await headers())), CONTACT_LIMIT);
  if (!limit.allowed) {
    return {
      error: `You've sent several messages already. Please try again in ${minutesUntil(limit.retryAfterMs)} minutes, or email directly.`,
      values: extractFormValues(formData, FIELDS),
    };
  }

  const { name, email, message } = parsed.data;

  try {
    await getMailTransporter().sendMail({
      from: `"Portfolio Contact Form" <${getMailSenderAddress()}>`,
      to,
      // Object form lets nodemailer encode the name safely; a hand-built
      // `"name" <email>` string could smuggle extra addresses in via the name.
      replyTo: { name, address: email },
      subject: `New portfolio message from ${name}`,
      text: `${message}\n\n— ${name} (${email})`,
      html: `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p><p>— ${escapeHtml(name)} (${escapeHtml(email)})</p>`,
    });
  } catch (err) {
    console.error("[contact] sendMail failed:", err);
    return {
      error: "Couldn't send the message right now. Please try again in a moment, or email directly.",
      values: extractFormValues(formData, FIELDS),
    };
  }

  return { success: true };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
