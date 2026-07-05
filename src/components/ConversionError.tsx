"use client";

import Alert from "./ui/Alert";
import { Button } from "./ui/Button";

interface ConversionErrorProps {
  message?: string;
  canRetry: boolean;
  onRetry: () => void;
}

export default function ConversionError({ message, canRetry, onRetry }: ConversionErrorProps) {
  return (
    <div className="error-panel">
      <Alert tone="error" title="We could not convert this EPUB. Please check the file and try again.">
        {message || "The EPUB may be unsupported, malformed, DRM-protected, or too large for the current settings."}
      </Alert>
      <Button type="button" variant="secondary" disabled={!canRetry} onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
