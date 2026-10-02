/**
 * StreamBox Google Drive Client Provider
 * Instantiates and exports the Drive v3 API client instance.
 */

import { google, drive_v3 } from "googleapis";
import { getServiceAccountAuth } from "./auth";

/**
 * Returns a configured Google Drive v3 client instance.
 * Reuses the authenticated JWT client.
 */
export async function getDriveClient(): Promise<drive_v3.Drive> {
  const auth = await getServiceAccountAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return google.drive({ version: "v3", auth: auth as any });
}
