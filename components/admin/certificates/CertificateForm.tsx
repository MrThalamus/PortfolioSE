"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Certificate } from "@prisma/client";
import { upsertCertificate, type CertificateFormState } from "@/app/admin/(dashboard)/certificates/actions";
import { label, input, primaryButton, secondaryButton } from "@/components/admin/styles";
import { ImageField } from "@/components/admin/ImageField";

const initialState: CertificateFormState = {};

function toDateInputValue(date?: Date) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function CertificateForm({
  certificate,
  onSaved,
  onCancel,
}: {
  certificate?: Certificate;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(upsertCertificate, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      onSaved?.();
      if (!certificate) formRef.current?.reset();
    }
    wasPending.current = pending;
  }, [pending, state.error, onSaved, certificate]);

  // Restore what was typed if the last submission failed — see lib/formState.ts.
  const v = state.values;
  const formKey = v ? JSON.stringify(v) : (certificate?.id ?? "new");

  return (
    <form key={formKey} ref={formRef} action={formAction} className="space-y-4 rounded-lg border border-border-default bg-background-elevated p-5">
      {certificate && <input type="hidden" name="id" value={certificate.id} />}

      <div>
        <label className={label} htmlFor="name">Certificate name</label>
        <input id="name" name="name" defaultValue={v?.name ?? certificate?.name} required className={input} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="issuingOrganization">Issuing organization</label>
          <input
            id="issuingOrganization"
            name="issuingOrganization"
            placeholder="e.g. Coursera, Microsoft Learn"
            defaultValue={v?.issuingOrganization ?? certificate?.issuingOrganization}
            required
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="dateEarned">Date earned</label>
          <input
            id="dateEarned"
            name="dateEarned"
            type="date"
            defaultValue={v?.dateEarned ?? toDateInputValue(certificate?.dateEarned)}
            required
            className={input}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="credentialUrl">Verification / credential URL (optional)</label>
          <input
            id="credentialUrl"
            name="credentialUrl"
            type="url"
            placeholder="https://…"
            defaultValue={v?.credentialUrl ?? certificate?.credentialUrl ?? ""}
            className={input}
          />
        </div>
        <div>
          <label className={label} htmlFor="order">Order</label>
          <input id="order" name="order" type="number" defaultValue={v?.order ?? certificate?.order ?? 0} className={input} />
        </div>
      </div>

      <ImageField
        label="Certificate image / badge (optional)"
        currentUrl={certificate?.imageUrl}
        urlFieldName="imageUrl"
        existingFieldName="existingImageUrl"
        removeFieldName="removeImage"
        defaultUrlValue={v?.imageUrl ?? ""}
        pathPrefix="certificates"
      />

      {state.error && <p className="font-mono text-sm text-red-500">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Saving…" : certificate ? "Save changes" : "Add certificate"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
