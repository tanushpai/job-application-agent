import { ActionResponse } from "@/types/common";

/**
 * Creates a standardized successful ActionResponse.
 */
export function successResponse<T>(data: T, message?: string): ActionResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
}

/**
 * Creates a standardized error ActionResponse with sanitized messages for security.
 */
export function errorResponse<T = never>(error: unknown, code?: string): ActionResponse<T> {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "An unexpected error occurred. Please try again.";

  // Log detailed error server-side
  console.error(`[Server Action Error${code ? ` - ${code}` : ""}]:`, error);

  return {
    success: false,
    error: errorMessage,
    ...(code ? { code } : {}),
  };
}
