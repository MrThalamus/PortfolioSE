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

  // A failed submission clears every uncontrolled field in the form (a React
  // quirk, not specific to this app). The action echoes back what was typed
  // so each plain text field can restore it — keyed individually (rather than
  // the whole form) so AvatarCutoutField and SkillsEditor, which hold their
  // own state, don't get remounted and lose an in-progress cutout or edit.
  const v = state.values;

  return (
    <form action={formAction} className="max-w-2xl space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="name">Full name</label>
          <input key={v?.name ?? ""} id="name" name="name" defaultValue={v?.name ?? profile?.name} required className={input} />
        </div>
        <div>
          <label className={label} htmlFor="nickname">Nickname</label>
          <input
            key={v?.nickname ?? ""}
            id="nickname"
            name="nickname"
            defaultValue={v?.nickname ?? profile?.nickname ?? ""}
            placeholder="Shown in the nav and hero code snippet"
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="email">Email</label>
          <input key={v?.email ?? ""} id="email" name="email" type="email" defaultValue={v?.email ?? profile?.email} required className={input} />
        </div>
      </div>

      <AvatarCutoutField currentUrl={profile?.avatarUrl} defaultUrlValue={v?.avatarUrl ?? ""} resetSignal={state} />

      <div>
        <label className={label} htmlFor="tagline">Tagline</label>
        <input
          key={v?.tagline ?? ""}
          id="tagline"
          name="tagline"
          defaultValue={v?.tagline ?? profile?.tagline}
          required
          placeholder="Software Engineer — .NET / Backend Systems"
          className={input}
        />
      </div>

      <div>
        <label className={label} htmlFor="heroIntro">Hero intro (1-2 lines)</label>
        <textarea
          key={v?.heroIntro ?? ""}
          id="heroIntro"
          name="heroIntro"
          defaultValue={v?.heroIntro ?? profile?.heroIntro}
          required
          rows={2}
          className={textarea}
        />
      </div>

      <div>
        <label className={label} htmlFor="bio">Bio</label>
        <textarea key={v?.bio ?? ""} id="bio" name="bio" defaultValue={v?.bio ?? profile?.bio} required rows={5} className={textarea} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="githubUrl">GitHub URL</label>
          <input key={v?.githubUrl ?? ""} id="githubUrl" name="githubUrl" defaultValue={v?.githubUrl ?? profile?.githubUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="linkedinUrl">LinkedIn URL</label>
          <input key={v?.linkedinUrl ?? ""} id="linkedinUrl" name="linkedinUrl" defaultValue={v?.linkedinUrl ?? profile?.linkedinUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="resumeUrl">Resume URL</label>
          <input key={v?.resumeUrl ?? ""} id="resumeUrl" name="resumeUrl" defaultValue={v?.resumeUrl ?? profile?.resumeUrl ?? ""} className={input} />
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
