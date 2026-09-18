"use client";

import React from "react";
import { TailoredResumePayload } from "@/lib/ai/gemini-tailor";
import { Download, Printer, Copy, Check, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JakesResumePreviewProps {
  resume: TailoredResumePayload;
  onSaveToLibrary?: () => void;
  isSaving?: boolean;
  savedFileUrl?: string | null;
}

export function JakesResumePreview({
  resume,
  onSaveToLibrary,
  isSaving,
  savedFileUrl,
}: JakesResumePreviewProps) {
  const [copied, setCopied] = React.useState(false);

  const p = resume.personalInfo || {
    fullName: "Candidate Full Name",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# ${p.fullName}
${[p.phone, p.email, p.linkedin, p.github, p.portfolio].filter(Boolean).join(" | ")}

## Summary
${resume.summary || ""}

## Education
${(resume.educations || [])
  .map(
    (ed) =>
      `**${ed.institution}** - ${[ed.startDate, ed.endDate].filter(Boolean).join(" to ")}\n*${[
        ed.degree,
        ed.fieldOfStudy,
      ]
        .filter(Boolean)
        .join(" in ")}*`
  )
  .join("\n\n")}

## Experience
${(resume.experiences || [])
  .map(
    (exp) =>
      `**${exp.title}** | ${exp.company} (${[exp.startDate, exp.endDate]
        .filter(Boolean)
        .join(" - ")})\n${(exp.highlights || []).map((h) => `- ${h}`).join("\n")}`
  )
  .join("\n\n")}

## Projects
${(resume.projects || [])
  .map(
    (proj) =>
      `**${proj.title}** ${proj.techStack?.length ? `| *${proj.techStack.join(", ")}*` : ""}\n${(
        proj.highlights || []
      )
        .map((h) => `- ${h}`)
        .join("\n")}`
  )
  .join("\n\n")}

## Technical Skills
- **Languages:** ${resume.skillsCategorized?.languages?.join(", ") || ""}
- **Frameworks & Libraries:** ${resume.skillsCategorized?.frameworksAndLibraries?.join(", ") || ""}
- **Cloud & Databases:** ${resume.skillsCategorized?.cloudAndDatabases?.join(", ") || ""}
- **Developer Tools:** ${resume.skillsCategorized?.developerTools?.join(", ") || ""}
`;
    navigator.clipboard.writeText(md.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border/80 shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Sparkles className="size-3.5" />
            <span>Jake&apos;s Resume (Overleaf ATS Standard)</span>
          </span>
          {resume.atsScore && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {resume.atsScore}% ATS Match
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="rounded-xl text-xs font-medium cursor-pointer"
          >
            {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copied ? "Copied MD" : "Copy Markdown"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl text-xs font-medium cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span>Print</span>
          </Button>

          {savedFileUrl ? (
            <a
              href={savedFileUrl}
              download={`${(resume.title || "Resume").replace(/\s+/g, "_")}.pdf`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </a>
          ) : (
            onSaveToLibrary && (
              <Button
                type="button"
                size="sm"
                onClick={onSaveToLibrary}
                disabled={isSaving}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Sparkles className="size-3.5 animate-spin" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-3.5" />
                    <span>Save &amp; Compile PDF</span>
                  </>
                )}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Jake's Resume Standard Printable Paper */}
      <div className="overflow-x-auto pb-4">
        <div
          id="jakes-resume-paper"
          className="mx-auto w-[800px] min-h-[1032px] bg-white text-zinc-900 p-8 sm:p-10 shadow-xl border border-zinc-200 rounded-sm font-serif leading-tight print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:bg-white select-text"
          style={{
            fontFamily:
              "'Merriweather', 'Times New Roman', Cambria, Georgia, serif",
          }}
        >
          {/* HEADER */}
          <header className="text-center mb-3.5 border-b-0 pb-0">
            <h1 className="text-[22px] font-bold tracking-wider uppercase text-black mb-1.5 font-serif">
              {p.fullName || "Your Full Name"}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-x-2 text-[11px] text-zinc-700">
              {p.phone && <span>{p.phone}</span>}
              {p.phone && p.email && <span className="text-zinc-400">|</span>}
              {p.email && (
                <a href={`mailto:${p.email}`} className="text-zinc-900 hover:underline">
                  {p.email}
                </a>
              )}
              {p.linkedin && (
                <>
                  <span className="text-zinc-400">|</span>
                  <a
                    href={p.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-900 hover:underline"
                  >
                    {p.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </>
              )}
              {p.github && (
                <>
                  <span className="text-zinc-400">|</span>
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-900 hover:underline"
                  >
                    {p.github.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </>
              )}
              {p.portfolio && (
                <>
                  <span className="text-zinc-400">|</span>
                  <a
                    href={p.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-900 hover:underline"
                  >
                    {p.portfolio.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </>
              )}
            </div>
          </header>

          {/* SUMMARY (if available) */}
          {resume.summary && (
            <section className="mb-2.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Summary
              </h2>
              <p className="text-[11.5px] leading-relaxed text-zinc-800 text-justify">
                {resume.summary}
              </p>
            </section>
          )}

          {/* EDUCATION */}
          {resume.educations && resume.educations.length > 0 && (
            <section className="mb-2.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Education
              </h2>
              <div className="space-y-1.5">
                {resume.educations.map((ed, idx) => (
                  <div key={idx} className="text-[11.5px]">
                    <div className="flex justify-between items-baseline font-bold text-black">
                      <span>{ed.institution}</span>
                      <span className="font-normal text-zinc-700 text-[11px]">
                        {[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-zinc-800 italic">
                      <span>
                        {[ed.degree, ed.fieldOfStudy].filter(Boolean).join(" in ")}
                        {ed.grade ? ` (GPA: ${ed.grade})` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* EXPERIENCE */}
          {resume.experiences && resume.experiences.length > 0 && (
            <section className="mb-2.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Experience
              </h2>
              <div className="space-y-2.5">
                {resume.experiences.map((exp, idx) => (
                  <div key={idx} className="text-[11.5px]">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-black">{exp.title}</span>
                      <span className="font-bold text-zinc-800 text-[11px]">
                        {[exp.startDate, exp.endDate].filter(Boolean).join(" – ")}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-zinc-800 italic mb-0.5">
                      <span>{exp.company}</span>
                      <span className="text-[10.5px] not-italic text-zinc-600">{exp.location}</span>
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-zinc-800 text-[11px] leading-snug text-justify">
                        {exp.highlights.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROJECTS */}
          {resume.projects && resume.projects.length > 0 && (
            <section className="mb-2.5">
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Projects
              </h2>
              <div className="space-y-2">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="text-[11.5px]">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-black">{proj.title}</span>
                        {proj.techStack && proj.techStack.length > 0 && (
                          <span className="text-zinc-600 font-normal italic text-[10.5px] ml-1.5">
                            | {proj.techStack.join(", ")}
                          </span>
                        )}
                      </div>
                      <div className="text-[10.5px] text-zinc-600 space-x-2">
                        {proj.link && (
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-black"
                          >
                            Live Demo
                          </a>
                        )}
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-black"
                          >
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc ml-4 space-y-0.5 text-zinc-800 text-[11px] leading-snug text-justify mt-0.5">
                        {proj.highlights.map((bullet, bIdx) => (
                          <li key={bIdx}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TECHNICAL SKILLS */}
          {resume.skillsCategorized && (
            <section className="mb-2">
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Technical Skills
              </h2>
              <div className="text-[11.5px] space-y-1 text-zinc-800 leading-snug">
                {resume.skillsCategorized.languages &&
                  resume.skillsCategorized.languages.length > 0 && (
                    <div>
                      <span className="font-bold text-black">Languages: </span>
                      <span>{resume.skillsCategorized.languages.join(", ")}</span>
                    </div>
                  )}
                {resume.skillsCategorized.frameworksAndLibraries &&
                  resume.skillsCategorized.frameworksAndLibraries.length > 0 && (
                    <div>
                      <span className="font-bold text-black">Frameworks &amp; Libraries: </span>
                      <span>
                        {resume.skillsCategorized.frameworksAndLibraries.join(", ")}
                      </span>
                    </div>
                  )}
                {resume.skillsCategorized.cloudAndDatabases &&
                  resume.skillsCategorized.cloudAndDatabases.length > 0 && (
                    <div>
                      <span className="font-bold text-black">Cloud &amp; Databases: </span>
                      <span>{resume.skillsCategorized.cloudAndDatabases.join(", ")}</span>
                    </div>
                  )}
                {resume.skillsCategorized.developerTools &&
                  resume.skillsCategorized.developerTools.length > 0 && (
                    <div>
                      <span className="font-bold text-black">Developer Tools: </span>
                      <span>{resume.skillsCategorized.developerTools.join(", ")}</span>
                    </div>
                  )}
              </div>
            </section>
          )}

          {/* CERTIFICATIONS */}
          {resume.certifications && resume.certifications.length > 0 && (
            <section>
              <h2 className="text-[12px] font-bold uppercase tracking-wide border-b border-zinc-900 pb-0.5 mb-1.5 text-black">
                Certifications
              </h2>
              <ul className="list-disc ml-4 space-y-0.5 text-[11px] text-zinc-800 leading-snug">
                {resume.certifications.map((c, idx) => (
                  <li key={idx}>
                    <strong className="text-black">{c.name}</strong>
                    {c.issuer ? ` – ${c.issuer}` : ""}
                    {c.issueDate ? ` (${c.issueDate})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
