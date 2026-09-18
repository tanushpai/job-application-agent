import { GoogleGenerativeAI } from "@google/generative-ai";

export interface TailoredResumePayload {
  title: string;
  targetRole: string;
  targetCompany: string;
  preset: "ats_optimized" | "metric_heavy" | "technical_depth" | "executive";
  atsScore: number;
  scoreBreakdown: {
    keywordMatch: number;
    experienceRelevance: number;
    skillsAlignment: number;
    formattingReadiness: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];

  // Jake's Resume Standard Content
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
  };
  summary: string;
  skillsCategorized: {
    languages: string[];
    frameworksAndLibraries: string[];
    developerTools: string[];
    cloudAndDatabases: string[];
  };
  experiences: Array<{
    company: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    highlights: string[];
  }>;
  projects: Array<{
    title: string;
    role?: string;
    techStack: string[];
    link?: string;
    githubUrl?: string;
    highlights: string[];
  }>;
  educations: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    grade?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    url?: string;
  }>;
}

export interface UserProfileContext {
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
  skills: Array<{ name: string; category?: string }>;
  experiences: Array<{
    company: string;
    title: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    highlights?: string[];
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
    id?: string;
    title: string;
    role?: string;
    description?: string;
    highlights?: string[];
    techStack?: string[];
    link?: string;
    githubUrl?: string;
    challenges?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    issueDate?: string;
    url?: string;
  }>;
}

/**
 * Tailors a complete resume matching the target Job Description using Google Gemini AI,
 * formatting strictly to Jake's Resume (Overleaf/LaTeX standard ATS template).
 */
export async function tailorResumeWithGemini({
  profile,
  jobDescription,
  targetRole,
  targetCompany,
  preset = "ats_optimized",
  selectedProjectIds,
}: {
  profile: UserProfileContext;
  jobDescription: string;
  targetRole?: string;
  targetCompany?: string;
  preset?: "ats_optimized" | "metric_heavy" | "technical_depth" | "executive";
  selectedProjectIds?: string[];
}): Promise<TailoredResumePayload> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-1.5-flash for high structured JSON accuracy
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.15,
    },
  });

  // Filter projects if specific ones were picked
  const candidateProjects =
    selectedProjectIds && selectedProjectIds.length > 0
      ? profile.projects.filter((p) => p.id && selectedProjectIds.includes(p.id))
      : profile.projects;

  const presetInstructions = {
    ats_optimized: `
- Prioritize exact keyword matching with the Job Description throughout skills and experience bullets.
- Ensure all ATS parsable acronyms and technical terms in the JD are seamlessly woven into real accomplishments.
- Keep bullets concise, high-signal, and standard ATS friendly.`,
    metric_heavy: `
- Maximize quantifiable business impact and metrics using the Google XYZ Formula ("Accomplished [X], as measured by [Y], by doing [Z]").
- Highlight latency improvements, revenue growth, users served, percentage efficiency gains, and scale.`,
    technical_depth: `
- Emphasize deep architectural decisions, system design patterns, concurrency, algorithms, internal tooling, and low-level engineering nuances.
- Explicitly mention protocols, data pipelines, caching layers, and database optimizations.`,
    executive: `
- Focus on high-level business leadership, strategic ownership, cross-functional execution, project velocity, and end-to-end deliverables.
- Keep bullets crisp and executive-ready.`,
  }[preset];

  const prompt = `
You are the world's leading technical recruiter and ATS resume optimization expert.
Your job is to tailor the candidate's master profile into a world-class, 100% ATS-compliant resume strictly formatted for "Jake's Resume" (the Overleaf/LaTeX gold standard tech resume).

Target Role: ${targetRole || "Software Engineer"}
Target Company: ${targetCompany || "Target Employer"}
Tailoring Strategy: ${preset}

STRATEGY INSTRUCTIONS:
${presetInstructions}

CANDIDATE MASTER PROFILE:
${JSON.stringify({
  ...profile,
  projects: candidateProjects,
}, null, 2)}

TARGET JOB DESCRIPTION:
"""
${jobDescription.slice(0, 12000)}
"""

REQUIREMENTS:
1. ATS Scoring:
   - Calculate realistic ATS Match Score (0-100) based on candidate alignment with the job description.
   - List "matchedSkills" (skills the candidate has that match the JD).
   - List "missingSkills" (skills mentioned in the JD that the candidate could develop or add).
   - Provide 2-4 actionable recommendations.

2. Jake's Resume Standard Formatting Rules:
   - Summary: 2-3 lines crisp summary tailored to the target role.
   - Skills Categorized into 4 strict buckets:
     * "languages": e.g., ["TypeScript", "Python", "Go", "JavaScript", "SQL"]
     * "frameworksAndLibraries": e.g., ["React", "Next.js", "Node.js", "Express", "TailwindCSS", "PostgreSQL"]
     * "developerTools": e.g., ["Git", "Docker", "Playwright", "GitHub Actions", "Vercel", "VS Code"]
     * "cloudAndDatabases": e.g., ["AWS (S3, Lambda)", "PostgreSQL", "Redis", "Supabase", "MongoDB"]
   - Experience Bullets:
     * 3-4 punchy, high-impact bullet points per experience.
     * Begin each bullet with a strong past-tense action verb (Architected, Engineered, Optimized, Spearheaded, Implemented).
     * Align experience bullets with keywords and challenges highlighted in the Job Description without fabricating false histories.
   - Projects:
     * Include 2-3 of the most relevant projects.
     * Include techStack array for each project.
     * Include 2-3 bullet points for each project detailing the technical architecture and impact.
   - Education & Certifications:
     * Preserve authentic institution, degree, field of study, and dates.

JSON OUTPUT SCHEMA:
{
  "title": "${targetRole ? `${targetRole} - ${targetCompany || "Tailored"}` : "AI Tailored Resume"}",
  "targetRole": "${targetRole || ""}",
  "targetCompany": "${targetCompany || ""}",
  "preset": "${preset}",
  "atsScore": 88,
  "scoreBreakdown": {
    "keywordMatch": 90,
    "experienceRelevance": 85,
    "skillsAlignment": 92,
    "formattingReadiness": 98
  },
  "matchedSkills": ["TypeScript", "Next.js", "PostgreSQL"],
  "missingSkills": ["GraphQL", "Kubernetes"],
  "recommendations": ["Highlight any distributed system exposure in your project highlights."],
  "personalInfo": {
    "fullName": "Candidate Full Name",
    "email": "email@example.com",
    "phone": "+1 (555) 000-0000",
    "location": "San Francisco, CA",
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/...",
    "portfolio": "https://portfolio.dev"
  },
  "summary": "...",
  "skillsCategorized": {
    "languages": ["..."],
    "frameworksAndLibraries": ["..."],
    "developerTools": ["..."],
    "cloudAndDatabases": ["..."]
  },
  "experiences": [
    {
      "company": "Company Name",
      "title": "Role Title",
      "location": "City, State",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY / Present",
      "highlights": [
        "Architected and deployed...",
        "Optimized database query performance by 45% using..."
      ]
    }
  ],
  "projects": [
    {
      "title": "Project Name",
      "role": "Lead Architect",
      "techStack": ["Next.js", "TypeScript", "PostgreSQL"],
      "link": "https://demo.com",
      "githubUrl": "https://github.com/...",
      "highlights": [
        "Built high-throughput data processing pipeline handling 10k requests/sec...",
        "Implemented real-time synchronization with WebSockets and Redis..."
      ]
    }
  ],
  "educations": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2018",
      "endDate": "2022",
      "grade": ""
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "issueDate": "2023",
      "url": ""
    }
  ]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed: TailoredResumePayload = JSON.parse(text);

    // Fallbacks if some fields are missing
    if (!parsed.personalInfo.fullName && profile.fullName) {
      parsed.personalInfo.fullName = profile.fullName;
    }
    if (!parsed.personalInfo.email && profile.email) {
      parsed.personalInfo.email = profile.email;
    }

    return parsed;
  } catch (err) {
    console.error("Gemini resume tailoring error:", err);
    throw new Error(
      err instanceof Error
        ? `AI Resume Tailoring failed: ${err.message}`
        : "Failed to generate tailored resume with Gemini AI."
    );
  }
}

/**
 * Enhances raw project context into polished, metric-driven highlights for the user's project hub.
 */
export async function enhanceProjectWithGemini({
  title,
  role,
  techStack = [],
  rawDescription,
  challenges,
}: {
  title: string;
  role?: string;
  techStack?: string[];
  rawDescription: string;
  challenges?: string;
}): Promise<{
  enhancedRole: string;
  enhancedDescription: string;
  highlights: string[];
  suggestedTechStack: string[];
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const prompt = `
You are an expert technical resume writer. Polish the developer's project description into crisp, quantified, high-impact bullet points and a concise architecture summary following Google's XYZ formula.

Project Title: ${title}
Role / Title: ${role || "Software Engineer / Creator"}
Tech Stack: ${techStack.join(", ")}
Developer Raw Notes / Description:
"""
${rawDescription}
"""
Key Challenges / Architecture Notes:
"""
${challenges || "None provided"}
"""

Return strictly valid JSON:
{
  "enhancedRole": "e.g. Lead Full-Stack Architect",
  "enhancedDescription": "1-2 sentence crisp architectural overview of what was built and why.",
  "highlights": [
    "Engineered scalable microservices architecture using [Tech], reducing API response latency by 35% across 50K+ daily active users.",
    "Integrated real-time caching layer with Redis and PostgreSQL, mitigating database contention during peak traffic spikes.",
    "Implemented automated CI/CD deployment pipelines with GitHub Actions, accelerating release cycles from bi-weekly to daily."
  ],
  "suggestedTechStack": ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Redis"]
}
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.error("Gemini project enhance error:", err);
    throw new Error("Failed to enhance project notes with Gemini AI.");
  }
}
