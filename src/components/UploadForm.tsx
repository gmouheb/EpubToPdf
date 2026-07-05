"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ConversionSettingsPanel from "./ConversionSettingsPanel";
import UploadDropzone, { formatFileSize } from "./UploadDropzone";
import { Button, ButtonLink } from "./ui/Button";
import Card from "./ui/Card";
import { ConversionSettings as Settings, JobStatus } from "@/types/conversion";

const maxFileSize = 100 * 1024 * 1024;
const maxBatchFiles = 3;

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

interface BatchItem {
  localId: string;
  file: File;
  status: JobStatus | "uploading" | null;
  jobId?: string;
  downloadUrl?: string;
  error?: string;
}

export default function UploadForm() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [formError, setFormError] = useState<string | undefined>();

  const busy = items.some((item) => item.status === "uploading" || item.status === "queued" || item.status === "converting");
  const hasComplete = items.some((item) => item.status === "complete");
  const allFinished = items.length > 0 && items.every((item) => item.status === "complete" || item.status === "failed");
  const canConvert = items.length > 0 && !busy && !hasComplete;

  const activeJobIds = useMemo(
    () =>
      items
        .filter((item) => item.jobId && item.status !== "complete" && item.status !== "failed")
        .map((item) => item.jobId as string),
    [items]
  );

  useEffect(() => {
    if (activeJobIds.length === 0) {
      return;
    }

    const interval = window.setInterval(async () => {
      await Promise.all(
        activeJobIds.map(async (jobId) => {
          try {
            const response = await fetch(`/api/jobs/${jobId}`);
            const data = (await response.json()) as JobResponse;

            if (!response.ok) {
              throw new Error(data.error || "Unable to check conversion status.");
            }

            setItems((current) =>
              current.map((item) =>
                item.jobId === jobId
                  ? {
                      ...item,
                      status: data.status,
                      downloadUrl: data.downloadUrl,
                      error: data.error
                    }
                  : item
              )
            );
          } catch (pollError) {
            setItems((current) =>
              current.map((item) =>
                item.jobId === jobId
                  ? {
                      ...item,
                      status: "failed",
                      error: pollError instanceof Error ? pollError.message : "Unable to check conversion status."
                    }
                  : item
              )
            );
          }
        })
      );
    }, 1500);

    return () => window.clearInterval(interval);
  }, [activeJobIds]);

  function validateClientFile(selectedFile: File): string | undefined {
    if (!selectedFile.name.toLowerCase().endsWith(".epub")) {
      return `${selectedFile.name} is not an EPUB file.`;
    }

    if (selectedFile.size <= 0) {
      return `${selectedFile.name} is empty.`;
    }

    if (selectedFile.size > maxFileSize) {
      return `${selectedFile.name} is larger than the 100 MB limit.`;
    }

    return undefined;
  }

  function handleFilesAdd(selectedFiles: File[]) {
    setFormError(undefined);

    if (busy) {
      return;
    }

    if (selectedFiles.length === 0) {
      return;
    }

    const availableSlots = maxBatchFiles - items.length;
    if (availableSlots <= 0) {
      setFormError(`You can convert up to ${maxBatchFiles} EPUB files at once.`);
      return;
    }

    const nextFiles = selectedFiles.slice(0, availableSlots);
    const validationError = nextFiles.map(validateClientFile).find(Boolean);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (selectedFiles.length > availableSlots) {
      setFormError(batchLimitMessage(nextFiles.length, selectedFiles.length - nextFiles.length));
    }

    setItems((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        localId: crypto.randomUUID(),
        file,
        status: null
      }))
    ]);
  }

  function handleFileRemove(index: number) {
    setFormError(undefined);
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function createConversionJob(item: BatchItem): Promise<{ jobId: string; status: JobStatus }> {
    const validationError = validateClientFile(item.file);
    if (validationError) {
      throw new Error(validationError);
    }

    const formData = new FormData();
    formData.append("file", item.file);
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

    const response = await fetch("/api/convert", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as {
      jobId?: string;
      status?: JobStatus;
      error?: string;
      retryAfterSeconds?: number;
    };

    if (!response.ok || !data.jobId || !data.status) {
      throw new Error(errorMessageForResponse(response.status, data.error, data.retryAfterSeconds));
    }

    return {
      jobId: data.jobId,
      status: data.status
    };
  }

  async function startConversion(itemsToConvert = items) {
    setFormError(undefined);

    if (itemsToConvert.length === 0) {
      setFormError("Choose at least one EPUB file first.");
      return;
    }

    setItems((current) =>
      current.map((item) => ({
        ...item,
        status: item.status === "complete" ? item.status : "uploading",
        error: undefined,
        downloadUrl: item.status === "complete" ? item.downloadUrl : undefined
      }))
    );

    await Promise.all(
      itemsToConvert.map(async (item) => {
        if (item.status === "complete") {
          return;
        }

        try {
          const data = await createConversionJob(item);
          setItems((current) =>
            current.map((currentItem) =>
              currentItem.localId === item.localId
                ? {
                    ...currentItem,
                    jobId: data.jobId,
                    status: data.status
                  }
                : currentItem
            )
          );
        } catch (submitError) {
          setItems((current) =>
            current.map((currentItem) =>
              currentItem.localId === item.localId
                ? {
                    ...currentItem,
                    status: "failed",
                    error: submitError instanceof Error ? submitError.message : "Unable to start conversion."
                  }
                : currentItem
            )
          );
        }
      })
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await startConversion();
  }

  function retryFailed() {
    const retryItems = items
      .filter((item) => item.status === "failed")
      .map((item) => ({
        ...item,
        status: null,
        jobId: undefined,
        downloadUrl: undefined,
        error: undefined
      }));

    setItems((current) =>
      current.map((item) =>
        item.status === "failed"
          ? retryItems.find((retryItem) => retryItem.localId === item.localId) ?? item
          : item
      )
    );
    startConversion(retryItems);
  }

  function resetForm() {
    setItems([]);
    setFormError(undefined);
    setSettings(defaultSettings);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <Card className="converter-card">
        <UploadDropzone
          files={items.map((item) => item.file)}
          error={formError}
          disabled={busy}
          maxFiles={maxBatchFiles}
          onFilesAdd={handleFilesAdd}
          onFileRemove={handleFileRemove}
        />

        <ConversionSettingsPanel settings={settings} onChange={setSettings} disabled={busy} />

        <div className="form-actions">
          <Button type="submit" disabled={!canConvert}>
            {busy ? "Conversions running" : `Convert ${items.length || ""} to PDF`}
          </Button>
          <p className="form-action-note">
            Convert up to {maxBatchFiles} EPUB files in parallel. Fixed-layout EPUBs can usually be preserved with high fidelity.
          </p>
        </div>

        {items.length > 0 ? (
          <section className="batch-panel" aria-live="polite">
            <div className="section-heading">
              <p className="section-kicker">Batch</p>
              <h2>Conversion queue</h2>
              <p>Each book is uploaded as its own job and can finish independently.</p>
            </div>

            <div className="batch-list">
              {items.map((item) => (
                <div className={`batch-item batch-item-${item.status ?? "ready"}`} key={item.localId}>
                  <div>
                    <h3>{item.file.name}</h3>
                    <p>{formatFileSize(item.file.size)} · {statusLabel(item.status)}</p>
                    {item.error ? <p className="batch-error">{item.error}</p> : null}
                  </div>
                  <div className="batch-actions">
                    {item.downloadUrl ? (
                      <ButtonLink href={item.downloadUrl}>Download PDF</ButtonLink>
                    ) : null}
                    {item.status === "failed" ? (
                      <span className="status-chip status-chip-failed">Failed</span>
                    ) : (
                      <span className={`status-chip status-chip-${item.status ?? "ready"}`}>
                        {statusLabel(item.status)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {items.some((item) => item.status === "failed") ? (
              <div className="result-actions">
                <Button type="button" variant="secondary" disabled={busy} onClick={retryFailed}>
                  Try failed again
                </Button>
              </div>
            ) : null}

            {allFinished ? (
              <div className="result-actions">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Convert another batch
                </Button>
              </div>
            ) : null}
          </section>
        ) : null}
      </Card>
    </form>
  );
}

function statusLabel(status: BatchItem["status"]): string {
  switch (status) {
    case "uploading":
      return "Uploading";
    case "queued":
      return "Preparing";
    case "converting":
      return "Converting";
    case "complete":
      return "Complete";
    case "failed":
      return "Failed";
    default:
      return "Ready";
  }
}

function batchLimitMessage(addedCount: number, ignoredCount: number): string {
  if (addedCount === 0) {
    return "You can add up to 3 EPUB files at once. Remove a file before adding another.";
  }

  return `${addedCount} EPUB file${addedCount === 1 ? " was" : "s were"} added. ${ignoredCount} extra file${ignoredCount === 1 ? " was" : "s were"} ignored because the batch limit is 3.`;
}

function errorMessageForResponse(
  status: number,
  error?: string,
  retryAfterSeconds?: number
): string {
  if (status === 429) {
    if (error) {
      return error;
    }

    const minutes = retryAfterSeconds ? Math.max(Math.ceil(retryAfterSeconds / 60), 1) : 30;
    return `You have already started 3 conversions. Please wait about ${minutes} minute${minutes === 1 ? "" : "s"} before converting more files.`;
  }

  if (status >= 500) {
    return "The converter could not start this job right now. Please try again in a moment.";
  }

  return error || "We could not convert this EPUB. Please check the file and try again.";
}
