import { z } from "zod";

export const emailSchema = z
  .string({ message: "Email is required" })
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((val) => val.trim().toLowerCase());

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password must be under 100 characters")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one special character");

export const signInSchema = z.object({
  email: emailSchema,
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export const signUpSchema = z
  .object({
    name: z
      .string({ message: "Full name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters long")
      .max(60, "Name must be under 60 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string({ message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
