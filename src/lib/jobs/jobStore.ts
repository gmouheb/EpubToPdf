import { existsSync } from "fs";
import { ConversionJob, ConversionSettings } from "@/types/conversion";
import { convertEpubToPdf } from "@/lib/conversion/convertEpubToPdf";

interface LocalJobStore {
  jobs: Map<string, ConversionJob>;
  queue: string[];
  activeCount: number;
}

const globalForJobs = globalThis as typeof globalThis & {
  epubToPdfJobStore?: LocalJobStore;
};

const store =
  globalForJobs.epubToPdfJobStore ??
  (globalForJobs.epubToPdfJobStore = {
    jobs: new Map<string, ConversionJob>(),
    queue: [],
    activeCount: 0
  });

const maxConcurrentConversions = Number(process.env.MAX_CONCURRENT_CONVERSIONS ?? 1);
const timeoutMs = Number(process.env.CONVERSION_TIMEOUT_SECONDS ?? 300) * 1000;

export function createJob(
  id: string,
  inputPath: string,
  outputPath: string,
  downloadFilename: string,
  settings: ConversionSettings
): ConversionJob {
  const job: ConversionJob = {
    id,
    status: "queued",
    inputPath,
    outputPath,
    downloadFilename,
    createdAt: new Date().toISOString(),
    settings
  };

  store.jobs.set(id, job);
  store.queue.push(id);
  processQueue();
  return job;
}

export function getJob(id: string): ConversionJob | undefined {
  return store.jobs.get(id);
}

export function deleteJob(id: string): void {
  store.jobs.delete(id);
}

export function jobOutputExists(job: ConversionJob): boolean {
  return Boolean(job.outputPath && existsSync(job.outputPath));
}

function updateJob(id: string, patch: Partial<ConversionJob>): void {
  const current = store.jobs.get(id);
  if (!current) {
    return;
  }

  store.jobs.set(id, { ...current, ...patch });
}

function processQueue(): void {
  while (store.activeCount < maxConcurrentConversions && store.queue.length > 0) {
    const id = store.queue.shift();
    if (!id) {
      continue;
    }

    const job = store.jobs.get(id);
    if (!job || !job.outputPath) {
      continue;
    }

    store.activeCount += 1;
    updateJob(id, { status: "converting" });

    convertEpubToPdf(job.inputPath, job.outputPath, job.settings, timeoutMs)
      .then(() => {
        updateJob(id, {
          status: "complete",
          completedAt: new Date().toISOString()
        });
      })
      .catch((error: unknown) => {
        console.error(`Conversion job ${id} failed`, error);
        updateJob(id, {
          status: "failed",
          error: userFacingConversionError(error),
          completedAt: new Date().toISOString()
        });
      })
      .finally(() => {
        store.activeCount -= 1;
        processQueue();
      });
  }
}

function userFacingConversionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("ENOENT")) {
    return "Calibre ebook-convert was not found. Install Calibre and make sure it is available in PATH.";
  }

  if (/drm|encrypted|rights/i.test(message)) {
    return "This EPUB appears to be DRM-protected or encrypted and cannot be converted.";
  }

  if (/timed out/i.test(message)) {
    return "The conversion timed out. Try a smaller EPUB or fewer conversion options.";
  }

  return "The EPUB could not be converted. It may be unsupported, malformed, or DRM-protected.";
}
