// Copyright (c) Santa Barbara Newcomers Club
// All rights reserved.

export type EmailLogEntry = {
  id: string;
  subject: string;
  body: string;
  createdAt: string;
};

export type EmailLogEntryInput = {
  subject?: string;
  body?: string;
};

export interface EmailLogStore {
  add(input: EmailLogEntryInput): Promise<EmailLogEntry>;
  listRecent(limit: number): Promise<EmailLogEntry[]>;
}

const DEFAULT_MAX_SIZE = 100;

export class MemoryEmailLogStore implements EmailLogStore {
  private entries: EmailLogEntry[] = [];
  private maxSize: number;

  constructor(maxSize: number = DEFAULT_MAX_SIZE) {
    this.maxSize = maxSize;
  }

  async add(input: EmailLogEntryInput): Promise<EmailLogEntry> {
    const subject =
      typeof input.subject === "string" && input.subject.length > 0
        ? input.subject
        : "Logged email";

    const body =
      typeof input.body === "string" && input.body.length > 0
        ? input.body
        : "Logged email body.";

    const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const entry: EmailLogEntry = {
      id,
      subject,
      body,
      createdAt: new Date().toISOString(),
    };

    this.entries.unshift(entry);

    if (this.entries.length > this.maxSize) {
      this.entries = this.entries.slice(0, this.maxSize);
    }

    return entry;
  }

  async listRecent(limit: number): Promise<EmailLogEntry[]> {
    return this.entries.slice(0, limit);
  }

  // For testing: clear the store
  clear(): void {
    this.entries = [];
  }

  // For testing: get current count
  count(): number {
    return this.entries.length;
  }
}

export const emailLogStore = new MemoryEmailLogStore();
