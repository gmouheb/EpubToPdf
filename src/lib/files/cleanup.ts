import { readdir, rm, stat } from "fs/promises";
import path from "path";
import { outputDir, uploadDir } from "./paths";

let cleanupStarted = false;
const pendingDeletionKeys = new Set<string>();

const retentionMs =
  Number(process.env.JOB_RETENTION_MINUTES ?? 60) * 60 * 1000;
const cleanupIntervalMs =
  Number(process.env.CLEANUP_INTERVAL_MINUTES ?? 10) * 60 * 1000;
const postDownloadCleanupDelayMs =
  Number(process.env.POST_DOWNLOAD_CLEANUP_SECONDS ?? 8) * 1000;

async function deleteOldFiles(dir: string): Promise<void> {
  let entries: string[] = [];

  try {
    entries = await readdir(dir);
  } catch {
    return;
  }

  const now = Date.now();
  await Promise.all(
    entries.map(async (entry) => {
      const filePath = path.join(dir, entry);

      try {
        const fileStat = await stat(filePath);
        if (now - fileStat.mtimeMs > retentionMs) {
          await rm(filePath, { force: true });
        }
      } catch {
        // Cleanup should never break a request path.
      }
    })
  );
}

export async function cleanupOldFiles(): Promise<void> {
  await Promise.all([deleteOldFiles(uploadDir), deleteOldFiles(outputDir)]);
}

export function scheduleDownloadedFileCleanup(
  jobId: string,
  paths: string[],
  onComplete?: () => void
): void {
  if (pendingDeletionKeys.has(jobId)) {
    return;
  }

  pendingDeletionKeys.add(jobId);

  setTimeout(() => {
    Promise.all(paths.map((filePath) => rm(filePath, { force: true })))
      .then(() => {
        if (process.env.NODE_ENV !== "production") {
          console.info(`Deleted downloaded files for job ${jobId}`);
        }
        onComplete?.();
      })
      .catch((error) => {
        console.error(`Post-download cleanup failed for job ${jobId}`, error);
      })
      .finally(() => {
        pendingDeletionKeys.delete(jobId);
      });
  }, postDownloadCleanupDelayMs).unref();
}

export function startCleanupJob(): void {
  if (cleanupStarted) {
    return;
  }

  cleanupStarted = true;
  setInterval(() => {
    cleanupOldFiles().catch((error) => {
      console.error("Temporary file cleanup failed", error);
    });
  }, cleanupIntervalMs).unref();
}
