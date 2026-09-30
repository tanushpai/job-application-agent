import React from "react";
import { Award, Plus, Trash2 } from "lucide-react";
import { CertificationItem } from "@/types/profile";

interface CertificationsTabProps {
  certifications: CertificationItem[];
  setCertifications: React.Dispatch<React.SetStateAction<CertificationItem[]>>;
}

export function CertificationsTab({
  certifications,
  setCertifications,
}: CertificationsTabProps) {
  const addCertification = () => {
    setCertifications([
      ...certifications,
      {
        name: "",
        issuer: "",
        issueDate: "",
        url: "",
      },
    ]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateCertification = (
    index: number,
    field: keyof CertificationItem,
    value: string
  ) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Award className="size-4 text-primary" />
            Certifications &amp; Licenses
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Add recognized certifications (e.g. AWS Solutions Architect, CKA, Google Cloud).
          </p>
        </div>
        <button
          type="button"
          onClick={addCertification}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="size-3.5" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center">
          <Award className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium text-foreground">No certifications added</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Optional: Add relevant cloud or professional certifications.
          </p>
          <button
            type="button"
            onClick={addCertification}
            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Certification
          </button>
        </div>
      ) : (
        certifications.map((cert, certIdx) => (
          <div
            key={certIdx}
            className="bg-card border border-border rounded-xl p-6 shadow-sm relative group"
          >
            <button
              type="button"
              onClick={() => removeCertification(certIdx)}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            >
              <Trash2 className="size-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-8">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(certIdx, "name", e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect - Associate"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={cert.issuer || ""}
                  onChange={(e) => updateCertification(certIdx, "issuer", e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Issue Date
                </label>
                <input
                  type="text"
                  value={cert.issueDate || ""}
                  onChange={(e) => updateCertification(certIdx, "issueDate", e.target.value)}
                  placeholder="e.g. Nov 2023"
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Credential URL / ID
                </label>
                <input
                  type="url"
                  value={cert.url || ""}
                  onChange={(e) => updateCertification(certIdx, "url", e.target.value)}
                  placeholder="https://credly.com/..."
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
