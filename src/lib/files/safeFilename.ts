export function safeFilename(filename: string): string {
  return filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "book.epub";
}

export function buildTimestampedPdfFilename(originalFilename: string, date = new Date()): string {
  const safe = safeFilename(originalFilename);
  const baseName = safe.replace(/\.epub$/i, "").trim() || "book";
  const timestamp = date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

  return `${baseName}-${timestamp}.pdf`;
}
