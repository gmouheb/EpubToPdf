import { mkdir } from "fs/promises";
import path from "path";

const root = process.cwd();

export const uploadDir = path.resolve(root, process.env.UPLOAD_DIR ?? "uploads");
export const outputDir = path.resolve(root, process.env.OUTPUT_DIR ?? "outputs");

export async function ensureStorageDirs(): Promise<void> {
  await Promise.all([
    mkdir(uploadDir, { recursive: true }),
    mkdir(outputDir, { recursive: true })
  ]);
}

export function uploadPathFor(id: string): string {
  return path.join(uploadDir, `${id}.epub`);
}

export function outputPathFor(id: string): string {
  return path.join(outputDir, `${id}.pdf`);
}
