# StreamBox Project Context & Work Log

## 1. Project Overview
StreamBox is a minimalist, Netflix-inspired video streaming web application built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Google Drive API v3**.

### Core Philosophy
- **Google Drive is the single source of truth**: No videos are manually registered in frontend databases or configuration arrays.
- All videos reside inside one configured Google Drive folder (`GOOGLE_DRIVE_FOLDER_ID`).
- Video discovery, renaming, and removal in Google Drive are automatically detected and reflected in the frontend library upon synchronization.
- Streaming utilizes the **HTML5 native Video API** with **HTTP Range request streaming (RFC 7233)**, avoiding full file downloads into browser memory.

---

## 2. Backend Services & Folder Synchronization Logic

### Data Flow & Architecture
1. **Drive Storage (Single Source of Truth)**
   - Video files (`.mp4`, `.webm`, `.mkv`, etc.) are uploaded, renamed, or trashed directly in the user's Google Drive folder.
2. **Backend Discovery Service (`lib/drive/files.ts` & `lib/videos/service.ts`)**
   - Discovers files using `drive.files.list` with query:
     `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`
   - Complete pagination loop handling `nextPageToken` ensures no video is truncated.
   - Normalizes Google Drive metadata into the unified `Video` interface (`lib/videos/normalize.ts`).
3. **Lightweight Metadata Cache (`lib/videos/cache.ts`)**
   - In-memory cache with 15,000ms TTL (`METADATA_CACHE_TTL_MS`).
   - In-flight request deduplication prevents thundering herd on concurrent incoming requests.
   - Stale-on-error fallback: If a transient Google API 5xx or rate limit occurs, existing valid cached records are preserved rather than wiping the library.
4. **Security & Access Control (`lib/security/access.ts`)**
   - Validates file ID format.
   - Verifies direct folder membership (file must have configured folder ID in its `parents`).
   - Verifies file is not trashed and is an active video MIME type.
   - Verifies `capabilities.canDownload !== false`.
5. **Secure HTTP Range Video Streaming (`lib/drive/stream.ts` & `/api/videos/[id]/stream`)**
   - `export const runtime = "nodejs";`
   - Parses RFC 7233 `Range: bytes=start-end`.
   - Direct incremental streaming from Google Drive via `responseType: "stream"`.
   - Converts Node.js readable stream to standard Web `ReadableStream` chunk-by-chunk.
   - Supports 200 OK, 206 Partial Content, and 416 Range Not Satisfiable.
   - Zero full-file buffering in Node.js memory.
   - Propagates client cancellation (`AbortSignal`) to abort upstream Google Drive transfer.
6. **Thumbnail Proxy (`lib/drive/thumbnail.ts` & `/api/videos/[id]/thumbnail`)**
   - Fetches high-res thumbnail variant from Google Drive or redirects safely.
   - Gracefully falls back to local SVG poster (`/images/placeholder-poster.svg`) for new uploads while Google processes thumbnails.
7. **Frontend Synchronization (`useVideos` Hook via SWR)**
   - **Continuous Polling**: Polls every 30 seconds while the browser tab is active.
   - **Focus Revalidation**: Re-scans when the user switches back to the tab.
   - **Network Restoration**: Re-syncs immediately upon reconnecting to the internet.
   - **Stale-While-Revalidate**: Keeps previously loaded cards visible during background refresh to prevent layout shifts.

---

## 3. Endpoints Implemented

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | GET | Health status, timestamp, and active mode (mock or google_drive). |
| `/api/videos` | GET | Normalized list of videos from the Google Drive folder. |
| `/api/videos/:id` | GET | Single video metadata record with security checks. |
| `/api/videos/:id/thumbnail` | GET | Thumbnail proxy with fallback to local SVG placeholder. |
| `/api/videos/:id/stream` | GET | RFC 7233 HTTP Range streaming endpoint. |
| `/api/diagnostic` | GET | Non-sensitive diagnostic check for Drive folder permissions. |
| `/api/tests` | GET | Automated test runner verifying all 18 backend specifications. |

---

## 4. Current Project Status

- **Status**: Complete Full-Stack Implementation (Frontend + Backend).
- **Backend Packages**: `googleapis`, `google-auth-library`.
- **Frontend Architecture**: Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React, SWR.
- **Verification**: All 18 backend verification tests passing (`/api/tests`).
