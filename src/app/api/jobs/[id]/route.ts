import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/jobs/jobStore";

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

  return NextResponse.json({
    id: job.id,
    status: job.status,
    error: job.error,
    downloadUrl: job.status === "complete" ? `/api/download/${job.id}` : undefined
  });
}
