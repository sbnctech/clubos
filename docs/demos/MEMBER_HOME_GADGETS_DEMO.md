# Member Home Gadgets Demo

Quick reference for demonstrating member home page gadgets.

## News Gadget

**Location:** `/my` (member dashboard, right column)

**What it shows:**
- Club announcements and news items
- Each item has: category badge, date, title, excerpt
- Items are clickable if they have a link

**Current data source:** Static demo data in `src/components/home/ClubNewsCard.tsx`

**To swap to real data later:**
1. Create `/api/v1/news` endpoint
2. Replace `CLUB_NEWS` constant with `fetch()` in `useEffect`
3. Keep `NewsItem` interface the same

**Demo talking points:**
- "Members see the latest club news right on their dashboard"
- "News items can link to full articles when connected to a CMS"
- "Categories help members quickly identify what type of news it is"

## Gift Certificate CTA

**Location:** `/events` page (top navigation bar)

**What it shows:**
- Tasteful button linking to gift certificate purchase page
- Opens in new tab (external link)

**Configuration:**
- URL is configurable via `NEXT_PUBLIC_GIFT_CERTIFICATE_URL` env variable
- Default: `https://sbnewcomers.org/gift-certificates`
- Config file: `src/lib/config/externalLinks.ts`

**Demo talking points:**
- "Gift certificates are prominently featured without being pushy"
- "The link opens in a new tab so members don't lose their place"
- "URL is configurable for different environments"

## Tests

Run gadget tests:
```bash
npx playwright test tests/public/member-gadgets.spec.ts
```

---

Copyright (c) Santa Barbara Newcomers Club
