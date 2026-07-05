export interface EpubMetadata {
  title?: string;
  author?: string;
  language?: string;
  publisher?: string;
}

export async function extractMetadata(_filePath: string): Promise<EpubMetadata> {
  return {};
}
