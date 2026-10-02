/**
 * StreamBox Google Drive Authentication Layer
 * Implements server-side Service Account authentication using googleapis.
 * Handles token lifecycle, credential caching, and permission diagnostic checks.
 */

import { google } from "googleapis";

// Use the JWT type from googleapis' own bundled auth library to avoid type conflicts
type JWT = InstanceType<typeof google.auth.JWT>;
import { requireDriveConfig, getEnvConfig } from "@/lib/config/env";

// Minimum appropriate read-only scope for listing and streaming Drive video files
export const DRIVE_SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
] as const;

let cachedJwtClient: JWT | null = null;
let cachedClientEmail: string | null = null;
let cachedPrivateKeyHash: string | null = null;

/**
 * Returns an authenticated JWT client for Google Drive API.
 * Reuses the existing client instance if configuration hasn't changed.
 */
export async function getServiceAccountAuth(): Promise<JWT> {
  const config = requireDriveConfig();

  // Simple cache key based on email and key length to detect changes without leaking key contents
  const currentKeyHash = `${config.clientEmail}:${config.privateKey.length}`;

  if (cachedJwtClient && cachedClientEmail === config.clientEmail && cachedPrivateKeyHash === currentKeyHash) {
    return cachedJwtClient;
  }

  try {
    const jwtClient = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: [...DRIVE_SCOPES],
    });

    // Validate authentication by pre-fetching credentials
    await jwtClient.authorize();

    cachedJwtClient = jwtClient;
    cachedClientEmail = config.clientEmail;
    cachedPrivateKeyHash = currentKeyHash;

    return jwtClient;
  } catch (error: unknown) {
    cachedJwtClient = null;
    const msg = error instanceof Error ? error.message : String(error);
    
    if (msg.includes("invalid_grant") || msg.includes("PEM routines") || msg.includes("bad decrypt")) {
      throw new Error(
        "Google Authentication Failed: The GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL is invalid. Ensure the private key includes the header and footer."
      );
    }
    
    throw new Error(`Google Drive Authentication Error: ${msg}`);
  }
}

/**
 * Diagnostic check to verify Drive credentials and folder accessibility.
 * Returns actionable advice if the folder cannot be accessed.
 */
export async function verifyDriveAccess(): Promise<{
  ok: boolean;
  status: "configured" | "mock_mode" | "error";
  folderId?: string;
  clientEmail?: string;
  errorMessage?: string;
  remediation?: string;
}> {
  const envResult = getEnvConfig();

  if (envResult.config?.isMockMode) {
    return {
      ok: true,
      status: "mock_mode",
      folderId: envResult.config.folderId || "mock-drive-folder",
    };
  }

  if (!envResult.isValid || !envResult.config) {
    return {
      ok: false,
      status: "error",
      errorMessage: envResult.errors.join("; "),
      remediation: "Configure GOOGLE_DRIVE_FOLDER_ID, GOOGLE_CLIENT_EMAIL, and GOOGLE_PRIVATE_KEY in .env.local",
    };
  }

  try {
    const auth = await getServiceAccountAuth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const drive = google.drive({ version: "v3", auth: auth as any });

    // Probe the target folder to verify permissions
    const res = await drive.files.get({
      fileId: envResult.config.folderId,
      fields: "id, name, mimeType, capabilities(canListChildren, canDownload)",
      supportsAllDrives: true,
    });

    const folder = res.data;
    if (folder.mimeType !== "application/vnd.google-apps.folder") {
      return {
        ok: false,
        status: "error",
        errorMessage: `The specified ID "${envResult.config.folderId}" is a ${folder.mimeType}, not a Google Drive folder.`,
        remediation: "Ensure GOOGLE_DRIVE_FOLDER_ID points to a folder, not a regular file.",
      };
    }

    return {
      ok: true,
      status: "configured",
      folderId: folder.id || undefined,
      clientEmail: envResult.config.clientEmail,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    let remediation = "Ensure the service account email is shared with 'Viewer' permissions on the Google Drive folder.";

    if (msg.includes("404") || msg.includes("File not found")) {
      remediation = `Google Drive returned 404. Either the folder ID is incorrect, or the folder was not shared with '${envResult.config.clientEmail}'. In Google Drive, open the folder -> Share -> add the service account email with Viewer access.`;
    } else if (msg.includes("403")) {
      remediation = `Access denied (403). Your Google Workspace organization policy might restrict sharing outside your domain. If using a personal account, ensure link sharing or direct Viewer access is granted to ${envResult.config.clientEmail}.`;
    }

    return {
      ok: false,
      status: "error",
      errorMessage: msg,
      remediation,
      folderId: envResult.config.folderId,
      clientEmail: envResult.config.clientEmail,
    };
  }
}
