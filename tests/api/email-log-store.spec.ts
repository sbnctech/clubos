import { test, expect } from "@playwright/test";
import { MemoryEmailLogStore } from "../../server/email-log-store";

test.describe("MemoryEmailLogStore", () => {
  test("add() creates entries with generated id and timestamp", async () => {
    const store = new MemoryEmailLogStore();

    const entry = await store.add({
      subject: "Test Subject",
      body: "Test Body",
    });

    expect(entry.id).toMatch(/^log-\d+-[a-z0-9]+$/);
    expect(entry.subject).toBe("Test Subject");
    expect(entry.body).toBe("Test Body");
    expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("add() uses default values when input is empty", async () => {
    const store = new MemoryEmailLogStore();

    const entry = await store.add({});

    expect(entry.subject).toBe("Logged email");
    expect(entry.body).toBe("Logged email body.");
  });

  test("listRecent() returns entries in newest-first order", async () => {
    const store = new MemoryEmailLogStore();

    await store.add({ subject: "First" });
    await store.add({ subject: "Second" });
    await store.add({ subject: "Third" });

    const entries = await store.listRecent(10);

    expect(entries.length).toBe(3);
    expect(entries[0].subject).toBe("Third");
    expect(entries[1].subject).toBe("Second");
    expect(entries[2].subject).toBe("First");
  });

  test("listRecent() respects limit parameter", async () => {
    const store = new MemoryEmailLogStore();

    await store.add({ subject: "First" });
    await store.add({ subject: "Second" });
    await store.add({ subject: "Third" });

    const entries = await store.listRecent(2);

    expect(entries.length).toBe(2);
    expect(entries[0].subject).toBe("Third");
    expect(entries[1].subject).toBe("Second");
  });

  test("store enforces max size limit", async () => {
    const maxSize = 5;
    const store = new MemoryEmailLogStore(maxSize);

    for (let i = 1; i <= 10; i++) {
      await store.add({ subject: `Entry ${i}` });
    }

    expect(store.count()).toBe(maxSize);

    const entries = await store.listRecent(maxSize);
    expect(entries.length).toBe(maxSize);
    expect(entries[0].subject).toBe("Entry 10");
    expect(entries[4].subject).toBe("Entry 6");
  });

  test("clear() removes all entries", async () => {
    const store = new MemoryEmailLogStore();

    await store.add({ subject: "Test" });
    expect(store.count()).toBe(1);

    store.clear();
    expect(store.count()).toBe(0);
  });
});
