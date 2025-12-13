import { test as base, expect } from "@playwright/test";

const ADMIN_TOKEN = process.env.CLUBOS_ADMIN_TEST_TOKEN || "vp-dev";

export const test = base.extend({
  context: async ({ browser }, use) => {
    const context = await browser.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
    await context.close();
  },
});

export { expect };
