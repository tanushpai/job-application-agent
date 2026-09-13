"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signUpSchema, signInSchema } from "@/lib/auth/validation";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Server action to register a new user.
 * Validates input, hashes password with bcrypt, and stores in PostgreSQL via Prisma.
 */
export async function registerUser(
  rawInput: unknown
): Promise<ActionResponse<{ id: string; email: string; name: string | null }>> {
  try {
    const validationResult = signUpSchema.safeParse(rawInput);

    if (!validationResult.success) {
      const flattened = validationResult.error.flatten();
      return {
        success: false,
        error: "Please correct the highlighted fields.",
        fieldErrors: flattened.fieldErrors,
      };
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(password);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return {
      success: true,
      data: newUser,
    };
  } catch (error) {
    // Log internal error safely without exposing credentials
    console.error("User registration error:", error instanceof Error ? error.message : "Internal error");
    return {
      success: false,
      error: "Unable to create your account at this time. Please try again.",
    };
  }
}

/**
 * Server action to sign in with credentials.
 */
export async function authenticate(
  rawInput: unknown,
  callbackUrl?: string
): Promise<ActionResponse> {
  try {
    const validationResult = signInSchema.safeParse(rawInput);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Please provide a valid email and password.",
      };
    }

    const { email, password } = validationResult.data;

    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Invalid email or password. Please check your credentials.",
          };
        default:
          return {
            success: false,
            error: "Authentication failed. Please try again.",
          };
      }
    }

    // Rethrow redirect errors (Next.js redirection throws a NEXT_REDIRECT error internally)
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    // Check if error is next redirect object
    const digest = (error as { digest?: string })?.digest;
    if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
      throw error;
    }

    console.error("Sign-in server error:", error instanceof Error ? error.message : "Internal error");
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
