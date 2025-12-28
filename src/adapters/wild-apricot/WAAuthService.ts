/**
 * Wild Apricot Authentication Service
 *
 * Implements OAuth authentication with Wild Apricot API.
 * Handles token acquisition, refresh, and caching.
 */

import { loadWAConfig, WA_ENDPOINTS, type WAConfig } from "./config";
import { WATokenException } from "@/lib/importing/wildapricot/types";
import type { WAAuthToken, WATokenResponse } from "./types";

/**
 * WA Authentication Service
 *
 * Manages OAuth tokens for Wild Apricot API access.
 */
export class WAAuthService {
  private config: WAConfig;
  private currentToken: WAAuthToken | null = null;
  private tokenRefreshPromise: Promise<WAAuthToken> | null = null;

  constructor(config?: WAConfig) {
    this.config = config ?? loadWAConfig();
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getAccessToken(): Promise<string> {
    const token = await this.getToken();
    return token.accessToken;
  }

  /**
   * Get the full token object with metadata
   */
  async getToken(): Promise<WAAuthToken> {
    // Return cached token if still valid (with 60s buffer)
    if (this.currentToken && this.isTokenValid(this.currentToken)) {
      return this.currentToken;
    }

    // Prevent concurrent token refreshes
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    this.tokenRefreshPromise = this.acquireToken();
    try {
      this.currentToken = await this.tokenRefreshPromise;
      return this.currentToken;
    } finally {
      this.tokenRefreshPromise = null;
    }
  }

  /**
   * Force token refresh
   */
  async refreshToken(): Promise<WAAuthToken> {
    this.currentToken = null;
    return this.getToken();
  }

  /**
   * Clear cached token
   */
  clearToken(): void {
    this.currentToken = null;
  }

  /**
   * Check if the service has a valid token
   */
  hasValidToken(): boolean {
    return this.currentToken !== null && this.isTokenValid(this.currentToken);
  }

  private isTokenValid(token: WAAuthToken): boolean {
    const bufferMs = 60 * 1000; // 60 second buffer
    return token.expiresAt.getTime() > Date.now() + bufferMs;
  }

  private async acquireToken(): Promise<WAAuthToken> {
    const url = `${this.config.authUrl}${WA_ENDPOINTS.auth.token}`;

    // Use API key authentication (most common for server-to-server)
    const credentials = Buffer.from(`APIKEY:${this.config.apiKey}`).toString(
      "base64"
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new WATokenException(
        `Failed to acquire token: ${response.status} ${errorText}`
      );
    }

    const data: WATokenResponse = await response.json();

    // Find the account ID from permissions or use configured value
    const accountId =
      data.Permissions?.[0]?.AccountId ?? this.config.accountId;

    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      refreshToken: data.refresh_token,
      accountId,
    };
  }
}

// Singleton instance for convenience
let defaultInstance: WAAuthService | null = null;

/**
 * Get the default WAAuthService instance
 */
export function getWAAuthService(): WAAuthService {
  if (!defaultInstance) {
    defaultInstance = new WAAuthService();
  }
  return defaultInstance;
}

/**
 * Reset the default instance (for testing)
 */
export function resetWAAuthService(): void {
  defaultInstance = null;
}
