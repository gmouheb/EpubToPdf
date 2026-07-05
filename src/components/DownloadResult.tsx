"use client";

interface DownloadResultProps {
  downloadUrl?: string;
}

export default function DownloadResult({ downloadUrl }: DownloadResultProps) {
  if (!downloadUrl) {
    return null;
  }

  return (
    <div className="download-result">
      <a className="button" href={downloadUrl}>
        Download PDF
      </a>
      <span className="status-note">The temporary file will be cleaned up automatically later.</span>
    </div>
  );
}
