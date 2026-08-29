"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Certificate } from "@prisma/client";
import { CertificateForm } from "./CertificateForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCertificate } from "@/app/admin/(dashboard)/certificates/actions";
import { primaryButton, secondaryButton } from "@/components/admin/styles";

export function CertificateManager({ certificates }: { certificates: Certificate[] }) {
  const router = useRouter();
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleSaved(close: () => void) {
    close();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {showNewForm ? (
        <CertificateForm onSaved={() => handleSaved(() => setShowNewForm(false))} onCancel={() => setShowNewForm(false)} />
      ) : (
        <button type="button" onClick={() => setShowNewForm(true)} className={primaryButton}>
          + Add certificate
        </button>
      )}

      <div className="space-y-3">
        {certificates.map((certificate) =>
          editingId === certificate.id ? (
            <CertificateForm
              key={certificate.id}
              certificate={certificate}
              onSaved={() => handleSaved(() => setEditingId(null))}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={certificate.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-background-elevated p-4"
            >
              <div>
                <p className="font-medium">{certificate.name}</p>
                <p className="font-mono text-xs text-foreground-muted">
                  {certificate.issuingOrganization} ·{" "}
                  {certificate.dateEarned.toLocaleDateString("en-US", { year: "numeric", month: "short" })} · order{" "}
                  {certificate.order}
                  {certificate.credentialUrl && " · verifiable"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(certificate.id)}
                  className={secondaryButton + " !py-1"}
                >
                  Edit
                </button>
                <DeleteButton
                  action={deleteCertificate.bind(null, certificate.id)}
                  itemLabel={certificate.name}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </div>
          )
        )}
        {certificates.length === 0 && (
          <p className="font-mono text-sm text-foreground-muted">No certificates added yet.</p>
        )}
      </div>
    </div>
  );
}
