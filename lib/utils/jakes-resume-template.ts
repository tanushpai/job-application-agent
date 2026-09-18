import { TailoredResumePayload } from "@/lib/ai/gemini-tailor";

function escapeHtml(str: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Generates the authentic Jake's Resume (Overleaf / LaTeX standard) HTML template.
 */
export function generateJakesResumeHtml(payload: TailoredResumePayload): string {
  const p = payload.personalInfo;
  const contacts: string[] = [];

  if (p.phone) contacts.push(`<span>${escapeHtml(p.phone)}</span>`);
  if (p.email) contacts.push(`<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>`);
  if (p.linkedin) {
    const cleanUrl = p.linkedin.replace(/^https?:\/\/(www\.)?/, "");
    contacts.push(`<a href="${escapeHtml(p.linkedin)}" target="_blank">${escapeHtml(cleanUrl)}</a>`);
  }
  if (p.github) {
    const cleanUrl = p.github.replace(/^https?:\/\/(www\.)?/, "");
    contacts.push(`<a href="${escapeHtml(p.github)}" target="_blank">${escapeHtml(cleanUrl)}</a>`);
  }
  if (p.portfolio) {
    const cleanUrl = p.portfolio.replace(/^https?:\/\/(www\.)?/, "");
    contacts.push(`<a href="${escapeHtml(p.portfolio)}" target="_blank">${escapeHtml(cleanUrl)}</a>`);
  }

  const contactLine = contacts.join(` <span class="sep">|</span> `);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(p.fullName)} - Resume</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');
    
    @page {
      size: letter;
      margin: 0.45in 0.5in 0.45in 0.5in;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Merriweather', 'Times New Roman', Times, serif;
      color: #111111;
      background: #ffffff;
      font-size: 9.5pt;
      line-height: 1.35;
      -webkit-font-smoothing: antialiased;
    }
    
    .resume-container {
      width: 100%;
      max-width: 8.5in;
      margin: 0 auto;
    }
    
    /* Header (Centered, Overleaf standard) */
    .header {
      text-align: center;
      margin-bottom: 12px;
    }
    
    .header h1 {
      font-size: 19pt;
      font-weight: 700;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 4px;
      color: #000000;
    }
    
    .header .contact-line {
      font-size: 8.8pt;
      color: #222222;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 6px;
    }
    
    .header .contact-line a {
      color: #111111;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    
    .header .contact-line .sep {
      color: #666666;
      font-weight: 400;
    }
    
    /* Section Headings (Jake's Resume Overleaf standard with bottom line) */
    .section-title {
      font-size: 10.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      border-bottom: 1px solid #111111;
      padding-bottom: 1px;
      margin-top: 10px;
      margin-bottom: 6px;
      color: #000000;
    }
    
    /* Entry Blocks */
    .entry {
      margin-bottom: 6px;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9.5pt;
    }
    
    .entry-header .title-left {
      font-weight: 700;
      color: #000000;
    }
    
    .entry-header .date-right {
      font-weight: 700;
      font-size: 9pt;
      color: #222222;
      text-align: right;
    }
    
    .entry-sub {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9pt;
      margin-bottom: 2px;
    }
    
    .entry-sub .subtitle-left {
      font-style: italic;
      color: #222222;
    }
    
    .entry-sub .loc-right {
      font-style: italic;
      font-size: 8.8pt;
      color: #333333;
    }
    
    /* Bullet points */
    ul.bullets {
      margin: 2px 0 4px 16px;
      padding: 0;
      list-style-type: disc;
    }
    
    ul.bullets li {
      margin-bottom: 2px;
      font-size: 9.2pt;
      line-height: 1.32;
      text-align: justify;
      color: #1a1a1a;
    }
    
    ul.bullets li strong {
      font-weight: 700;
      color: #000000;
    }
    
    /* Technical Skills List */
    .skills-block {
      margin-top: 2px;
    }
    
    .skill-row {
      margin-bottom: 2.5px;
      font-size: 9.2pt;
      line-height: 1.35;
    }
    
    .skill-label {
      font-weight: 700;
      color: #000000;
    }
    
    .summary-text {
      font-size: 9.2pt;
      line-height: 1.35;
      text-align: justify;
      margin-bottom: 6px;
      color: #1a1a1a;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    
    <!-- HEADER -->
    <header class="header">
      <h1>${escapeHtml(p.fullName || "Candidate Name")}</h1>
      <div class="contact-line">
        ${contactLine}
      </div>
    </header>

    ${
      payload.summary
        ? `<!-- SUMMARY -->
    <div class="section-title">Summary</div>
    <div class="summary-text">${escapeHtml(payload.summary)}</div>`
        : ""
    }

    <!-- EDUCATION -->
    ${
      payload.educations && payload.educations.length > 0
        ? `
    <div class="section-title">Education</div>
    ${payload.educations
      .map(
        (ed) => `
    <div class="entry">
      <div class="entry-header">
        <span class="title-left">${escapeHtml(ed.institution)}</span>
        <span class="date-right">${escapeHtml(
          [ed.startDate, ed.endDate].filter(Boolean).join(" – ")
        )}</span>
      </div>
      <div class="entry-sub">
        <span class="subtitle-left">${escapeHtml(
          [ed.degree, ed.fieldOfStudy].filter(Boolean).join(" in ")
        )}${ed.grade ? ` (GPA: ${escapeHtml(ed.grade)})` : ""}</span>
        <span class="loc-right"></span>
      </div>
    </div>`
      )
      .join("")}
    `
        : ""
    }

    <!-- EXPERIENCE -->
    ${
      payload.experiences && payload.experiences.length > 0
        ? `
    <div class="section-title">Experience</div>
    ${payload.experiences
      .map(
        (exp) => `
    <div class="entry">
      <div class="entry-header">
        <span class="title-left">${escapeHtml(exp.title)}</span>
        <span class="date-right">${escapeHtml(
          [exp.startDate, exp.endDate].filter(Boolean).join(" – ")
        )}</span>
      </div>
      <div class="entry-sub">
        <span class="subtitle-left">${escapeHtml(exp.company)}</span>
        <span class="loc-right">${escapeHtml(exp.location || "")}</span>
      </div>
      ${
        exp.highlights && exp.highlights.length > 0
          ? `
      <ul class="bullets">
        ${exp.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
      </ul>`
          : ""
      }
    </div>`
      )
      .join("")}
    `
        : ""
    }

    <!-- PROJECTS -->
    ${
      payload.projects && payload.projects.length > 0
        ? `
    <div class="section-title">Projects</div>
    ${payload.projects
      .map(
        (proj) => `
    <div class="entry">
      <div class="entry-header">
        <span class="title-left">${escapeHtml(proj.title)}${
          proj.techStack && proj.techStack.length > 0
            ? ` <span style="font-weight: 400; font-style: italic; font-size: 8.8pt;">| ${escapeHtml(
                proj.techStack.join(", ")
              )}</span>`
            : ""
        }</span>
        <span class="date-right">${
          proj.link
            ? `<a href="${escapeHtml(
                proj.link
              )}" target="_blank" style="color: #111; text-decoration: underline; font-size: 8.8pt; font-weight: normal;">Live Demo</a>`
            : proj.githubUrl
            ? `<a href="${escapeHtml(
                proj.githubUrl
              )}" target="_blank" style="color: #111; text-decoration: underline; font-size: 8.8pt; font-weight: normal;">Code</a>`
            : ""
        }</span>
      </div>
      ${
        proj.highlights && proj.highlights.length > 0
          ? `
      <ul class="bullets">
        ${proj.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}
      </ul>`
          : ""
      }
    </div>`
      )
      .join("")}
    `
        : ""
    }

    <!-- TECHNICAL SKILLS -->
    ${
      payload.skillsCategorized
        ? `
    <div class="section-title">Technical Skills</div>
    <div class="skills-block">
      ${
        payload.skillsCategorized.languages &&
        payload.skillsCategorized.languages.length > 0
          ? `
      <div class="skill-row">
        <span class="skill-label">Languages:</span> ${escapeHtml(
          payload.skillsCategorized.languages.join(", ")
        )}
      </div>`
          : ""
      }
      ${
        payload.skillsCategorized.frameworksAndLibraries &&
        payload.skillsCategorized.frameworksAndLibraries.length > 0
          ? `
      <div class="skill-row">
        <span class="skill-label">Frameworks & Libraries:</span> ${escapeHtml(
          payload.skillsCategorized.frameworksAndLibraries.join(", ")
        )}
      </div>`
          : ""
      }
      ${
        payload.skillsCategorized.cloudAndDatabases &&
        payload.skillsCategorized.cloudAndDatabases.length > 0
          ? `
      <div class="skill-row">
        <span class="skill-label">Cloud & Databases:</span> ${escapeHtml(
          payload.skillsCategorized.cloudAndDatabases.join(", ")
        )}
      </div>`
          : ""
      }
      ${
        payload.skillsCategorized.developerTools &&
        payload.skillsCategorized.developerTools.length > 0
          ? `
      <div class="skill-row">
        <span class="skill-label">Developer Tools:</span> ${escapeHtml(
          payload.skillsCategorized.developerTools.join(", ")
        )}
      </div>`
          : ""
      }
    </div>
    `
        : ""
    }

    <!-- CERTIFICATIONS -->
    ${
      payload.certifications && payload.certifications.length > 0
        ? `
    <div class="section-title">Certifications</div>
    <ul class="bullets" style="margin-top: 4px;">
      ${payload.certifications
        .map(
          (c) =>
            `<li><strong>${escapeHtml(c.name)}</strong>${
              c.issuer ? ` – ${escapeHtml(c.issuer)}` : ""
            }${c.issueDate ? ` (${escapeHtml(c.issueDate)})` : ""}</li>`
        )
        .join("")}
    </ul>
    `
        : ""
    }

  </div>
</body>
</html>`;
}
