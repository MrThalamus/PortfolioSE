"use server";

import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validations";
import { getMailTransporter, getMailSenderAddress, isMailConfigured } from "@/lib/mail";
import { extractFormValues } from "@/lib/formState";

export type ContactFormState = {
  error?: string;
  success?: boolean;
  values?: Record<string, string>;
};

const FIELDS = ["name", "email", "message"];

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
    company: formData.get("company"),
  });

  if (!parsed.success) {
    // A filled-in honeypot fails validation too — respond as if it worked
    // so bots don't learn anything, without actually sending mail.
    if (formData.get("company")) {
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

  const { name, email, message } = parsed.data;

  try {
    await getMailTransporter().sendMail({
      from: `"Portfolio Contact Form" <${getMailSenderAddress()}>`,
      to,
      replyTo: `"${name}" <${email}>`,
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
