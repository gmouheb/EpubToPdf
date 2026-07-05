import { spawn } from "child_process";
import { buildCalibreArgs } from "./buildCalibreArgs";
import { ConversionSettings } from "@/types/conversion";

export function convertEpubToPdf(
  inputPath: string,
  outputPath: string,
  settings: ConversionSettings,
  timeoutMs = 300000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = buildCalibreArgs(inputPath, outputPath, settings);
    const calibreBinary = process.env.CALIBRE_BINARY ?? "ebook-convert";
    const child = spawn(calibreBinary, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, timeoutMs);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error("Conversion timed out"));
        return;
      }

      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `ebook-convert exited with code ${code}`));
      }
    });
  });
}
