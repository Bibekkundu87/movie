/**
 * StreamBox Backend Configuration & Environment Validation
 * Validates Google Drive API credentials, folder ID, and cache settings.
 */

export interface DriveConfig {
  folderId: string;
  clientEmail: string;
  privateKey: string;
  cacheTtlMs: number;
  isMockMode: boolean;
}

export interface EnvValidationResult {
  isValid: boolean;
  isConfigured: boolean;
  errors: string[];
  config?: DriveConfig;
}

/**
 * Parses and sanitizes a Google Service Account private key.
 * Correctly unescapes literal \n characters common in environment variables.
 */
export function sanitizePrivateKey(rawKey?: string): string {
  if (!rawKey) return "";
  let key = rawKey.trim();
  // Strip surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // Replace escaped \n with actual newlines
  return key.replace(/\\n/g, "\n");
}

/**
 * Validates backend environment variables and returns sanitized configuration.
 */
export function getEnvConfig(): EnvValidationResult {
  const errors: string[] = [];

  const isMockMode =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
    process.env.USE_MOCK_DATA === "true";

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim() || "";
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim() || "";
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const privateKey = sanitizePrivateKey(rawKey);

  const cacheTtlMs = process.env.METADATA_CACHE_TTL_MS
    ? parseInt(process.env.METADATA_CACHE_TTL_MS, 10)
    : 15000;

  // Check if live Google Drive is configured
  const hasCredentials = Boolean(folderId && clientEmail && privateKey);

  if (!isMockMode) {
    if (!folderId) {
      errors.push("Missing required environment variable: GOOGLE_DRIVE_FOLDER_ID");
    }
    if (!clientEmail) {
      errors.push("Missing required environment variable: GOOGLE_CLIENT_EMAIL");
    }
    if (!privateKey) {
      errors.push("Missing required environment variable: GOOGLE_PRIVATE_KEY");
    } else if (!privateKey.includes("BEGIN PRIVATE KEY")) {
      errors.push(
        "Invalid GOOGLE_PRIVATE_KEY format: Must be a valid RSA private key starting with '-----BEGIN PRIVATE KEY-----'"
      );
    }
  }

  const isValid = isMockMode || errors.length === 0;

  return {
    isValid,
    isConfigured: hasCredentials,
    errors,
    config: {
      folderId,
      clientEmail,
      privateKey,
      cacheTtlMs: isNaN(cacheTtlMs) || cacheTtlMs < 1000 ? 15000 : cacheTtlMs,
      isMockMode,
    },
  };
}

/**
 * Helper to retrieve valid server configuration or throw a descriptive error.
 */
export function requireDriveConfig(): DriveConfig {
  const result = getEnvConfig();
  if (!result.isValid || !result.config) {
    throw new Error(
      `Google Drive configuration incomplete:\n- ${result.errors.join("\n- ")}`
    );
  }
  return result.config;
}
