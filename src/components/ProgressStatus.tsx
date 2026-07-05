"use client";

import { JobStatus } from "@/types/conversion";

interface ProgressStatusProps {
  status: JobStatus | "uploading" | null;
  error?: string;
}

const labels: Record<NonNullable<ProgressStatusProps["status"]>, string> = {
  uploading: "Uploading",
  queued: "Queued",
  converting: "Converting",
  complete: "Complete",
  failed: "Failed"
};

export default function ProgressStatus({ status, error }: ProgressStatusProps) {
  if (!status) {
    return null;
  }

  return (
    <div className="status-panel" role="status" aria-live="polite">
      <div className="status-row">
        <strong>{labels[status]}</strong>
        <span className={`status-pill ${status}`}>{labels[status]}</span>
      </div>
      <div className="progress-track" aria-hidden="true">
        <div className={`progress-fill ${status}`} />
      </div>
      <div className={status === "failed" ? "error" : "status-note"}>
        {status === "uploading" && "Sending the EPUB to the converter."}
        {status === "queued" && "Your book is waiting for the local converter."}
        {status === "converting" && "Calibre is building the PDF. Larger books can take a few minutes."}
        {status === "complete" && "The PDF is ready to download."}
        {status === "failed" && (error || "Conversion failed.")}
      </div>
    </div>
  );
}
