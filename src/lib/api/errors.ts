import { NextResponse } from "next/server";

/**
 * Standard API error codes as defined in docs/api/jwt-and-error-spec.md
 */
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "CAPACITY_EXCEEDED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * HTTP status codes for each error type
 */
const ERROR_STATUS_MAP: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  RESOURCE_NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  CAPACITY_EXCEEDED: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * Generate a unique request ID for traceability
 */
export function generateRequestId(): string {
  return `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create a standardized error response
 */
export function apiError(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  const requestId = generateRequestId();
  const status = ERROR_STATUS_MAP[code];

  const body: ApiErrorResponse = {
    code,
    message,
    details: {
      ...details,
      requestId,
    },
  };

  return NextResponse.json(body, { status });
}

/**
 * Convenience error helpers
 */
export const errors = {
  validation: (message: string, fields?: Record<string, string>) =>
    apiError("VALIDATION_ERROR", message, fields ? { fields } : undefined),

  unauthorized: (reason?: string) =>
    apiError("UNAUTHORIZED", "Access token is missing or invalid", reason ? { reason } : undefined),

  forbidden: (requiredRole?: string, currentRole?: string) =>
    apiError("FORBIDDEN", "You do not have permission to perform this action", {
      requiredRole,
      currentRole,
    }),

  notFound: (resourceType: string, resourceId: string) =>
    apiError("RESOURCE_NOT_FOUND", `${resourceType} with ID ${resourceId} not found`, {
      resourceType,
      resourceId,
    }),

  conflict: (message: string, details?: Record<string, unknown>) =>
    apiError("CONFLICT", message, details),

  capacityExceeded: (eventId: string, currentCount: number, maxCapacity: number, waitlistAvailable: boolean) =>
    apiError("CAPACITY_EXCEEDED", "Event has reached maximum capacity", {
      eventId,
      currentCount,
      maxCapacity,
      waitlistAvailable,
    }),

  internal: (message = "An unexpected error occurred") =>
    apiError("INTERNAL_ERROR", message),

  serviceUnavailable: (service: string) =>
    apiError("SERVICE_UNAVAILABLE", `${service} is currently unavailable`),
};
