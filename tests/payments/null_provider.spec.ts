import { NullPaymentProvider } from "../../src/lib/payments/providers/null_provider";

describe("NullPaymentProvider", () => {
  const provider = new NullPaymentProvider();

  it("creates intent", () => {
    expect(provider.createIntent().status).toBe("authorized");
  });

  it("captures intent", () => {
    expect(provider.captureIntent().status).toBe("captured");
  });

  it("rejects invalid webhook", () => {
    expect(() => provider.verifyWebhook({})).toThrow();
  });
});
