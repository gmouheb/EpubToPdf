"use client";

import { DragEvent, useRef, useState } from "react";
import { Button } from "./ui/Button";

interface UploadDropzoneProps {
  files: File[];
  error?: string;
  disabled?: boolean;
  maxFiles: number;
  onFilesAdd: (files: File[]) => void;
  onFileRemove: (index: number) => void;
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
  files,
  error,
  disabled,
  maxFiles,
  onFilesAdd,
  onFileRemove
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);

    if (disabled) {
      return;
    }

    onFilesAdd(Array.from(event.dataTransfer.files ?? []));
  }

  function openPicker() {
    if (!disabled && files.length < maxFiles) {
      inputRef.current?.click();
    }
  }

  return (
    <section className="flow-section" aria-labelledby="upload-heading">
      <div className="section-heading">
        <p className="section-kicker">Step 1</p>
        <h2 id="upload-heading">Upload your books</h2>
        <p>Drop up to {maxFiles} EPUB files here or browse from your device.</p>
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
        onClick={openPicker}
      >
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept=".epub,application/epub+zip"
          multiple
          disabled={disabled}
          onChange={(event) => {
            onFilesAdd(Array.from(event.target.files ?? []));
            event.currentTarget.value = "";
          }}
        />

        {files.length > 0 ? (
          <div className="selected-files" onClick={(event) => event.stopPropagation()}>
            {files.map((file, index) => (
              <div className="selected-file-row" key={`${file.name}-${file.size}-${index}`}>
                <div>
                  <span className="file-badge">EPUB</span>
                  <h3>{file.name}</h3>
                  <p>{formatFileSize(file.size)} · Ready to convert</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={disabled}
                  onClick={() => onFileRemove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="ghost" disabled={disabled || files.length >= maxFiles} onClick={openPicker}>
              Add another EPUB
            </Button>
          </div>
        ) : (
          <div className="dropzone-empty">
            <div className="dropzone-icon" aria-hidden="true">
              EPUB
            </div>
            <h3>Click to upload or drag and drop</h3>
            <p>EPUB files up to 100 MB each · Maximum {maxFiles} files</p>
          </div>
        )}
      </div>

      <div className={error ? "validation-message validation-error" : "validation-message"}>
        {error || `Accepts .epub files up to 100 MB each. You can convert ${maxFiles} files at once.`}
      </div>
    </section>
  );
}
