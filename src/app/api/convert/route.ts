import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { validateEpub } from "@/lib/conversion/validateEpub";
import { startCleanupJob } from "@/lib/files/cleanup";
import { ensureStorageDirs, outputPathFor, uploadPathFor } from "@/lib/files/paths";
import { buildTimestampedPdfFilename, safeFilename } from "@/lib/files/safeFilename";
import { createJob } from "@/lib/jobs/jobStore";
import { ConversionSettings, MarginPreset, PageSize } from "@/types/conversion";

export const runtime = "nodejs";

const pageSizes: PageSize[] = ["a4", "letter", "original"];
const marginPresets: MarginPreset[] = ["small", "medium", "large"];

export async function POST(request: NextRequest) {
  try {
    startCleanupJob();
    await ensureStorageDirs();

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Missing EPUB file." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing EPUB file." }, { status: 400 });
    }

    const originalName = safeFilename(file.name);
    const validation = validateEpub(originalName, file.size);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    if (file.type && file.type !== "application/epub+zip" && file.type !== "application/octet-stream") {
      return NextResponse.json({ error: "The uploaded file does not look like an EPUB." }, { status: 400 });
    }

    const settings = parseSettings(formData);
    const id = randomUUID();
    const inputPath = uploadPathFor(id);
    const outputPath = outputPathFor(id);
    const downloadFilename = buildTimestampedPdfFilename(originalName);

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(inputPath, bytes, { flag: "wx" });

    const job = createJob(id, inputPath, outputPath, downloadFilename, settings);

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (error) {
    console.error("Failed to create conversion job", error);
    return NextResponse.json({ error: "Unable to start conversion." }, { status: 500 });
  }
}

function parseSettings(formData: FormData): ConversionSettings {
  const pageSize = valueIn<PageSize>(formData.get("pageSize"), pageSizes, "a4");
  const marginPreset = valueIn<MarginPreset>(formData.get("marginPreset"), marginPresets, "medium");
  const fontFamily = stringValue(formData.get("fontFamily"));
  const rawFontSize = Number(formData.get("fontSize"));
  const fontSize = Number.isFinite(rawFontSize) && rawFontSize >= 6 && rawFontSize <= 48 ? rawFontSize : undefined;

  return {
    pageSize,
    marginPreset,
    embedFonts: booleanValue(formData.get("embedFonts"), true),
    preserveCoverAspectRatio: booleanValue(formData.get("preserveCoverAspectRatio"), true),
    preserveImages: booleanValue(formData.get("preserveImages"), true),
    fontFamily,
    fontSize
  };
}

function valueIn<T extends string>(value: FormDataEntryValue | null, allowed: T[], fallback: T): T {
  return typeof value === "string" && allowed.includes(value as T) ? (value as T) : fallback;
}

function booleanValue(value: FormDataEntryValue | null, fallback: boolean): boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
}

function stringValue(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 120) : undefined;
}
