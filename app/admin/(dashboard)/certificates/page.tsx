import { prisma } from "@/lib/prisma";
import { CertificateManager } from "@/components/admin/certificates/CertificateManager";

export default async function AdminCertificatesPage() {
  const certificates = await prisma.certificate.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Certificates</h1>
      <p className="mb-6 font-mono text-sm text-foreground-muted">
        Certifications and credentials, with optional verification links.
      </p>
      <CertificateManager certificates={certificates} />
    </div>
  );
}
