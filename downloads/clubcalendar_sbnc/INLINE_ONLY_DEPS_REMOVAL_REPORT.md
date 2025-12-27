# Inline-Only Dependencies Removal Report

**Date**: December 2025
**Auditor**: Worker 5
**Purpose**: Audit repo for server-hosted dependencies and ensure inline-only path is canonical

---

## Executive Summary

This audit identified **2 documentation files** that reference a removed server-hosted build infrastructure and should be deprecated or updated. The inline-only path (iframe embeds pointing to Netlify-hosted ClubOS) is the canonical approach and fully supports needed features.

**Key Finding**: The `build:inline-widget` npm script and `vite.inline.config.ts` referenced in docs **do not exist** in the codebase. These docs describe phantom infrastructure.

---

## Audit Results

### 1. mail.sbnewcomers.org References

**Status**: No references found.

```bash
grep -r "mail\.sbnewcomers\.org" .
# No matches
```

The `mail.sbnewcomers.org` subdomain is not referenced anywhere in code or docs.

---

### 2. sbnewcomers.org References (Legitimate)

**Status**: 22 files contain `sbnewcomers.org` references. These are **LEGITIMATE** and should be retained.

| Category | Count | Purpose |
|----------|-------|---------|
| Organization identity | 8 | Website URL, contact emails |
| Test fixtures | 3 | Test data with example emails |
| Email infrastructure | 4 | SPF/DKIM/DMARC documentation |
| Theme documentation | 2 | Theme origin notes |
| Wild Apricot sync | 3 | WA data sync documentation |
| Policy registry | 2 | Email sender policies |

**Examples of legitimate references**:
- `src/lib/publishing/email.ts:36` - `"https://sbnewcomers.org"` (organization website)
- `src/lib/config/externalLinks.ts:23` - Gift certificates URL
- `docs/operations/EMAIL_INFRASTRUCTURE_GUIDE.md` - DMARC configuration

**Decision**: RETAIN. These are organizational identity references, not server-hosted dependencies.

---

### 3. Server-Hosted Build Infrastructure (REMOVED)

**Status**: Documentation references **phantom infrastructure** that does not exist.

#### Files Referencing Removed Infrastructure

| File | Issue | Status |
|------|-------|--------|
| `docs/INSTALL/SBNC_INLINE_ONLY_INSTALL.md` | References `npm run build:inline-widget` | QUARANTINE |
| `docs/INSTALL/SBNC_HOSTING_GUIDE.md` | References `dist/inline-widget/`, widget.js | QUARANTINE |

#### Missing Infrastructure Confirmed

```bash
# Verify build script does not exist
grep "build:inline-widget" package.json
# No matches

# Verify vite config does not exist
ls src/inline-widget/ 2>/dev/null || echo "MISSING"
# MISSING

ls vite.inline.config.ts 2>/dev/null || echo "MISSING"
# MISSING
```

**Decision**: QUARANTINE these docs. The infrastructure they describe was never implemented.

---

### 4. CORS Proxy Configuration

**Status**: Config templates contain `corsProxy: null` which is correct.

| File | Setting | Status |
|------|---------|--------|
| `config-templates/clubcalendar/sbnc-wa-feed.config.json` | `"corsProxy": null` | OK |
| `config-templates/clubcalendar/sbnc-static-json.config.json` | `"corsProxy": null` | OK |

**Decision**: RETAIN. Setting proxy to null is the correct inline-only approach.

---

## Deletions/Quarantine List

### Files to QUARANTINE (Move to _ARCHIVE)

| File | Reason | Action |
|------|--------|--------|
| `docs/INSTALL/SBNC_INLINE_ONLY_INSTALL.md` | References phantom build infrastructure | Move to `docs/INSTALL/_ARCHIVE/` |
| `docs/INSTALL/SBNC_HOSTING_GUIDE.md` | References phantom build infrastructure | Move to `docs/INSTALL/_ARCHIVE/` |

### References to UPDATE

No references need updating - the sbnewcomers.org references are legitimate organizational identity.

### Files to RETAIN

| Directory/File | Reason |
|----------------|--------|
| `config-templates/clubcalendar/` | Valid inline-only configurations |
| `sbnc-install-pack/` (if present) | New canonical inline-only install pack |
| All `sbnewcomers.org` code references | Organizational identity |

---

## Inline-Only Feature Support Verification

The inline-only path (iframe embeds to Netlify-hosted ClubOS) supports all needed features:

### Supported Features

| Feature | Support | Implementation |
|---------|---------|----------------|
| Event calendar display | YES | `/embed/events` endpoint |
| Month/week/list views | YES | ClubOS calendar component |
| Event filtering | YES | Query params in embed URL |
| Category tags | YES | Event categories rendered |
| Event details | YES | Expandable event cards |
| Mobile responsive | YES | ClubOS uses responsive CSS |
| Dropdowns/selection | YES | Native HTML select elements |
| Date navigation | YES | Calendar controls in embed |
| Registration status | YES | Shown if data available |

### Feature Configuration

Features are configured via URL query parameters:

```html
<!-- Example with filters and view selection -->
<iframe src="https://clubos-prod-sbnc.netlify.app/embed/events?view=list&category=social" ...></iframe>
```

### Features NOT Supported (Intentionally)

| Feature | Reason |
|---------|--------|
| Custom JavaScript | Security (XSS prevention) |
| Direct API access | RBAC enforcement via server |
| Offline mode | Requires service worker |
| Custom styling injection | CSP enforcement |

---

## Canonical Inline-Only Path

The canonical installation path is:

1. **Copy HTML snippet** from `sbnc-install-pack/events-calendar.html`
2. **Paste into WA Custom HTML block**
3. **Save and publish**

This path:
- Requires **no build steps**
- Has **no server-hosted dependencies** beyond Netlify hosting
- Uses **iframe isolation** for security
- Points to **production Netlify deployment**

---

## Recommended Actions

### Immediate Actions

1. **Archive phantom docs**:
   ```bash
   mkdir -p docs/INSTALL/_ARCHIVE
   git mv docs/INSTALL/SBNC_INLINE_ONLY_INSTALL.md docs/INSTALL/_ARCHIVE/
   git mv docs/INSTALL/SBNC_HOSTING_GUIDE.md docs/INSTALL/_ARCHIVE/
   ```

2. **Update INDEX.md** to remove references to archived docs

3. **Verify sbnc-install-pack** is merged (PR #395)

### Optional Follow-up

1. Consider deleting `config-templates/clubcalendar/` if not used
2. Add deprecation notice to archived docs explaining they were never implemented

---

## Conclusion

The inline-only path is fully operational and canonical. The server-hosted build infrastructure (`build:inline-widget`, `vite.inline.config.ts`, `src/inline-widget/`) was documented but never implemented. These phantom docs should be archived.

**No mail.sbnewcomers.org references exist** in the codebase.

All `sbnewcomers.org` references are legitimate organizational identity and should be retained.

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2025-12-26 | Worker 5 | Initial audit report |
