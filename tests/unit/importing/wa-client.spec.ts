/**
 * Wild Apricot Client Unit Tests
 *
 * Tests for OAuth token management, pagination, retry/backoff logic.
 * Uses mocked HTTP responses - no real WA credentials required.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  WildApricotClient,
  createWAClientWithConfig,
} from "@/lib/importing/wildapricot/client";
import { WAConfig } from "@/lib/importing/wildapricot/config";
import {
  WATokenResponse,
  WAContact,
  WAMembershipLevel,
} from "@/lib/importing/wildapricot/types";

// ============================================================================
// Test Configuration
// ============================================================================

const testConfig: WAConfig = {
  apiBaseUrl: "https://api.test.wildapricot.org/v2.2",
  authUrl: "https://oauth.test.wildapricot.org/auth/token",
  accountId: "12345",
  apiKey: "test-api-key",
  pageSize: 2, // Small page size for pagination tests
  asyncPollIntervalMs: 10, // Fast polling for tests
  asyncMaxAttempts: 3,
  requestTimeoutMs: 5000,
  tokenExpiryBufferMs: 60000,
  maxRetries: 2,
  retryBaseDelayMs: 10, // Fast retries for tests
  retryMaxDelayMs: 100,
  contactsLookbackDays: 1,
  eventsLookbackDays: 30,
  dbBatchSize: 10,
};

// ============================================================================
// Mock Helpers
// ============================================================================

function createMockResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createMockTokenResponse(): WATokenResponse {
  return {
    access_token: "test-access-token-" + Date.now(),
    token_type: "Bearer",
    expires_in: 1800, // 30 minutes
    Permissions: [
      {
        AccountId: 12345,
        SecurityProfileId: 1,
        AvailableScopes: ["contacts_view", "events_view"],
      },
    ],
  };
}

// ============================================================================
// Token Management Tests
// ============================================================================

describe("WildApricotClient - Token Management", () => {
  let client: WildApricotClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWAClientWithConfig(testConfig);
    client.clearTokenCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches a new token when cache is empty", async () => {
    const tokenResponse = createMockTokenResponse();
    fetchMock.mockResolvedValueOnce(createMockResponse(tokenResponse));

    const token = await client.getAccessToken();

    expect(token).toBe(tokenResponse.access_token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      testConfig.authUrl,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
    );
  });

  it("returns cached token when still valid", async () => {
    const tokenResponse = createMockTokenResponse();
    fetchMock.mockResolvedValueOnce(createMockResponse(tokenResponse));

    // First call - fetches token
    const token1 = await client.getAccessToken();

    // Second call - should use cache
    const token2 = await client.getAccessToken();

    expect(token1).toBe(token2);
    expect(fetchMock).toHaveBeenCalledTimes(1); // Only one fetch
  });

  it("refreshes token when expired", async () => {
    // Create a client with very short token buffer for testing
    const shortBufferConfig = { ...testConfig, tokenExpiryBufferMs: 2000000 }; // 2000s buffer
    const shortClient = createWAClientWithConfig(shortBufferConfig);
    shortClient.clearTokenCache();

    const tokenResponse1 = { ...createMockTokenResponse(), expires_in: 1 }; // 1 second
    const tokenResponse2 = createMockTokenResponse();

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse1))
      .mockResolvedValueOnce(createMockResponse(tokenResponse2));

    // First call - fetches token
    await shortClient.getAccessToken();

    // Second call - token expired due to buffer, should refresh
    const token2 = await shortClient.getAccessToken();

    expect(token2).toBe(tokenResponse2.access_token);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("encodes API key correctly in Basic auth header", async () => {
    const tokenResponse = createMockTokenResponse();
    fetchMock.mockResolvedValueOnce(createMockResponse(tokenResponse));

    await client.getAccessToken();

    const expectedCredentials = Buffer.from(`APIKEY:${testConfig.apiKey}`).toString("base64");
    expect(fetchMock).toHaveBeenCalledWith(
      testConfig.authUrl,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Basic ${expectedCredentials}`,
        }),
      })
    );
  });

  it("throws WATokenException on auth failure", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("Invalid credentials", { status: 401 })
    );

    await expect(client.getAccessToken()).rejects.toThrow("Failed to obtain access token");
  });
});

// ============================================================================
// Pagination Tests
// ============================================================================

describe("WildApricotClient - Pagination", () => {
  let client: WildApricotClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWAClientWithConfig(testConfig);
    client.clearTokenCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches all pages when results span multiple pages", async () => {
    const tokenResponse = createMockTokenResponse();
    const page1: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
      { Id: 2, Name: "Level 2", MembershipFee: 200, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];
    const page2: WAMembershipLevel[] = [
      { Id: 3, Name: "Level 3", MembershipFee: 300, Description: null, RenewalEnabled: false, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse)) // Token
      .mockResolvedValueOnce(createMockResponse({ Items: page1 })) // Page 1
      .mockResolvedValueOnce(createMockResponse({ Items: page2 })); // Page 2

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(3);
    expect(levels.map((l) => l.Id)).toEqual([1, 2, 3]);
  });

  it("stops pagination when receiving empty page", async () => {
    const tokenResponse = createMockTokenResponse();
    const page1: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(createMockResponse({ Items: page1 }))
      .mockResolvedValueOnce(createMockResponse({ Items: [] }));

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(1);
  });

  it("stops pagination when page is smaller than page size", async () => {
    const tokenResponse = createMockTokenResponse();
    // Page size is 2, so a page with 1 item indicates end of data
    const page1: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(createMockResponse({ Items: page1 }));

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(1);
    // Should not fetch page 2 since page 1 had fewer items than page size
    expect(fetchMock).toHaveBeenCalledTimes(2); // Token + 1 page
  });

  it("uses correct OData pagination parameters", async () => {
    const tokenResponse = createMockTokenResponse();
    const page1: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
      { Id: 2, Name: "Level 2", MembershipFee: 200, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];
    const page2: WAMembershipLevel[] = [
      { Id: 3, Name: "Level 3", MembershipFee: 300, Description: null, RenewalEnabled: false, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(createMockResponse({ Items: page1 }))
      .mockResolvedValueOnce(createMockResponse({ Items: page2 }));

    await client.fetchMembershipLevels();

    // Check first API call (page 1)
    const call1Url = new URL(fetchMock.mock.calls[1][0] as string);
    expect(call1Url.searchParams.get("$top")).toBe("2");
    expect(call1Url.searchParams.get("$skip")).toBe("0");

    // Check second API call (page 2)
    const call2Url = new URL(fetchMock.mock.calls[2][0] as string);
    expect(call2Url.searchParams.get("$top")).toBe("2");
    expect(call2Url.searchParams.get("$skip")).toBe("2");
  });
});

// ============================================================================
// Retry and Backoff Tests
// ============================================================================

describe("WildApricotClient - Retry and Backoff", () => {
  let client: WildApricotClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWAClientWithConfig(testConfig);
    client.clearTokenCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("retries on 500 server error", async () => {
    const tokenResponse = createMockTokenResponse();
    const successResponse: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse)) // Token
      .mockResolvedValueOnce(new Response("Server Error", { status: 500 })) // Fail
      .mockResolvedValueOnce(createMockResponse({ Items: successResponse })); // Success

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(3); // Token + fail + success
  });

  it("retries on rate limit (429) and respects Retry-After header", async () => {
    const tokenResponse = createMockTokenResponse();
    const successResponse: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    const rateLimitResponse = new Response("Rate Limited", {
      status: 429,
      headers: { "Retry-After": "1" }, // 1 second
    });

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(rateLimitResponse)
      .mockResolvedValueOnce(createMockResponse({ Items: successResponse }));

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("refreshes token on 401 and retries", async () => {
    const tokenResponse1 = createMockTokenResponse();
    const tokenResponse2 = createMockTokenResponse();
    const successResponse: WAMembershipLevel[] = [
      { Id: 1, Name: "Level 1", MembershipFee: 100, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse1)) // Initial token
      .mockResolvedValueOnce(new Response("Unauthorized", { status: 401 })) // API rejects
      .mockResolvedValueOnce(createMockResponse(tokenResponse2)) // New token
      .mockResolvedValueOnce(createMockResponse({ Items: successResponse })); // Success

    const levels = await client.fetchMembershipLevels();

    expect(levels).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("throws after max retries exceeded", async () => {
    const tokenResponse = createMockTokenResponse();

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValue(new Response("Server Error", { status: 500 })); // Always fail

    await expect(client.fetchMembershipLevels()).rejects.toThrow("API request failed: 500");
  });

  it("throws after max rate limit retries", async () => {
    const tokenResponse = createMockTokenResponse();
    const rateLimitResponse = new Response("Rate Limited", {
      status: 429,
      headers: { "Retry-After": "1" },
    });

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValue(rateLimitResponse); // Always rate limited

    await expect(client.fetchMembershipLevels()).rejects.toThrow("Rate limit exceeded");
  });
});

// ============================================================================
// Async Query Polling Tests
// ============================================================================

describe("WildApricotClient - Async Query Polling", () => {
  let client: WildApricotClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWAClientWithConfig(testConfig);
    client.clearTokenCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("polls async result until complete", async () => {
    const tokenResponse = createMockTokenResponse();
    const contacts: WAContact[] = [
      {
        Id: 1,
        FirstName: "John",
        LastName: "Doe",
        Email: "john@example.com",
        DisplayName: "John Doe",
        Organization: null,
        MembershipLevel: null,
        Status: "Active",
        MemberSince: "2024-01-01",
        IsSuspendedMember: false,
        ProfileLastUpdated: "2024-12-01",
        IsAccountAdministrator: false,
        FieldValues: [],
      },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse)) // Token for initial request
      .mockResolvedValueOnce(createMockResponse({ ResultUrl: "https://async.test/result/123" })) // Async response
      .mockResolvedValueOnce(createMockResponse({ State: "Processing" })) // Poll 1
      .mockResolvedValueOnce(createMockResponse({ State: "Complete", Contacts: contacts })); // Poll 2

    const result = await client.fetchContacts();

    expect(result).toHaveLength(1);
    expect(result[0].Email).toBe("john@example.com");
  });

  it("throws on async query failure", async () => {
    const tokenResponse = createMockTokenResponse();

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(createMockResponse({ ResultUrl: "https://async.test/result/123" }))
      .mockResolvedValueOnce(
        createMockResponse({ State: "Failed", ErrorDetails: "Query timed out" })
      );

    await expect(client.fetchContacts()).rejects.toThrow("Async query failed");
  });

  it("throws on async poll timeout", async () => {
    const tokenResponse = createMockTokenResponse();

    // Use mockImplementation to create fresh Response objects each time
    let callCount = 0;
    fetchMock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve(createMockResponse(tokenResponse));
      }
      if (callCount === 2) {
        return Promise.resolve(createMockResponse({ ResultUrl: "https://async.test/result/123" }));
      }
      // All subsequent calls return Processing (never completes)
      return Promise.resolve(createMockResponse({ State: "Processing" }));
    });

    await expect(client.fetchContacts()).rejects.toThrow("Async query timed out");
  });
});

// ============================================================================
// Health Check Tests
// ============================================================================

describe("WildApricotClient - Health Check", () => {
  let client: WildApricotClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = createWAClientWithConfig(testConfig);
    client.clearTokenCache();
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok:true when API is healthy", async () => {
    const tokenResponse = createMockTokenResponse();
    const levels: WAMembershipLevel[] = [
      { Id: 1, Name: "Test", MembershipFee: 0, Description: null, RenewalEnabled: true, RenewalPeriod: null, NewMembersEnabled: true, Url: "" },
    ];

    fetchMock
      .mockResolvedValueOnce(createMockResponse(tokenResponse))
      .mockResolvedValueOnce(createMockResponse({ Items: levels }));

    const result = await client.healthCheck();

    expect(result.ok).toBe(true);
    expect(result.accountId).toBe("12345");
    expect(result.error).toBeUndefined();
  });

  it("returns ok:false with error on failure", async () => {
    fetchMock.mockResolvedValueOnce(new Response("Unauthorized", { status: 401 }));

    const result = await client.healthCheck();

    expect(result.ok).toBe(false);
    expect(result.accountId).toBe("12345");
    expect(result.error).toBeDefined();
  });
});
