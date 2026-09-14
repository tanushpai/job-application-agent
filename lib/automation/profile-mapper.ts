import { GoogleGenerativeAI } from "@google/generative-ai";
import { DetectedFormField } from "./types";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ProfileData {
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  website?: string | null;
  linkedin?: string | null;
  github?: string | null;
  skills: Array<{ name: string; category?: string }>;
  experiences: Array<{
    company: string;
    title: string;
    location?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean;
    description?: string | null;
    highlights: string[];
  }>;
  educations: Array<{
    institution: string;
    degree?: string | null;
    fieldOfStudy?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  }>;
}

export interface MappingResult {
  mappedFields: Array<{
    field: DetectedFormField;
    value: string;
    isMissing: boolean;
  }>;
  missingRequiredFields: Array<{
    field: string;
    label: string;
    reason: string;
  }>;
  customQuestions: Array<{
    question: string;
    answer: string;
    confidence: number;
  }>;
}

export async function mapProfileToFields(
  fields: DetectedFormField[],
  profile: ProfileData
): Promise<MappingResult> {
  const mappedFields: MappingResult["mappedFields"] = [];
  const missingRequiredFields: MappingResult["missingRequiredFields"] = [];
  const customQuestions: MappingResult["customQuestions"] = [];

  // Determine first & last name from fullName if not set
  let firstName = profile.firstName;
  let lastName = profile.lastName;
  if (profile.fullName && (!firstName || !lastName)) {
    const parts = profile.fullName.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  for (const field of fields) {
    if (field.fieldType === "file" || field.detectedMeaning === "resume") {
      continue; // Handled separately by resume upload
    }

    let value = "";
    let mappedFieldKey = "";

    switch (field.detectedMeaning) {
      case "first_name":
        value = firstName || "";
        mappedFieldKey = "firstName";
        break;
      case "last_name":
        value = lastName || "";
        mappedFieldKey = "lastName";
        break;
      case "full_name":
        value = profile.fullName || `${firstName || ""} ${lastName || ""}`.trim();
        mappedFieldKey = "fullName";
        break;
      case "email":
        value = profile.email || "";
        mappedFieldKey = "email";
        break;
      case "phone":
        value = profile.phone || "";
        mappedFieldKey = "phone";
        break;
      case "linkedin":
        value = profile.linkedin || "";
        mappedFieldKey = "linkedin";
        break;
      case "github":
        value = profile.github || "";
        mappedFieldKey = "github";
        break;
      case "website":
        value = profile.website || "";
        mappedFieldKey = "website";
        break;
      case "location":
        value = profile.location || "";
        mappedFieldKey = "location";
        break;
      default:
        // Handle common custom questions or dropdown questions
        if (field.fieldType === "textarea" || field.fieldType === "text") {
          const aiAnswer = await answerCustomQuestionWithAI(field.label, profile);
          if (aiAnswer) {
            value = aiAnswer;
            customQuestions.push({
              question: field.label,
              answer: aiAnswer,
              confidence: 0.85,
            });
          }
        }
        break;
    }

    const isMissing = field.isRequired && !value.trim();

    if (isMissing) {
      missingRequiredFields.push({
        field: mappedFieldKey || field.label,
        label: field.label,
        reason: `Required field "${field.label}" is missing in your profile.`,
      });
    }

    mappedFields.push({
      field: {
        ...field,
        mappedProfileField: mappedFieldKey || undefined,
        currentValue: value,
      },
      value,
      isMissing,
    });
  }

  return {
    mappedFields,
    missingRequiredFields,
    customQuestions,
  };
}

/**
 * Uses Gemini AI to concisely answer application open questions strictly grounded in user's profile.
 */
async function answerCustomQuestionWithAI(
  question: string,
  profile: ProfileData
): Promise<string | null> {
  const lower = question.toLowerCase();

  // Rule-based instant answers
  if (lower.includes("authorized to work") || lower.includes("legally authorized") || lower.includes("work authorization")) {
    return "Yes";
  }
  if (lower.includes("require sponsorship") || lower.includes("visa sponsorship")) {
    return "No";
  }

  if (!genAI) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an AI Job Application Assistant answering a job application question for a candidate.
Candidate Profile:
- Name: ${profile.fullName || ""}
- Headline: ${profile.headline || ""}
- Summary: ${profile.summary || ""}
- Skills: ${profile.skills.map(s => s.name).join(", ")}
- Recent Experience: ${profile.experiences.slice(0, 2).map(e => `${e.title} at ${e.company}: ${e.description || ""}`).join("\n")}

Job Application Question: "${question}"

INSTRUCTIONS:
1. Provide a professional, concise 2-4 sentence answer.
2. Only reference skills and experience that strictly exist in the candidate profile above.
3. NEVER fabricate dates, previous employers, degrees, or certifications.
4. If the question cannot be answered from the profile, respond with "UNABLE_TO_ANSWER".`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    if (text === "UNABLE_TO_ANSWER" || text.includes("UNABLE_TO_ANSWER")) {
      return null;
    }
    return text;
  } catch (err) {
    console.warn("[ProfileMapper] AI question generation failed:", err);
    return null;
  }
}
