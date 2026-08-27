"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export type LoginState = { error?: string };

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a username and password." };
  }

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminUsername || !adminPasswordHash) {
    return { error: "Admin credentials are not configured on the server." };
  }

  if (parsed.data.username !== adminUsername) {
    return { error: "Invalid username or password." };
  }

  const valid = await bcrypt.compare(parsed.data.password, adminPasswordHash);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  await createSession();
  redirect("/admin");
}
