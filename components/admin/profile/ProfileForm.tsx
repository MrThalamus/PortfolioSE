"use client";

import { useActionState, useState } from "react";
import type { Profile } from "@prisma/client";
import { upsertProfile, type ProfileFormState } from "@/app/admin/(dashboard)/profile/actions";
import { SkillsEditor } from "./SkillsEditor";
import type { SkillGroup } from "@/lib/data";
import { label, input, textarea, primaryButton } from "@/components/admin/styles";
import { AvatarCutoutField } from "./AvatarCutoutField";
import { uploadFileToBlob } from "@/lib/blobUpload";

const initialState: ProfileFormState = {};

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(upsertProfile, initialState);
  const skills = (profile?.skills as unknown as SkillGroup[]) ?? [];

  // A failed submission clears every uncontrolled field in the form (a React
  // quirk, not specific to this app). The action echoes back what was typed
  // so each plain text field can restore it — keyed individually (rather than
  // the whole form) so SkillsEditor, which holds its own state, doesn't get
  // remounted and lose an in-progress edit.
  const v = state.values;
  const [resumeUrl, setResumeUrl] = useState(v?.resumeUrl ?? profile?.resumeUrl ?? "");
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  async function handleResumeFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeUploading(true);
    setResumeError(null);
    try {
      const uploadedUrl = await uploadFileToBlob(file, "resume");
      setResumeUrl(uploadedUrl);
    } catch {
      setResumeError("Upload failed. Try again, or paste a URL instead.");
    } finally {
      setResumeUploading(false);
      e.target.value = "";
    }
  }

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

      <AvatarCutoutField currentUrl={profile?.avatarUrl} defaultUrlValue={v?.avatarUrl ?? ""} />

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="githubUrl">GitHub URL</label>
          <input key={v?.githubUrl ?? ""} id="githubUrl" name="githubUrl" defaultValue={v?.githubUrl ?? profile?.githubUrl ?? ""} className={input} />
        </div>
        <div>
          <label className={label} htmlFor="linkedinUrl">LinkedIn URL</label>
          <input key={v?.linkedinUrl ?? ""} id="linkedinUrl" name="linkedinUrl" defaultValue={v?.linkedinUrl ?? profile?.linkedinUrl ?? ""} className={input} />
        </div>
      </div>

      <div>
        <label className={label}>Resume (PDF)</label>
        {resumeUrl && (
          <p className="mb-2">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent hover:underline">
              View current resume ↗
            </a>
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeFileChange}
            disabled={resumeUploading}
            className={input}
          />
          <input
            id="resumeUrl"
            name="resumeUrl"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="or paste a URL"
            className={input}
          />
        </div>
        {resumeUploading && <p className="mt-1 font-mono text-xs text-accent">Uploading…</p>}
        {resumeError && <p className="mt-1 font-mono text-xs text-red-500">{resumeError}</p>}
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
