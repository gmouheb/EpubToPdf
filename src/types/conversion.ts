export type PageSize = "a4" | "letter" | "original";

export type MarginPreset = "small" | "medium" | "large";

export interface ConversionSettings {
  pageSize: PageSize;
  marginPreset: MarginPreset;
  embedFonts: boolean;
  preserveCoverAspectRatio: boolean;
  preserveImages: boolean;
  fontFamily?: string;
  fontSize?: number;
}

export type JobStatus = "queued" | "converting" | "complete" | "failed";

export interface ConversionJob {
  id: string;
  status: JobStatus;
  inputPath: string;
  outputPath?: string;
  downloadFilename: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
  settings: ConversionSettings;
}
