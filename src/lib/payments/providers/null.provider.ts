/**
 * NullPaymentProvider (stub)
 *
 * Payments are explicitly deferred per ADR_0001.
 * This stub prevents accidental usage.
 */
export const NullPaymentProvider = {
  createIntent() {
    throw new Error("Payments are disabled (ADR_0001)");
  },
};
