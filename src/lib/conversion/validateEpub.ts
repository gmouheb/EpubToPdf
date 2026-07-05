export function validateEpub(filename: string, size: number): { valid: boolean; error?: string } {
  if (!filename || typeof filename !== "string") {
    return { valid: false, error: "Missing file name." };
  }

  const normalized = filename.trim().toLowerCase();
  if (!normalized.endsWith(".epub")) {
    return { valid: false, error: "Only EPUB files are accepted." };
  }

  if (size <= 0) {
    return { valid: false, error: "The uploaded file is empty." };
  }

  const maxSizeBytes = Number(process.env.MAX_FILE_SIZE_BYTES ?? 104857600);
  if (size > maxSizeBytes) {
    return { valid: false, error: "The EPUB file exceeds the maximum allowed size." };
  }

  return { valid: true };
}
