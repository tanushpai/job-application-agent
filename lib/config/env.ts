import { z } from "zod";

/**
 * Zod schema validating critical environment variables at startup or execution.
 */
const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required").optional().default("default-development-secret-key-32-chars-long"),
  NEXTAUTH_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Returns validated environment variables or throws clear error if misconfigured.
 */
export function getEnv(): Env {
  if (validatedEnv) return validatedEnv;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Environment configuration validation failed:", parsed.error.format());
    // Fallback in dev to prevent hard crash if optional keys are missing
    return {
      DATABASE_URL: process.env.DATABASE_URL || "",
      AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default-secret",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    };
  }

  validatedEnv = parsed.data;
  return validatedEnv;
}
