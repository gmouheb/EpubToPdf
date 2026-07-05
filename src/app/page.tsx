import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <main className="page-shell">
      <div className="app-frame">
        <section className="hero" aria-labelledby="page-title">
          <div className="intro">
            <div className="eyebrow">Calibre-powered conversion</div>
            <h1 id="page-title">Convert EPUB to PDF without losing the book feel</h1>
            <p>
              Choose page size, margins, font options, and output quality. Covers, images,
              metadata, and embedded fonts are preserved when possible.
            </p>
            <p className="limitation-note">
              Fixed-layout EPUBs can usually be preserved with high fidelity. Reflowable EPUBs are
              repaginated into your selected PDF page size.
            </p>
          </div>
        </section>

        <div className="converter-wrap">
          <UploadForm />
        </div>

        <footer className="site-footer">
          Built by{" "}
          <a href="https://www.linkedin.com/in/ghabrimouheb/" target="_blank" rel="noreferrer">
            Mouheb Ghabri
          </a>
        </footer>
      </div>
    </main>
  );
}
