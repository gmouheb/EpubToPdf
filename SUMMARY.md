# Project Summary

## What Was Built

This project is a Next.js TypeScript EPUB-to-PDF converter. Users can upload an `.epub` file, choose PDF settings, track conversion progress, and download the generated PDF.

The conversion backend uses Calibre's `ebook-convert` through Node's `spawn`, with safe CLI argument construction instead of shell command strings.

## Core Features

- EPUB upload with client-side and server-side validation
- 100 MB default upload limit
- PDF settings for:
  - Page size: A4, Letter, Original where possible
  - Margins: Small, Medium, Large
  - Embedded fonts
  - Cover aspect ratio preservation
  - Image preservation
  - Optional font family override
  - Optional font size override
- Local in-memory conversion queue
- Job polling API
- Controlled PDF download API
- Friendly conversion success and error states
- Temporary file cleanup

## Backend Work

Implemented or completed:

- `POST /api/convert`
- `GET /api/jobs/[id]`
- `GET /api/download/[id]`
- Calibre argument builder
- Calibre conversion wrapper with timeout
- EPUB validation
- Safe upload and output paths
- UUID-based internal file storage
- Local in-memory job store using `globalThis` for dev stability
- Cleanup of abandoned files
- Cleanup shortly after successful download

Important backend behavior:

- Uploads and outputs are stored outside `public`.
- Internal filenames use UUIDs.
- Download filenames use the sanitized original EPUB name plus a timestamp.
- DRM bypass is not supported.
- Backend conversion logic was kept unchanged during the final frontend polish pass.

## Frontend Work

The UI was redesigned into a polished document utility experience.

Added:

- Modern centered landing page
- Strong headline and clear product copy
- Drag-and-drop upload area
- File picker fallback
- Selected file name and file size display
- Remove selected file action
- Clear validation messages
- Grouped settings UI:
  - Page setup
  - Typography
  - Output quality
- Progress steps:
  - Uploading
  - Preparing
  - Converting
  - Finalizing
  - Complete
- Success state with large download button
- Convert another book action
- Friendly error state with try again
- Responsive desktop, tablet, and mobile styling
- Footer credit with LinkedIn link for Mouheb Ghabri

New modular components include:

- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`
- `src/components/ui/Checkbox.tsx`
- `src/components/ui/Alert.tsx`
- `src/components/ui/ProgressSteps.tsx`
- `src/components/UploadDropzone.tsx`
- `src/components/ConversionSettingsPanel.tsx`
- `src/components/ConversionProgress.tsx`
- `src/components/ConversionResult.tsx`
- `src/components/ConversionError.tsx`

## File Cleanup Behavior

The app now has two cleanup paths:

1. Retention cleanup for abandoned files, controlled by:

```env
CLEANUP_INTERVAL_MINUTES=10
JOB_RETENTION_MINUTES=60
```

2. Post-download cleanup:

```env
POST_DOWNLOAD_CLEANUP_SECONDS=8
```

After a successful PDF download stream closes, the app waits 8 seconds by default, then deletes the uploaded EPUB, generated PDF, and in-memory job record.

## Download Naming

The app keeps UUIDs for internal storage, but downloaded PDFs use the original EPUB name plus a timestamp.

Example:

```txt
Original upload: My Book.epub
Downloaded file: My Book-20260705T221455Z.pdf
```

## Deployment Work

Added an `nginx/` directory for production deployment:

- `nginx/epub-to-pdf.conf`
- `nginx/README.md`

The Nginx config reverse-proxies to the Next.js app on `127.0.0.1:3000`, supports 100 MB uploads, and includes longer proxy timeouts.

## Documentation

Created or updated:

- `README.md`
- `TEST_SCENARIOS.md`
- `SUMMARY.md`
- `.env.example`
- `.gitignore`

The README now explains:

- Installing Calibre
- Verifying `ebook-convert`
- Installing dependencies
- Running dev and production builds
- Environment variables
- API routes
- Component structure
- Backend modules
- Nginx deployment
- Troubleshooting
- Known limitations

## Important Limitations

- Reflowable EPUBs are repaginated into the selected PDF page size.
- Exact layout matching with every EPUB reader is not guaranteed.
- Fixed-layout fidelity depends on Calibre support for the source EPUB.
- Jobs are stored in memory and do not survive process restarts.
- Storage is local disk only.
- Batch conversion is not implemented.
- Metadata, cover, and table of contents previews are not implemented yet.

## Verification

The app was repeatedly checked with:

```bash
npm run build
```

Final frontend build passed successfully.

Earlier API smoke checks also verified:

- Missing upload returns `400`
- Unknown job returns `404`
- Home page returns `200`

Calibre conversion itself requires `ebook-convert` to be installed and available on the machine running the app.
