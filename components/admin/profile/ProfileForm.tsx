"use client";

import { useActionState } from "react";
import type { Profile } from "@prisma/client";
import { upsertProfile, type ProfileFormState } from "@/app/admin/(dashboard)/profile/actions";
import { SkillsEditor } from "./SkillsEditor";
import type { SkillGroup } from "@/lib/data";
import { label, input, textarea, primaryButton } from "@/components/admin/styles";
import { AvatarCutoutField } from "./AvatarCutoutField";

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(upsertProfile, initialState);
  const skills = (profile?.skills as unknown as SkillGroup[]) ?? [];

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={profile?.name} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input id="email" name="email" type="email" defaultValue={profile?.email} required className={input} />
        </div>
      </div>

      <AvatarCutoutField currentUrl={profile?.avatarUrl} />

      <div>
        <label className={label} htmlFor="tagline">Tagline</label>
        <input
          id="tagline"
          name="tagline"
          defaultValue={profile?.tagline}
          required
          placeholder="Software Engineer — .NET / Backend Systems"
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="heroIntro">Hero intro (1-2 lines)</label>
        <textarea id="heroIntro" name="heroIntro" defaultValue={profile?.heroIntro} required rows={2} className={textarea} />
      </div>

      <div>
        <label className={label} htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" defaultValue={profile?.bio} required rows={5} className={textarea} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="githubUrl">GitHub URL</label>
          <input id="githubUrl" name="githubUrl" defaultValue={profile?.githubUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="linkedinUrl">LinkedIn URL</label>
          <input id="linkedinUrl" name="linkedinUrl" defaultValue={profile?.linkedinUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="resumeUrl">Resume URL</label>
          <input id="resumeUrl" name="resumeUrl" defaultValue={profile?.resumeUrl ?? ""} className={input} />
        </div>
      </div>

      <SkillsEditor initialSkills={skills} />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}
      {state.success && <p className="font-mono text-sm text-emerald-500">Saved.</p>}

      <button type="submit" disabled={pending} className={primaryButton}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
