/**
 * Two-Factor Authentication (2FA) Module
 *
 * Provides mandatory 2FA enforcement for privileged admin roles.
 *
 * Charter Principles:
 * - P1: Identity must be provable - 2FA adds second authentication factor
 * - P2: Default deny - privileged access requires 2FA
 * - P7: Observability - all 2FA actions are audited
 * - P9: Security must fail closed - invalid codes are rejected
 *
 * Features:
 * - TOTP-based authentication (RFC 6238)
 * - Backup codes for account recovery
 * - Automatic enforcement for privileged roles
 * - Audit logging for all 2FA events
 */

export * from "./totp";
export * from "./enforcement";
export * from "./service";
export * from "./guard";
