/**
 * TOTP (Time-based One-Time Password) Library
 *
 * Charter Principles:
 * - P1: Identity must be provable - 2FA adds second authentication factor
 * - P9: Security must fail closed - invalid codes are rejected
 *
 * Uses RFC 6238 compliant TOTP with 30-second windows.
 */

import * as OTPAuth from "otpauth";
import { createHash, randomBytes } from "crypto";

// SBNC ClubOS issuer name shown in authenticator apps
const ISSUER = "SBNC ClubOS";

// TOTP configuration
const TOTP_ALGORITHM = "SHA1";
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds

/**
 * Generate a new TOTP secret for enrollment.
 *
 * @returns Base32-encoded secret string
 */
export function generateTotpSecret(): string {
  // Generate 20 random bytes (160 bits) for the secret
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * Generate a TOTP URI for QR code generation.
 *
 * The URI follows the otpauth:// format that authenticator apps understand:
 * otpauth://totp/ISSUER:ACCOUNT?secret=SECRET&issuer=ISSUER&algorithm=SHA1&digits=6&period=30
 *
 * @param secret - Base32-encoded secret
 * @param accountName - User's email or identifier shown in authenticator app
 * @returns otpauth:// URI string
 */
export function generateTotpUri(secret: string, accountName: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.toString();
}

/**
 * Verify a TOTP code.
 *
 * Allows for a 1-period window on either side to account for clock drift.
 *
 * @param secret - Base32-encoded secret
 * @param code - 6-digit code from authenticator app
 * @returns true if code is valid, false otherwise
 */
export function verifyTotpCode(secret: string, code: string): boolean {
  // Normalize code - strip spaces and ensure it's 6 digits
  const normalizedCode = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalizedCode)) {
    return false;
  }

  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  // Validate with 1-period window (±30 seconds)
  const delta = totp.validate({ token: normalizedCode, window: 1 });

  // delta is null if invalid, or a number indicating time offset
  return delta !== null;
}

/**
 * Generate the current TOTP code (for testing/debugging only).
 *
 * @param secret - Base32-encoded secret
 * @returns Current 6-digit TOTP code
 */
export function generateCurrentCode(secret: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: ISSUER,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(secret),
  });

  return totp.generate();
}

// ============================================================================
// BACKUP CODES
// ============================================================================

const BACKUP_CODE_COUNT = 10;
const BACKUP_CODE_LENGTH = 8; // 8 hex characters = 32 bits of entropy each

/**
 * Generate a set of backup codes.
 *
 * Backup codes are single-use codes that can be used if the user loses
 * access to their authenticator app.
 *
 * @returns Object containing plain codes (to show user) and hashed codes (to store)
 */
export function generateBackupCodes(): {
  plainCodes: string[];
  hashedCodes: string[];
} {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];

  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    // Generate random bytes and convert to hex
    const code = randomBytes(4).toString("hex").toUpperCase();
    plainCodes.push(code);
    hashedCodes.push(hashBackupCode(code));
  }

  return { plainCodes, hashedCodes };
}

/**
 * Hash a backup code for storage.
 *
 * Uses SHA-256 for one-way hashing.
 *
 * @param code - Plain backup code
 * @returns SHA-256 hash of the code
 */
export function hashBackupCode(code: string): string {
  return createHash("sha256")
    .update(code.toUpperCase().replace(/\s/g, ""))
    .digest("hex");
}

/**
 * Verify a backup code against stored hashes.
 *
 * @param code - Plain backup code entered by user
 * @param hashedCodes - Array of stored hashed codes
 * @returns Index of matching code, or -1 if not found
 */
export function verifyBackupCode(
  code: string,
  hashedCodes: string[]
): number {
  const hashedInput = hashBackupCode(code);
  return hashedCodes.findIndex((hash) => hash === hashedInput);
}

/**
 * Format backup codes for display to user.
 *
 * Groups codes in pairs of 4 characters with a dash for readability.
 *
 * @param codes - Array of backup codes
 * @returns Formatted string for display
 */
export function formatBackupCodesForDisplay(codes: string[]): string {
  return codes
    .map((code, index) => {
      const formatted = `${code.slice(0, 4)}-${code.slice(4)}`;
      return `${(index + 1).toString().padStart(2, " ")}. ${formatted}`;
    })
    .join("\n");
}
