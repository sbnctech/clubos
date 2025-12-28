# Phase 1: Native Implementation

This phase implements native services to replace Wild Apricot dependencies.

## Components

- Native JWT authentication
- Stripe payment processing
- Resend transactional email

## Feature Flags

Enable native services by setting:

- `FEATURE_NATIVE_AUTH=true`
- `FEATURE_NATIVE_PAYMENTS=true`
- `FEATURE_NATIVE_EMAIL=true`
