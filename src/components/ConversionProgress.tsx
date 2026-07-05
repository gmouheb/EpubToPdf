"use client";

import { JobStatus } from "@/types/conversion";
import ProgressSteps from "./ui/ProgressSteps";

interface ConversionProgressProps {
  status: JobStatus | "uploading" | null;
}

const steps = [
  {
    label: "Uploading",
    description: "Sending your EPUB to the converter."
  },
  {
    label: "Preparing",
    description: "Preparing your book..."
  },
  {
    label: "Converting",
    description: "Converting chapters into PDF pages..."
  },
  {
    label: "Finalizing",
    description: "Finalizing your PDF..."
  },
  {
    label: "Complete",
    description: "Your PDF is ready."
  }
];

const activeStepByStatus: Record<Exclude<ConversionProgressProps["status"], null>, number> = {
  uploading: 0,
  queued: 1,
  converting: 2,
  complete: 4,
  failed: 2
};

export default function ConversionProgress({ status }: ConversionProgressProps) {
  if (!status || status === "failed") {
    return null;
  }

  const activeIndex = activeStepByStatus[status];

  return (
    <section className="flow-section progress-section" aria-live="polite">
      <div className="section-heading">
        <p className="section-kicker">Step 3</p>
        <h2>{status === "complete" ? "Conversion complete" : "Converting your book"}</h2>
        <p>
          {status === "complete"
            ? "Your PDF is ready."
            : steps[activeIndex].description}
        </p>
      </div>
      <ProgressSteps steps={steps} activeIndex={activeIndex} complete={status === "complete"} />
    </section>
  );
}
