# StreamBox — Google Drive Video Streaming Platform

StreamBox is a minimalist, Netflix-inspired video streaming web application built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.

In StreamBox, **Google Drive is the single source of truth** for your video library. Newly uploaded, renamed, or deleted videos in your configured Google Drive folder appear, update, and disappear automatically through continuous synchronization.

---

## Table of Contents
1. [Architecture & Features](#architecture--features)
2. [Setup Guide: Google Cloud & Drive](#setup-guide-google-cloud--drive)
   - [Step 1: Create a Google Cloud Project](#1-create-a-google-cloud-project)
   - [Step 2: Enable the Google Drive API](#2-enable-the-google-drive-api)
   - [Step 3: Create a Service Account](#3-create-a-service-account)
   - [Step 4: Generate a Service Account Key](#4-generate-a-service-account-key)
   - [Step 5: Share the Drive Folder with the Service Account](#5-share-the-drive-folder-with-the-service-account)
   - [Step 6: Obtain GOOGLE_DRIVE_FOLDER_ID](#6-obtain-google_drive_folder_id)
3. [Environment Configuration (.env.local)](#environment-configuration)
4. [Running the Application](#running-the-application)
5. [Testing & Verification](#testing--verification)
   - [Testing GET /api/videos](#testing-get-apivideos)
   - [Testing Thumbnail Endpoint](#testing-thumbnail-endpoint)
   - [Testing HTTP Range Streaming](#testing-http-range-streaming)
   - [Automated Backend Test Suite](#automated-backend-test-suite)
6. [How Automatic Synchronization Works](#how-automatic-synchronization-works)
7. [Troubleshooting Guide](#troubleshooting-guide)
   - [Permissions & 404 Errors](#permissions--404-errors)
   - [Authentication & Invalid Grant Errors](#authentication--invalid-grant-errors)
   - [Video Playback & Buffering](#video-playback--buffering)
   - [Switching Between Mock and Real Google Drive Mode](#switching-between-mock-and-real-mode)

---

## Architecture & Features

- **Google Drive as Single Source of Truth**: No database, no manual video registration, no redeployments. Drop an MP4, WebM, or MKV file into your Drive folder, and it appears automatically in StreamBox.
- **Continuous Synchronization**: SWR 30-second background polling combined with a 15-second server-side metadata cache.
- **Secure RFC 7233 HTTP Range Streaming**: Supports instant seeking and pause/resume without loading entire video files into Node.js server memory.
- **Zero Client-Side Credentials**: Google service account credentials stay strictly server-side.
- **Netflix-Inspired Minimalist Interface**: Dark `#101014` palette, StreamBox red `#EF3B4F` accent, custom HTML5 player controls with scrub preview.

---

## Setup Guide: Google Cloud & Drive

### 1. Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown in the top header and click **New Project**.
3. Name your project (e.g. `streambox-streaming`) and click **Create**.

### 2. Enable the Google Drive API
1. In your project dashboard, navigate to **APIs & Services > Library**.
2. Search for **Google Drive API**.
3. Click on **Google Drive API** and click **Enable**.

### 3. Create a Service Account
1. Go to **APIs & Services > Credentials**.
2. Click **Create Credentials > Service Account**.
3. Enter a Service Account Name (e.g. `streambox-sync`) and click **Create and Continue**.
4. Role assignment is optional since access will be granted directly at the folder level. Click **Continue**, then **Done**.
5. Copy the generated **Email Address** (e.g., `streambox-sync@your-project.iam.gserviceaccount.com`).

### 4. Generate a Service Account Key
1. In the **Credentials** page, click on the newly created Service Account.
2. Go to the **Keys** tab and click **Add Key > Create new key**.
3. Select **JSON** and click **Create**.
4. The private key JSON file will download to your machine. Open it to find:
   - `client_email`
   - `private_key`

### 5. Share the Drive Folder with the Service Account
1. Open [Google Drive](https://drive.google.com/).
2. Create or select the folder where you want all StreamBox videos stored (e.g., `StreamBox Videos`).
3. Right-click the folder and select **Share**.
4. Paste the **Service Account Email** (`streambox-sync@...`).
5. Set permission to **Viewer** (StreamBox only requires read access).
6. Uncheck "Notify people" and click **Share**.

### 6. Obtain GOOGLE_DRIVE_FOLDER_ID
1. Open the folder in Google Drive.
2. Look at the browser URL:
   `https://drive.google.com/drive/folders/1aBcD_EFGhIjKlMnOpQrStUvWxYz12345`
3. The string after `folders/` (`1aBcD_EFGhIjKlMnOpQrStUvWxYz12345`) is your `GOOGLE_DRIVE_FOLDER_ID`.

---

## Environment Configuration

Create a `.env.local` file in the project root:

```env
# Disable mock mode to connect directly to your live Google Drive folder
NEXT_PUBLIC_USE_MOCK_DATA="false"

# Your Google Drive Folder ID
GOOGLE_DRIVE_FOLDER_ID="1aBcD_EFGhIjKlMnOpQrStUvWxYz12345"

# Service Account Email from Google Cloud Console
GOOGLE_CLIENT_EMAIL="streambox-sync@your-project.iam.gserviceaccount.com"

# Service Account Private Key (Keep escaped \n or wrap in quotes)
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...\n-----END PRIVATE KEY-----\n"

# Metadata Cache TTL in milliseconds (default: 15 seconds)
METADATA_CACHE_TTL_MS=15000
```

---

## Running the Application

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

---

## Testing & Verification

### Testing GET /api/videos
Check the normalized video library:
```bash
curl -s http://localhost:3000/api/videos | jq .
```
Expected output:
```json
{
  "videos": [
    {
      "id": "1xyz...",
      "title": "Cosmos Exploration",
      "thumbnail": "/api/videos/1xyz.../thumbnail",
      "streamUrl": "/api/videos/1xyz.../stream",
      "duration": 596,
      "size": 158000000,
      "mimeType": "video/mp4",
      "createdAt": "2026-09-28T14:20:00.000Z"
    }
  ],
  "total": 1,
  "fromCache": false,
  "isMock": false
}
```

### Testing Thumbnail Endpoint
```bash
curl -I http://localhost:3000/api/videos/<VIDEO_ID>/thumbnail
```
Returns `200 OK` with `Content-Type: image/jpeg` or redirects to a high-res thumbnail variant.

### Testing HTTP Range Streaming
Test partial content retrieval (first 1 MB):
```bash
curl -i -H "Range: bytes=0-1048575" http://localhost:3000/api/videos/<VIDEO_ID>/stream
```
Expected output:
```http
HTTP/1.1 206 Partial Content
Content-Type: video/mp4
Content-Range: bytes 0-1048575/158000000
Content-Length: 1048576
Accept-Ranges: bytes
```

### Automated Backend Test Suite
Visit `http://localhost:3000/api/tests` or run:
```bash
curl -s http://localhost:3000/api/tests | jq .
```
Executes all 18 backend verification tests (upload discovery, deletion sync, rename handling, malformed range requests, memory efficiency, zero-credential leakage).

---

## How Automatic Synchronization Works

```text
Upload/Rename/Delete in Google Drive Folder
                 │
                 ▼
Server Metadata Cache Expires (TTL: 15s)
                 │
                 ▼
Next Polling Request calls drive.files.list
                 │
                 ▼
Frontend SWR Polls (Interval: 30s)
                 │
                 ▼
Library UI Updates Automatically (Zero Redeployment)
```

1. Files are modified directly in Google Drive.
2. The backend cache expires after 15 seconds.
3. The frontend SWR hook queries `/api/videos` every 30 seconds while the tab is active, or immediately on tab focus/reconnect.
4. The UI reflects the new state seamlessly.

---

## Troubleshooting Guide

### Permissions & 404 Errors
- **Error**: `File not found` or `404` when accessing the folder.
- **Fix**: Verify that you shared the folder with the **Service Account Email** (`GOOGLE_CLIENT_EMAIL`) with at least **Viewer** access. In Google Drive, click **Share** on the folder and verify the email appears in the list.
- **Diagnostic Tool**: Visit `http://localhost:3000/api/diagnostic` to run an automated check on your folder permissions.

### Authentication & Invalid Grant Errors
- **Error**: `invalid_grant` or `PEM routines: get_name: no start line`.
- **Fix**: The `GOOGLE_PRIVATE_KEY` has formatting issues. Ensure the key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. If set in `.env.local`, ensure literal `\n` characters are properly escaped or enclosed in quotes.

### Video Playback & Buffering
- **Large Files**: HTTP Range streaming requests only the necessary byte ranges for the current viewport buffer.
- **Seeking**: The native HTML5 video player requests byte offsets directly matching playback timecodes.
- **Unsupported Formats**: Standard web browsers natively play H.264/AAC MP4 and WebM. For formats like MKV or AVI, ensure your browser has compatible decoders installed.

### Switching Between Mock and Real Mode
- **Test Mode**: Set `NEXT_PUBLIC_USE_MOCK_DATA="true"`. StreamBox will use the in-memory mock store and enable the **Drive Simulator Drawer** to simulate uploads, deletions, and renames without needing Google credentials.
- **Production Mode**: Set `NEXT_PUBLIC_USE_MOCK_DATA="false"` and configure `GOOGLE_DRIVE_FOLDER_ID`, `GOOGLE_CLIENT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.
