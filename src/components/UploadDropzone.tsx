"use client";

import { DragEvent, useRef, useState } from "react";
import { Button } from "./ui/Button";

interface UploadDropzoneProps {
  file: File | null;
  error?: string;
  disabled?: boolean;
  onFileChange: (file: File | null) => void;
}

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadDropzone({
  file,
  error,
  disabled,
  onFileChange
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (disabled) {
      return;
    }

    onFileChange(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <section className="flow-section" aria-labelledby="upload-heading">
      <div className="section-heading">
        <p className="section-kicker">Step 1</p>
        <h2 id="upload-heading">Upload your book</h2>
        <p>Drop your EPUB file here or browse from your device.</p>
      </div>

      <div
        className={`dropzone ${dragging ? "dropzone-dragging" : ""} ${error ? "dropzone-error" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".epub,application/epub+zip"
          disabled={disabled}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="selected-file">
            <div>
              <span className="file-badge">EPUB</span>
              <h3>{file.name}</h3>
              <p>{formatFileSize(file.size)} · Ready to convert</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
                onFileChange(null);
              }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="dropzone-empty">
            <div className="dropzone-icon" aria-hidden="true">
              EPUB
            </div>
            <h3>Drop your EPUB file here</h3>
            <p>or browse from your device</p>
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              Browse file
            </Button>
          </div>
        )}
      </div>

      <div className={error ? "validation-message validation-error" : "validation-message"}>
        {error || "Accepts .epub files up to 100 MB."}
      </div>
    </section>
  );
}
