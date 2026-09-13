import fs from "fs/promises";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "resumes");

// Supabase client (configured for future transition)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

export interface UploadResult {
  fileUrl: string;
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * Uploads a resume file to storage.
 * Defaults to local file storage for development with PostgreSQL,
 * and seamlessly switches to Supabase Storage when configured.
 */
export async function uploadResumeFile(
  file: File,
  userId: string
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const fileExtension = path.extname(sanitizedOriginalName) || ".pdf";
  const uniqueFileName = `${userId}_${timestamp}${fileExtension}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const bucketName = "resumes";
      const filePath = `${userId}/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: file.type || "application/pdf",
          upsert: true,
        });

      if (error) {
        console.warn("Supabase upload failed, using local storage fallback:", error.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return {
          fileUrl: publicUrlData.publicUrl,
          fileKey: data.path,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || "application/pdf",
        };
      }
    } catch (supabaseErr) {
      console.warn("Supabase upload exception, falling back to local:", supabaseErr);
    }
  }

  // Local storage handler
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const localFilePath = path.join(UPLOADS_DIR, uniqueFileName);
  await fs.writeFile(localFilePath, buffer);

  const localFileUrl = `/uploads/resumes/${uniqueFileName}`;

  return {
    fileUrl: localFileUrl,
    fileKey: uniqueFileName,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || "application/pdf",
  };
}

/**
 * Deletes a resume file from storage.
 */
export async function deleteResumeFile(fileKeyOrUrl: string, userId: string): Promise<void> {
  if (isSupabaseConfigured && supabase && !fileKeyOrUrl.startsWith("/uploads/")) {
    try {
      await supabase.storage.from("resumes").remove([fileKeyOrUrl]);
      return;
    } catch (err) {
      console.error("Failed to delete from Supabase storage:", err);
    }
  }

  // Local file deletion
  try {
    const filename = path.basename(fileKeyOrUrl);
    const localFilePath = path.join(UPLOADS_DIR, filename);
    await fs.unlink(localFilePath);
  } catch (err) {
    // Ignore if file was already deleted
    console.warn("Local file deletion notice:", err instanceof Error ? err.message : err);
  }
}
