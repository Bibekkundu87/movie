# StreamBox System Architecture & Communication Patterns

This document outlines the complete architectural design, component hierarchy, service abstraction layers, and network communication patterns of StreamBox.

---

## 1. High-Level Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER (Next.js App)                       │
│                                                                        │
│   ┌─────────────────────┐               ┌───────────────────────────┐  │
│   │  Home Page View     │               │  Watch Page View          │  │
│   │  - Featured Video   │               │  - HTML5 <video> Element  │  │
│   │  - Search Filter    │               │  - Custom VideoControls   │  │
│   │  - Responsive Grid  │               │  - Drive Technical Audit  │  │
│   └──────────┬──────────┘               └─────────────┬─────────────┘  │
│              │                                        │                │
│              ▼                                        │                │
│   ┌────────────────────────────────┐                  │                │
│   │  useVideos Hook (SWR Cache)    │                  │                │
│   │  - 30s Polling Cycle           │                  │                │
│   │  - Focus/Reconnect Revalidate  │                  │                │
│   │  - Deterministic Sorting       │                  │                │
│   └──────────┬─────────────────────┘                  │                │
│              │                                        │                │
│              ▼                                        │                │
│   ┌───────────────────────────────────────────────────┴─────────────┐  │
│   │  Service Abstraction Layer (videoService)                       │  │
│   │  - Mock Mode Toggle (NEXT_PUBLIC_USE_MOCK_DATA)                 │  │
│   │  - In-Memory Mock Store (Simulation Events)                     │  │
│   └──────────┬──────────────────────────────────────────────────────┘  │
└──────────────┼─────────────────────────────────────────────────────────┘
               │ HTTP GET (JSON Metadata)
               │ HTTP Range (Media Stream RFC 7233)
               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVER TIER (Next.js Route Handlers)            │
│                                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  API Route Handlers:                                            │  │
│   │  - GET /api/videos             -> Video List Metadata           │  │
│   │  - GET /api/videos/:id         -> Single Video Metadata         │  │
│   │  - GET /api/videos/:id/thumb   -> Thumbnail Proxy / Fallback    │  │
│   │  - GET /api/videos/:id/stream  -> HTTP Range Streaming Proxy    │  │
│   │  - GET /api/health             -> Backend Health Status         │  │
│   │  - GET /api/diagnostic         -> Drive Permission Verifier     │  │
│   │  - GET /api/tests              -> 18-Point Test Suite Runner    │  │
│   └──────────────────┬──────────────────────────────────────────────┘  │
│                      │                                                 │
│                      ▼                                                 │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Backend Service & Security Core:                               │  │
│   │  - Metadata Cache (15s TTL, in-flight deduplication)            │  │
│   │  - Security Access Validator (Folder membership & permissions)  │  │
│   │  - Normalizer (Strips extension, builds canonical schema)       │  │
│   │  - Range Stream Engine (Node stream to Web stream chunking)     │  │
│   │  - Service Account JWT Auth (drive.readonly)                    │  │
│   └──────────────────┬──────────────────────────────────────────────┘  │
└──────────────────────┼─────────────────────────────────────────────────┘
                       │ Google Drive API (v3)
                       │ HTTPS Authorized JWT Requests
                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL STORAGE TIER                           │
│                                                                        │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  Target Google Drive Folder (Single Source of Truth)            │  │
│   │  - New uploads discovered automatically                         │  │
│   │  - Renamed files propagate updated titles                       │  │
│   │  - Deleted files vanish from library                            │  │
│   └─────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Communication & Execution Flow

### A. Automatic Library Synchronization Pattern
1. **Frontend Initialization**:
   - `useVideos()` hook mounts on the client and queries SWR with key `/api/videos`.
   - The SWR cache immediately serves any existing in-memory data (preventing layout shift) while validating against the backend in the background.
2. **Periodic Polling**:
   - Every 30 seconds (`refreshInterval: 30000`), SWR issues a background query to `GET /api/videos`.
   - On the backend, `videoMetadataCache` serves cached data if within the 15,000ms TTL.
   - Once expired, a single in-flight Promise queries Google Drive `drive.files.list` with query:
     `'<FOLDER_ID>' in parents and mimeType contains 'video/' and trashed = false`
   - Files are normalized into the standard `Video` interface, cached, and returned to the client.
   - If Google Drive contents have changed (file added, removed, or renamed), the response updates the React state smoothly without flashing.
3. **Resilience & Stale-on-Error**:
   - If Google Drive encounters transient rate limits (HTTP 429) or temporary 5xx errors, the metadata cache retains previously verified records rather than returning an empty library or breaking the user experience.

### B. Video Playback & HTTP Range Streaming Pattern
1. **Source Resolution**:
   - The watch page accesses the target video's `streamUrl` (`/api/videos/:id/stream`).
2. **Metadata-First Loading (`preload="metadata"`)**:
   - The native `<video>` element only requests the first few kilobytes containing the MP4 `moov` atom / index headers.
   - Entire videos are **never** buffered into JavaScript memory as Blob objects.
3. **HTTP Range Requests (RFC 7233)**:
   - When the user seeks to minute 5, the browser sends:
     ```http
     GET /api/videos/abc123/stream HTTP/1.1
     Range: bytes=41943040-52428800
     ```
   - The backend validates:
     1. Video ID format.
     2. Folder membership (file must reside in `GOOGLE_DRIVE_FOLDER_ID`).
     3. Not trashed, video MIME type, download permitted.
   - The backend forwards the byte range to Google Drive:
     ```typescript
     const upstream = await drive.files.get(
       { fileId, alt: "media" },
       { responseType: "stream", headers: { Range: "bytes=41943040-52428800" }, signal }
     );
     ```
   - Upstream chunks are converted to a Web `ReadableStream` and piped directly to the client with `206 Partial Content` and `Content-Range: bytes 41943040-52428800/104857600`.
   - When the client pauses or seeks away, the `AbortSignal` destroys the upstream stream to preserve bandwidth.

---

## 3. Normalized Video Contract

All endpoints adhere to this strict TypeScript contract:

```typescript
export interface Video {
  id: string;               // Stable Google Drive File ID
  title: string;            // Clean title (stripped of file extensions)
  description?: string;     // Drive file description
  thumbnail: string;        // Proxy endpoint (/api/videos/:id/thumbnail)
  streamUrl: string;        // Playable HTTP Range video endpoint (/api/videos/:id/stream)
  duration?: number;        // Total seconds (from videoMediaMetadata.durationMillis)
  size?: number;            // Total file bytes
  mimeType?: string;        // e.g. "video/mp4", "video/webm"
  createdAt?: string;       // ISO 8601 upload timestamp
  updatedAt?: string;       // ISO 8601 last modified timestamp
}
```

---

## 4. Security Architecture

1. **Zero Client-Side Credentials**:
   - Neither Google Drive Service Account JSON keys nor access tokens are ever imported or referenced in client-side components (`NEXT_PUBLIC_` is never used for secrets).
2. **Access Control & Folder Containment**:
   - The security layer (`lib/security/access.ts`) enforces folder containment: a user cannot request an arbitrary Google Drive file by guessing its ID; the server verifies the file has `GOOGLE_DRIVE_FOLDER_ID` in its parents array.
3. **No Arbitrary Proxying**:
   - Thumbnail proxy requests only fetch verified image assets associated with legitimate files in the configured folder.
