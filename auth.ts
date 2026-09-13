import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { signInSchema } from "@/lib/auth/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const passwordsMatch = await verifyPassword(
            password,
            user.passwordHash
          );

          if (!passwordsMatch) {
            return null;
          }

          // Return sanitized user object - never return password or hash
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          // Log internally without exposing credentials, return safe null
          console.error("Authorization check failed safely:", error instanceof Error ? error.message : "Internal error");
          return null;
        }
      },
    }),
  ],
});

/**
 * Retrieves the current authenticated session user, or null if unauthenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Requires authentication for protected Server Components and Server Actions.
 * Throws an error if unauthenticated.
 */
export async function requireAuth() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    throw new Error("Unauthorized: Please sign in to continue.");
  }

  // 1. Try finding user by session ID
  let dbUser = sessionUser.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
      })
    : null;

  // 2. Fallback: If DB was reset/re-seeded, match by email to keep session working
  if (!dbUser && sessionUser.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: sessionUser.email },
    });
  }

  if (!dbUser) {
    throw new Error("Unauthorized: User account no longer exists. Please sign out and sign in again.");
  }

  return dbUser;
}
