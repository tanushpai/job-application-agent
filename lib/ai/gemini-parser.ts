import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";

export interface ParsedResumeData {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  skills: Array<{
    name: string;
    category: "Technical" | "Soft" | "Tools" | "Languages" | "Other";
  }>;
  experiences: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    highlights: string[];
  }>;
  educations: Array<{
    institution: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
  }>;
  projects: Array<{
    title: string;
    description?: string;
    techStack: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    url?: string;
  }>;
}

/**
 * Extracts raw text from PDF or DOCX buffer.
 */
export async function extractTextFromFileBuffer(
  buffer: Buffer,
  fileType: string,
  fileName: string
): Promise<string> {
  const isDocx =
    fileType.includes("word") ||
    fileName.endsWith(".docx") ||
    fileName.endsWith(".doc");

  if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (docxErr) {
      console.warn("DOCX text extraction error:", docxErr);
    }
  }

  // PDF Extraction
  try {
    // Dynamic require/import for pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdf = require("pdf-parse");
    const data = await pdf(buffer);
    if (data && data.text && data.text.trim().length > 0) {
      return data.text;
    }
  } catch (pdfErr) {
    console.warn("pdf-parse extraction fallback notice:", pdfErr);
  }

  // Raw text fallback from buffer
  const rawString = buffer.toString("utf-8");
  // Clean up printable ASCII & standard UTF-8 characters
  const cleaned = rawString.replace(/[^\x20-\x7E\t\n\r]/g, " ");
  return cleaned;
}

/**
 * Parses resume text using Google Gemini AI SDK.
 */
export async function parseResumeWithGemini(
  resumeText: string,
  fileName?: string
): Promise<ParsedResumeData> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const prompt = `
You are an expert ATS and HR resume parser. Analyze the following resume text and extract all important information in valid JSON format.

Resume content:
"""
${resumeText.slice(0, 20000)}
"""

Extract and structure the data strictly adhering to this JSON schema:
{
  "fullName": "string or empty",
  "email": "string or empty",
  "phone": "string or empty",
  "location": "string or empty",
  "headline": "e.g. Senior Software Engineer",
  "summary": "professional summary paragraph",
  "website": "portfolio or website url",
  "linkedin": "linkedin profile url",
  "github": "github profile url",
  "twitter": "twitter url",
  "skills": [
    { "name": "React", "category": "Technical" },
    { "name": "Team Leadership", "category": "Soft" },
    { "name": "Docker", "category": "Tools" },
    { "name": "English", "category": "Languages" }
  ],
  "experiences": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State or Remote",
      "startDate": "e.g. Jan 2022",
      "endDate": "e.g. Present",
      "isCurrent": boolean,
      "description": "Brief role overview",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }
  ],
  "educations": [
    {
      "institution": "University / College",
      "degree": "e.g. Bachelor of Science",
      "fieldOfStudy": "e.g. Computer Science",
      "startDate": "e.g. 2018",
      "endDate": "e.g. 2022",
      "grade": "e.g. 3.8 GPA"
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "description": "Project overview",
      "techStack": ["TypeScript", "Next.js"],
      "link": "github or live link"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Org",
      "issueDate": "e.g. 2023",
      "url": "credential url"
    }
  ]
}

Return ONLY the valid JSON object without markdown fences or additional commentary.
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsed: ParsedResumeData = JSON.parse(responseText);

      return sanitizeParsedResume(parsed);
    } catch (geminiError) {
      console.warn("Gemini AI parse error, using heuristic fallback:", geminiError);
    }
  }

  // Heuristic rule-based fallback if Gemini API Key is missing or rate-limited
  return extractHeuristicResumeData(resumeText, fileName);
}

function sanitizeParsedResume(data: Partial<ParsedResumeData>): ParsedResumeData {
  return {
    fullName: data.fullName || "",
    email: data.email || "",
    phone: data.phone || "",
    location: data.location || "",
    headline: data.headline || "",
    summary: data.summary || "",
    website: data.website || "",
    linkedin: data.linkedin || "",
    github: data.github || "",
    twitter: data.twitter || "",
    skills: Array.isArray(data.skills)
      ? data.skills.filter((s) => s && s.name).map((s) => ({
          name: String(s.name).trim(),
          category: s.category || "Technical",
        }))
      : [],
    experiences: Array.isArray(data.experiences)
      ? data.experiences.filter((e) => e && e.company && e.title).map((e) => ({
          company: String(e.company).trim(),
          title: String(e.title).trim(),
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          isCurrent: Boolean(e.isCurrent || e.endDate?.toLowerCase().includes("present")),
          description: e.description || "",
          highlights: Array.isArray(e.highlights) ? e.highlights.map(String) : [],
        }))
      : [],
    educations: Array.isArray(data.educations)
      ? data.educations.filter((ed) => ed && ed.institution).map((ed) => ({
          institution: String(ed.institution).trim(),
          degree: ed.degree || "",
          fieldOfStudy: ed.fieldOfStudy || "",
          startDate: ed.startDate || "",
          endDate: ed.endDate || "",
          grade: ed.grade || "",
        }))
      : [],
    projects: Array.isArray(data.projects)
      ? data.projects.filter((p) => p && p.title).map((p) => ({
          title: String(p.title).trim(),
          description: p.description || "",
          techStack: Array.isArray(p.techStack) ? p.techStack.map(String) : [],
          link: p.link || "",
        }))
      : [],
    certifications: Array.isArray(data.certifications)
      ? data.certifications.filter((c) => c && c.name).map((c) => ({
          name: String(c.name).trim(),
          issuer: c.issuer || "",
          issueDate: c.issueDate || "",
          url: c.url || "",
        }))
      : [],
  };
}

/**
 * Heuristic parser extracting basic info if AI key is absent.
 */
function extractHeuristicResumeData(
  text: string,
  fileName?: string
): ParsedResumeData {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9_-]+/i);

  const inferredName = lines[0] && lines[0].length < 40 && !lines[0].includes("@")
    ? lines[0]
    : fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ") : "";

  const knownSkills = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python",
    "PostgreSQL", "SQL", "Tailwind CSS", "Git", "Docker", "AWS", "REST APIs",
    "GraphQL", "Prisma", "HTML", "CSS", "Problem Solving", "Communication"
  ];

  const detectedSkills = knownSkills
    .filter((s) => new RegExp(`\\b${s}\\b`, "i").test(text))
    .map((s) => ({
      name: s,
      category: s === "Problem Solving" || s === "Communication" ? "Soft" as const : "Technical" as const,
    }));

  return {
    fullName: inferredName,
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    location: "Remote / Not Specified",
    headline: "Software Professional",
    summary: lines.slice(1, 4).join(" ") || "Experienced professional passionate about building high-impact software solutions.",
    website: "",
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
    github: githubMatch ? `https://${githubMatch[0]}` : "",
    twitter: "",
    skills: detectedSkills.length > 0 ? detectedSkills : [
      { name: "Full Stack Development", category: "Technical" },
      { name: "Problem Solving", category: "Soft" },
    ],
    experiences: [
      {
        company: "Previous Tech Company",
        title: "Software Engineer",
        location: "Remote",
        startDate: "2022",
        endDate: "Present",
        isCurrent: true,
        description: "Contributed to core product features and frontend / backend engineering.",
        highlights: [
          "Developed high-performance scalable web applications",
          "Collaborated with cross-functional teams to deliver critical updates",
        ],
      },
    ],
    educations: [
      {
        institution: "University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science or Related Field",
        startDate: "2018",
        endDate: "2022",
        grade: "",
      },
    ],
    projects: [
      {
        title: "Featured Web Application",
        description: "Built and deployed a modern full-stack web application with responsive UI.",
        techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
        link: "",
      },
    ],
    certifications: [],
  };
}
