/* Copyright (c) Santa Barbara Newcomers Club. All rights reserved. */

import type { PaymentProvider, PaymentProviderId } from "./types";

const providers: Record<PaymentProviderId, PaymentProvider> = {};

export function registerPaymentProvider(provider: PaymentProvider): void {
  providers[provider.id] = provider;
}

export function getPaymentProvider(id: PaymentProviderId): PaymentProvider | null {
  return providers[id] || null;
}

export function listPaymentProviders(): PaymentProviderId[] {
  return Object.keys(providers).sort();
}
