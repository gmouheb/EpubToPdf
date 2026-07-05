# EPUB-to-PDF Converter

A local Next.js app for converting `.epub` books into downloadable PDF files. The backend uses Calibre's `ebook-convert` command and exposes a small job API for upload, conversion progress, and download.

The converter tries to preserve the book structure, cover, metadata, table of contents, images, embedded fonts, and layout as closely as Calibre and the source EPUB allow. Fixed-layout EPUBs should convert with high fidelity. Reflowable EPUBs are repaginated into the selected PDF page size, usually A4 by default, so they may not match the layout of every EPUB reader.

This app does not bypass DRM-protected EPUBs.

## Requirements

- Node.js 18 or newer
- npm
- Calibre installed locally
- `ebook-convert` available in `PATH`, or configured with `CALIBRE_BINARY`

## Install Calibre

On Ubuntu or Debian:

```bash
sudo apt update
sudo apt install calibre
```

Verify that Calibre is installed:

```bash
ebook-convert --version
```

If the command prints a version, the app can usually find Calibre automatically.

If Calibre is installed but `ebook-convert` is not in `PATH`, find the binary:

```bash
which ebook-convert
```

Then set the absolute path in `.env.local`:

```bash
CALIBRE_BINARY=/absolute/path/to/ebook-convert
```

## Install The Project

Install dependencies:

```bash
npm install
```

Create a local environment file if you want to override defaults:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Start a production build:

```bash
npm run start
```

## Production With Nginx

An example Nginx reverse-proxy config is included in [`nginx/epub-to-pdf.conf`](./nginx/epub-to-pdf.conf).

Quick install:

```bash
sudo cp nginx/epub-to-pdf.conf /etc/nginx/sites-available/epub-to-pdf
sudo ln -s /etc/nginx/sites-available/epub-to-pdf /etc/nginx/sites-enabled/epub-to-pdf
sudo nginx -t
sudo systemctl reload nginx
```

Before using it in production, edit `server_name` in the config and replace `example.com` with your real domain.

More details are in [`nginx/README.md`](./nginx/README.md).

## Test Calibre Manually

Before testing the app, confirm Calibre can convert an EPUB by itself:

```bash
ebook-convert sample.epub sample.pdf --paper-size a4
```

If this command fails, the app conversion will fail too. Fix the Calibre installation first.

Manual MVP test cases are listed in [`TEST_SCENARIOS.md`](./TEST_SCENARIOS.md).

## Environment Variables

The app works with defaults, but you can override them in `.env.local`.

```bash
UPLOAD_DIR=uploads
OUTPUT_DIR=outputs
MAX_FILE_SIZE_BYTES=104857600
CONVERSION_TIMEOUT_SECONDS=300
CLEANUP_INTERVAL_MINUTES=10
JOB_RETENTION_MINUTES=60
MAX_CONCURRENT_CONVERSIONS=3
IP_CONVERSION_LIMIT_MAX_FILES=3
IP_CONVERSION_LIMIT_WINDOW_MINUTES=30
# IP_CONVERSION_LIMIT_WINDOW_SECONDS=1800
POST_DOWNLOAD_CLEANUP_SECONDS=8
CALIBRE_BINARY=/usr/bin/ebook-convert
```

`UPLOAD_DIR`

Directory where uploaded EPUB files are stored. Default: `uploads`.

`OUTPUT_DIR`

Directory where generated PDF files are stored. Default: `outputs`.

`MAX_FILE_SIZE_BYTES`

Maximum accepted upload size in bytes. Default: `104857600`, which is 100 MB.

`CONVERSION_TIMEOUT_SECONDS`

Maximum time a single Calibre conversion may run before the app kills it. Default: `300`.

`CLEANUP_INTERVAL_MINUTES`

How often the background cleanup task checks for abandoned old files. Default: `10`.

`JOB_RETENTION_MINUTES`

How long abandoned uploads and outputs can remain before retention cleanup deletes them. Default: `60`.

`MAX_CONCURRENT_CONVERSIONS`

How many conversions can run at the same time in the local queue. Default: `3`.

`IP_CONVERSION_LIMIT_MAX_FILES`

How many EPUB conversion jobs one client IP can start during the rate-limit window. Default: `3`.

`IP_CONVERSION_LIMIT_WINDOW_MINUTES`

How long a client IP must wait before its conversion limit resets. Default: `30`.

`IP_CONVERSION_LIMIT_WINDOW_SECONDS`

Optional override for the same wait duration in seconds. If this is set, it takes priority over `IP_CONVERSION_LIMIT_WINDOW_MINUTES`. Useful for testing, for example `IP_CONVERSION_LIMIT_WINDOW_SECONDS=60`.

`POST_DOWNLOAD_CLEANUP_SECONDS`

After a successful PDF download stream closes, the app waits this many seconds, then deletes the uploaded EPUB, generated PDF, and in-memory job record. Default: `8`.

`CALIBRE_BINARY`

Optional absolute path to `ebook-convert`. Use this when Calibre is installed but not available in the server process `PATH`.

## How The App Works

1. The user selects up to three `.epub` files and PDF settings in the browser.
2. The frontend posts multipart form data to `POST /api/convert`.
3. The server validates the file extension, MIME type where available, and size.
4. The server stores the upload using a UUID filename, not the original filename.
5. A local in-memory job is created with a timestamped download name based on the original EPUB name.
6. The queue runs Calibre with `spawn`, using safe CLI arguments instead of shell command strings.
7. The frontend polls `GET /api/jobs/:id`.
8. When the job is complete, the frontend shows a download button.
9. `GET /api/download/:id` streams the PDF.
10. After the download stream closes, the app deletes the uploaded EPUB and generated PDF after 8 seconds by default.

## PDF Settings

The UI currently supports:

- Page size: `A4`, `Letter`, or `Original where possible`
- Margins: `Small`, `Medium`, or `Large`
- Embed fonts
- Preserve cover aspect ratio
- Preserve images
- Optional font family override
- Optional base font size override

For Calibre, `original` currently falls back to A4 when building the PDF command because `ebook-convert` requires a concrete paper size for normal PDF output.

## API Routes

`POST /api/convert`

Accepts multipart form data.

Required field:

- `file`: the `.epub` upload

Optional fields:

- `pageSize`: `a4`, `letter`, or `original`
- `marginPreset`: `small`, `medium`, or `large`
- `embedFonts`: `true` or `false`
- `preserveCoverAspectRatio`: `true` or `false`
- `preserveImages`: `true` or `false`
- `fontFamily`: optional string
- `fontSize`: optional number from 6 to 48

Successful response:

```json
{
  "jobId": "abc123",
  "status": "queued"
}
```

`GET /api/jobs/:id`

Returns job status.

Example complete response:

```json
{
  "id": "abc123",
  "status": "complete",
  "downloadUrl": "/api/download/abc123"
}
```

`GET /api/download/:id`

Streams the generated PDF if the job is complete.

Response headers:

```txt
Content-Type: application/pdf
Content-Disposition: attachment; filename="Original Book Name-20260705T221455Z.pdf"
```

## Project Structure

```txt
epub-to-pdf/
  package.json
  README.md
  TEST_SCENARIOS.md
  .env.example
  nginx/
    epub-to-pdf.conf
    README.md
  src/
    app/
      page.tsx
      layout.tsx
      globals.css
      api/
        convert/
          route.ts
        jobs/
          [id]/
            route.ts
        download/
          [id]/
            route.ts
    components/
      UploadForm.tsx
      ConversionSettings.tsx
      ProgressStatus.tsx
      DownloadResult.tsx
    lib/
      conversion/
        convertEpubToPdf.ts
        buildCalibreArgs.ts
        validateEpub.ts
        extractMetadata.ts
      jobs/
        jobStore.ts
      files/
        paths.ts
        cleanup.ts
        safeFilename.ts
    types/
      conversion.ts
  uploads/
  outputs/
```

## Main Components

`src/app/page.tsx`

Main app page. It renders the product intro and upload/conversion tool.

`src/components/UploadForm.tsx`

Client component that handles file selection, client-side validation, upload submission, polling, and displaying results.

`src/components/ConversionSettings.tsx`

Settings controls for page size, margins, font options, cover preservation, and image preservation.

`src/components/ProgressStatus.tsx`

Displays upload, queue, conversion, complete, and failed states.

`src/components/DownloadResult.tsx`

Shows the PDF download button when conversion completes.

## Backend Modules

`src/lib/conversion/buildCalibreArgs.ts`

Builds a safe array of Calibre CLI arguments. It never creates a raw shell command string.

`src/lib/conversion/convertEpubToPdf.ts`

Runs `ebook-convert` with `spawn`, captures errors, and enforces the conversion timeout.

`src/lib/conversion/validateEpub.ts`

Validates filename extension and upload size.

`src/lib/jobs/jobStore.ts`

Provides the local in-memory queue and job store. In development, it stores data on `globalThis` so multiple API route modules can see the same jobs.

`src/lib/files/paths.ts`

Resolves upload and output directories and creates safe UUID-based file paths.

`src/lib/files/cleanup.ts`

Deletes old temporary files on a retention schedule and deletes downloaded job files after the download closes.

`src/lib/files/safeFilename.ts`

Sanitizes original filenames for validation and display purposes. The app still stores files by UUID.

## Security Notes

- Uploads are stored outside `public`.
- Outputs are stored outside `public`.
- PDFs are only exposed through `GET /api/download/:id`.
- User-provided paths are never trusted.
- Stored filenames use UUIDs.
- Download filenames use the sanitized original EPUB name plus a timestamp.
- Calibre is called with `spawn`, not `exec`.
- CLI arguments are passed as an array, not interpolated into a shell string.
- Invalid file types, empty files, and oversized files are rejected.
- A client IP can start up to 3 conversions per 30-minute window by default.
- DRM bypass is not supported.
- Conversion errors are logged server-side, while user-facing messages remain generic.

## Troubleshooting

### Calibre was not found

Error:

```txt
Calibre ebook-convert was not found. Install Calibre and make sure it is available in PATH.
```

Fix:

```bash
sudo apt update
sudo apt install calibre
ebook-convert --version
```

Then restart the dev server:

```bash
npm run dev
```

If `ebook-convert` exists but the app still cannot find it, set:

```bash
CALIBRE_BINARY=/absolute/path/to/ebook-convert
```

### Job polling returns 404

Restart the dev server and retry with a fresh upload:

```bash
npm run dev
```

The local MVP job store is in-memory. Jobs disappear when the server process restarts.

### Conversion times out

Increase:

```bash
CONVERSION_TIMEOUT_SECONDS=600
```

Then restart the dev server.

### Download returns output file missing

The generated PDF may have already been cleaned up. Convert the EPUB again.

## Known Limitations

- Reflowable EPUBs are repaginated into the selected PDF size.
- Exact page matching with every EPUB reader is not guaranteed.
- Fixed-layout EPUB fidelity depends on Calibre support for the specific EPUB.
- The MVP uses a local in-memory queue, so jobs do not survive process restarts.
- The MVP uses local disk storage, not cloud storage.
- Batch conversion is not implemented yet.
- Metadata and cover preview are not implemented yet.

## Phase 2 Ideas

- Metadata preview before conversion
- Cover image preview
- Table of contents preview
- Custom margins
- Page orientation
- Batch conversion
- Conversion history
- Authentication
- Cloud storage
- BullMQ and Redis queue
- Docker deployment
- Playwright-based renderer for controlled HTML/CSS output
- Fixed-layout EPUB detection

## Phase 3 High-Fidelity Renderer

A custom conversion engine could:

1. Unzip the EPUB.
2. Parse `META-INF/container.xml`.
3. Locate the OPF package file.
4. Parse spine order.
5. Extract manifest items.
6. Load XHTML chapters in spine order.
7. Resolve CSS, images, and fonts.
8. Detect fixed-layout metadata such as `rendition:layout`, `rendition:orientation`, and `rendition:spread`.
9. Render with Playwright or WeasyPrint.
10. Generate PDF bookmarks and metadata.
