import { ConversionSettings } from "@/types/conversion";

const marginMap: Record<string, number> = {
  small: 24,
  medium: 36,
  large: 54
};

export function buildCalibreArgs(
  inputPath: string,
  outputPath: string,
  settings: ConversionSettings
): string[] {
  const args: string[] = [inputPath, outputPath];
  const paperSize = settings.pageSize === "letter" ? "letter" : "a4";

  args.push("--paper-size", paperSize);

  const margin = marginMap[settings.marginPreset] ?? marginMap.medium;
  args.push(
    "--pdf-page-margin-left",
    String(margin),
    "--pdf-page-margin-right",
    String(margin),
    "--pdf-page-margin-top",
    String(margin),
    "--pdf-page-margin-bottom",
    String(margin)
  );

  if (settings.embedFonts) {
    args.push("--embed-all-fonts");
  }

  if (settings.preserveCoverAspectRatio) {
    args.push("--preserve-cover-aspect-ratio");
  }

  if (settings.fontFamily) {
    args.push("--font-family", settings.fontFamily);
  }

  if (settings.fontSize) {
    args.push("--base-font-size", String(settings.fontSize));
  }

  return args;
}
