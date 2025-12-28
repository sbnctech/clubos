# Wild Apricot Adapter

This directory contains all Wild Apricot-specific code.

When running in standalone mode, this adapter is not loaded.

## Structure

- `types.ts` - WA API response types and data structures
- `config.ts` - WA-specific configuration and environment variables
- `WAAuthService.ts` - OAuth authentication with Wild Apricot
- `WAMemberService.ts` - Member sync operations
- `WASyncService.ts` - Full data synchronization between ClubOS and WA
- `index.ts` - Public exports

## Usage

```typescript
import { WAAuthService, WAMemberService, WASyncService } from '@/adapters/wild-apricot';
```

## Environment Variables

Required for WA integration:

- `WA_API_KEY` - Wild Apricot API key
- `WA_ACCOUNT_ID` - Wild Apricot account ID
- `WA_CLIENT_ID` - OAuth client ID (optional)
- `WA_CLIENT_SECRET` - OAuth client secret (optional)
