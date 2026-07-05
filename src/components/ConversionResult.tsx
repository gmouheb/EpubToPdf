"use client";

import { ConversionSettings as Settings } from "@/types/conversion";
import { Button, ButtonLink } from "./ui/Button";
import { formatFileSize } from "./UploadDropzone";

interface ConversionResultProps {
  file: File;
  settings: Settings;
  downloadUrl?: string;
  onReset: () => void;
}

export default function ConversionResult({
  file,
  settings,
  downloadUrl,
  onReset
}: ConversionResultProps) {
  if (!downloadUrl) {
    return null;
  }

  return (
    <section className="result-panel" aria-labelledby="success-heading">
      <div>
        <p className="success-kicker">Complete</p>
        <h2 id="success-heading">Your PDF is ready.</h2>
        <p>
          Converted from <strong>{file.name}</strong> ({formatFileSize(file.size)}) using{" "}
          {settings.pageSize.toUpperCase()} pages and {settings.marginPreset} margins.
        </p>
      </div>
      <div className="result-actions">
        <ButtonLink href={downloadUrl} className="download-button">
          Download PDF
        </ButtonLink>
        <Button type="button" variant="secondary" onClick={onReset}>
          Convert another book
        </Button>
      </div>
      <p className="result-note">Temporary files are deleted shortly after download.</p>
    </section>
  );
}
