import UploadForm from "@/components/UploadForm";

export default function Home() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#convert" aria-label="EPUBSwift converter">
          <span className="brand-mark" aria-hidden="true">PDF</span>
          <span>EPUBSwift</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#convert">Convert</a>
          <a href="#features">Features</a>
          <a href="#help">Help</a>
        </nav>
      </header>

      <main className="page-shell">
        <div className="app-frame">
          <section className="hero" aria-labelledby="page-title">
            <div className="intro">
              <p className="eyebrow">Calibre-powered document conversion</p>
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

          <section className="converter-showcase" id="convert" aria-label="EPUB to PDF converter">
            <UploadForm />
          </section>

          <section className="feature-grid" id="features" aria-labelledby="features-title">
            <div className="section-title-block">
              <p className="eyebrow">Built for books</p>
              <h2 id="features-title">A focused converter for readable PDFs</h2>
            </div>
            <article className="feature-card">
              <span className="feature-icon" aria-hidden="true">01</span>
              <h3>Book-aware output</h3>
              <p>Preserve covers, images, metadata, table of contents, and embedded fonts where the EPUB allows.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon feature-icon-green" aria-hidden="true">02</span>
              <h3>Local file handling</h3>
              <p>Uploads and PDFs stay outside public folders, then temporary files are cleaned up automatically.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon feature-icon-gray" aria-hidden="true">03</span>
              <h3>Practical PDF controls</h3>
              <p>Pick page size, margins, cover behavior, image handling, and font options before converting.</p>
            </article>
          </section>

          <section className="steps-band" id="help" aria-labelledby="steps-title">
            <div className="section-title-block">
              <p className="eyebrow">Simple flow</p>
              <h2 id="steps-title">Convert in three steps</h2>
            </div>
            <div className="steps-row">
              <div className="step-item">
                <span>1</span>
                <h3>Upload</h3>
                <p>Drop an EPUB file or browse from your device.</p>
              </div>
              <div className="step-item">
                <span>2</span>
                <h3>Adjust</h3>
                <p>Choose the PDF page, typography, and output quality settings.</p>
              </div>
              <div className="step-item">
                <span>3</span>
                <h3>Download</h3>
                <p>When conversion completes, download your timestamped PDF.</p>
              </div>
            </div>
          </section>

          <footer className="site-footer">
            Built by{" "}
            <a href="https://www.linkedin.com/in/ghabrimouheb/" target="_blank" rel="noreferrer">
              Mouheb Ghabri
            </a>
          </footer>
        </div>
      </main>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        <a href="#convert">Convert</a>
        <a href="#features">Features</a>
        <a href="#help">Help</a>
      </nav>
    </>
  );
}
