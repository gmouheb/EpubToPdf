# EPUB-to-PDF Test Scenarios

Use these scenarios to validate the MVP manually during development. Start the app with `npm run dev` and make sure Calibre is installed:

```bash
ebook-convert --version
```

## Happy Path

1. Upload a valid `.epub` under 100 MB.
2. Select `A4`, `Medium` margins, `Embed fonts`, and `Preserve cover aspect ratio`.
3. Click `Convert`.
4. Confirm the status moves through `Uploading`, `Queued` or `Converting`, then `Complete`.
5. Click `Download PDF`.
6. Open the PDF and confirm the cover, images, table of contents, and readable text are present.

Expected result: A downloadable PDF is returned from `/api/download/:id`.

## Page Size Options

1. Convert the same EPUB with `A4`.
2. Convert it again with `Letter`.
3. Compare PDF page dimensions in a PDF viewer.

Expected result: The PDF page size matches the selected option. Reflowable EPUB content may be repaginated.

## Margin Presets

1. Convert the same EPUB with `Small` margins.
2. Convert it again with `Large` margins.
3. Compare visible page whitespace.

Expected result: Large margins create visibly more whitespace than small margins.

## Font Options

1. Convert with `Embed fonts` enabled.
2. Convert with `Embed fonts` disabled.
3. Convert with a font family override, such as `DejaVu Serif`.
4. Convert with a font size override, such as `14`.

Expected result: Conversion succeeds. Font overrides are passed to Calibre when provided.

## Cover Preservation

1. Convert an EPUB that has a cover image.
2. Enable `Preserve cover aspect ratio`.
3. Download the PDF and inspect the first pages.

Expected result: The cover is included and not deliberately stretched by the app settings.

## Invalid File Extension

1. Upload a `.txt`, `.pdf`, `.zip`, or renamed non-EPUB file.
2. Click `Convert`.

Expected result: The app rejects the file with a readable validation error.

## Empty File

1. Create an empty file:

```bash
touch empty.epub
```

2. Upload `empty.epub`.

Expected result: The app rejects the file as empty.

## File Too Large

1. Create a file larger than 100 MB:

```bash
fallocate -l 101M too-large.epub
```

2. Upload `too-large.epub`.

Expected result: The app rejects the file as too large.

## Missing Calibre

1. Temporarily set an invalid Calibre path in `.env.local`:

```bash
CALIBRE_BINARY=/missing/ebook-convert
```

2. Restart `npm run dev`.
3. Upload a valid EPUB and convert.

Expected result: The job fails with a user-facing message that Calibre was not found.

## Conversion Timeout

1. Set a very short timeout in `.env.local`:

```bash
CONVERSION_TIMEOUT_SECONDS=1
```

2. Restart `npm run dev`.
3. Upload a large valid EPUB.

Expected result: The job fails with a timeout message.

## Job Polling

1. Start a conversion.
2. Watch the browser network tab for `/api/jobs/:id`.

Expected result: Polling returns `queued`, `converting`, `complete`, or `failed`. It should not return `404` for a newly created job in the same server process.

## Unknown Job

Run:

```bash
curl -i http://localhost:3000/api/jobs/not-a-real-job
```

Expected result: HTTP `404` with `{"error":"Job not found."}`.

## Download Before Complete

1. Start a conversion.
2. Before it finishes, request:

```bash
curl -i http://localhost:3000/api/download/JOB_ID
```

Expected result: HTTP `409` with `{"error":"PDF is not ready."}`.

## Missing Upload Field

Run:

```bash
curl -i -X POST http://localhost:3000/api/convert
```

Expected result: HTTP `400` with `{"error":"Missing EPUB file."}`.

## Path Traversal Filename

1. Upload an EPUB with a suspicious original name such as `../../book.epub`.
2. Convert it.
3. Inspect `uploads/` and `outputs/`.

Expected result: Stored files use UUID names and never trust the original filename as a path.

## Temporary File Cleanup

1. Convert an EPUB successfully.
2. Download the PDF.
3. Wait at least 8 seconds.
4. Inspect `uploads/` and `outputs/`.

Expected result: The downloaded job's EPUB and PDF files are deleted shortly after the download stream closes.

## Retention Cleanup

1. Set short cleanup values in `.env.local`:

```bash
CLEANUP_INTERVAL_MINUTES=1
JOB_RETENTION_MINUTES=1
```

2. Restart `npm run dev`.
3. Convert an EPUB.
4. Wait a few minutes and inspect `uploads/` and `outputs/`.

Expected result: Old temporary files are deleted after the retention period.

## Reflowable EPUB Limitation

1. Convert a known reflowable EPUB.
2. Compare the PDF to the same book in an EPUB reader.

Expected result: The content is present, but pagination/layout may differ because reflowable EPUBs are repaginated into the selected PDF size.

## Fixed-Layout EPUB

1. Convert a known fixed-layout EPUB.
2. Inspect image placement, page order, and text positioning.

Expected result: Layout fidelity should be high when Calibre supports the source EPUB well.
