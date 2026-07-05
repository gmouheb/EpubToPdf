import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";
import { scheduleDownloadedFileCleanup } from "@/lib/files/cleanup";
import { deleteJob, getJob } from "@/lib/jobs/jobStore";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const job = getJob(params.id);

  if (!job) {
    return NextResponse.json({ error: "Job not found." }, { status: 404 });
  }

  if (job.status !== "complete" || !job.outputPath) {
    return NextResponse.json({ error: "PDF is not ready." }, { status: 409 });
  }

  try {
    const fileStat = await stat(job.outputPath);
    const stream = createReadStream(job.outputPath);
    const scheduleCleanupOnce = once(() => {
      scheduleDownloadedFileCleanup(job.id, [job.inputPath, job.outputPath as string], () => {
        deleteJob(job.id);
      });
    });
    stream.once("end", scheduleCleanupOnce);
    stream.once("close", scheduleCleanupOnce);

    return new NextResponse(Readable.toWeb(stream) as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(fileStat.size),
        "Content-Disposition": `attachment; filename="${job.downloadFilename}"`
      }
    });
  } catch (error) {
    console.error(`Output file missing for job ${job.id}`, error);
    return NextResponse.json({ error: "Output file is missing." }, { status: 404 });
  }
}

function once(callback: () => void): () => void {
  let called = false;

  return () => {
    if (called) {
      return;
    }

    called = true;
    callback();
  };
}
