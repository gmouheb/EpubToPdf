import { createReadStream } from "fs";
import { stat } from "fs/promises";
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
    stream.once("close", () => {
      scheduleDownloadedFileCleanup(job.id, [job.inputPath, job.outputPath as string], () => {
        deleteJob(job.id);
      });
    });

    return new NextResponse(stream as unknown as BodyInit, {
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
