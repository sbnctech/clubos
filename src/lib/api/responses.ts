import { NextResponse } from "next/server";

/**
 * Standard pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Create pagination metadata from query params and total count
 */
export function createPagination(
  page: number,
  limit: number,
  totalItems: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Parse pagination query parameters with defaults
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): { page: number; limit: number } {
  const { page: defaultPage = 1, limit: defaultLimit = 20, maxLimit = 100 } = defaults;

  let page = parseInt(searchParams.get("page") || String(defaultPage), 10);
  let limit = parseInt(searchParams.get("limit") || String(defaultLimit), 10);

  // Clamp values
  page = Math.max(1, page);
  limit = Math.max(1, Math.min(limit, maxLimit));

  return { page, limit };
}

/**
 * Create a successful JSON response
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status });
}

/**
 * Create a 201 Created response
 */
export function apiCreated<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Create a 204 No Content response
 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
