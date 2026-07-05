import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EPUB to PDF Converter",
  description: "Convert EPUB files to downloadable PDFs with Calibre-backed settings."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
