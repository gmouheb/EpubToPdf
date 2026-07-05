"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ConversionError from "./ConversionError";
import ConversionProgress from "./ConversionProgress";
import ConversionResult from "./ConversionResult";
import ConversionSettingsPanel from "./ConversionSettingsPanel";
import UploadDropzone from "./UploadDropzone";
import { Button } from "./ui/Button";
import Card from "./ui/Card";
import { ConversionSettings as Settings, JobStatus } from "@/types/conversion";

const maxFileSize = 100 * 1024 * 1024;

const defaultSettings: Settings = {
  pageSize: "a4",
  marginPreset: "medium",
  embedFonts: true,
  preserveCoverAspectRatio: true,
  preserveImages: true
};

interface JobResponse {
  id: string;
  status: JobStatus;
  downloadUrl?: string;
  error?: string;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [status, setStatus] = useState<JobStatus | "uploading" | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const pollRef = useRef<number | null>(null);

  const busy = status === "uploading" || status === "queued" || status === "converting";
  const complete = status === "complete" && Boolean(file && downloadUrl);
  const failed = status === "failed";

  useEffect(() => {
    if (!jobId || status === "complete" || status === "failed") {
      return;
    }

    pollRef.current = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const data = (await response.json()) as JobResponse;

        if (!response.ok) {
          throw new Error(data.error || "Unable to check conversion status.");
        }

        setStatus(data.status);
        setDownloadUrl(data.downloadUrl);
        setError(data.error);

        if (data.status === "complete" || data.status === "failed") {
          if (pollRef.current) {
            window.clearInterval(pollRef.current);
          }
        }
      } catch (pollError) {
        setStatus("failed");
        setError(pollError instanceof Error ? pollError.message : "Unable to check conversion status.");
      }
    }, 1500);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, [jobId, status]);

  function validateClientFile(selectedFile: File): string | undefined {
    if (!selectedFile.name.toLowerCase().endsWith(".epub")) {
      return "Choose a file with the .epub extension.";
    }

    if (selectedFile.size <= 0) {
      return "The selected EPUB is empty.";
    }

    if (selectedFile.size > maxFileSize) {
      return "The selected EPUB is larger than the 100 MB MVP limit.";
    }

    return undefined;
  }

  function handleFileChange(selectedFile: File | null) {
    setDownloadUrl(undefined);
    setJobId(null);
    setStatus(null);
    setError(undefined);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validationError = validateClientFile(selectedFile);
    setError(validationError);
    setFile(validationError ? null : selectedFile);
  }

  async function startConversion() {
    setError(undefined);
    setDownloadUrl(undefined);

    if (!file) {
      setError("Choose an EPUB file first.");
      return;
    }

    const validationError = validateClientFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("pageSize", settings.pageSize);
    formData.append("marginPreset", settings.marginPreset);
    formData.append("embedFonts", String(settings.embedFonts));
    formData.append("preserveCoverAspectRatio", String(settings.preserveCoverAspectRatio));
    formData.append("preserveImages", String(settings.preserveImages));

    if (settings.fontFamily) {
      formData.append("fontFamily", settings.fontFamily);
    }

    if (settings.fontSize) {
      formData.append("fontSize", String(settings.fontSize));
    }

    setStatus("uploading");

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { jobId?: string; status?: JobStatus; error?: string };

      if (!response.ok || !data.jobId || !data.status) {
        throw new Error(data.error || "Unable to start conversion.");
      }

      setJobId(data.jobId);
      setStatus(data.status);
    } catch (submitError) {
      setStatus("failed");
      setError(submitError instanceof Error ? submitError.message : "Unable to start conversion.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await startConversion();
  }

  function resetForm() {
    setFile(null);
    setStatus(null);
    setJobId(null);
    setDownloadUrl(undefined);
    setError(undefined);
    setSettings(defaultSettings);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <Card className="converter-card">
        <UploadDropzone file={file} error={error && !failed ? error : undefined} disabled={busy} onFileChange={handleFileChange} />

        <ConversionSettingsPanel settings={settings} onChange={setSettings} disabled={busy} />

        <div className="form-actions">
          <Button type="submit" disabled={busy || !file || complete}>
            {busy ? "Conversion running" : "Convert to PDF"}
          </Button>
          <p className="form-action-note">
            Fixed-layout EPUBs can usually be preserved with high fidelity. Reflowable EPUBs are repaginated.
          </p>
        </div>

        <ConversionProgress status={status} />

        {failed ? (
          <ConversionError message={error} canRetry={Boolean(file) && !busy} onRetry={startConversion} />
        ) : null}

        {complete && file ? (
          <ConversionResult
            file={file}
            settings={settings}
            downloadUrl={downloadUrl}
            onReset={resetForm}
          />
        ) : null}
      </Card>
    </form>
  );
}
