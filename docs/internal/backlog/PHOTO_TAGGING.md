# Photo Tagging Feature

**Status:** Backlog
**Priority:** P3
**Charter:** P6 (personalized member experience)

---

## Summary

Enable members to be tagged in photos, triggering personalized news feed items when they appear in event photos.

## Current State

- Photos exist in `PhotoAlbum` linked to events
- News feed shows photos from events member attended
- No way to tag specific members in photos

## Proposed Schema

```prisma
model PhotoTag {
  id        String   @id @default(uuid()) @db.Uuid
  photoId   String   @db.Uuid
  memberId  String   @db.Uuid
  taggedById String  @db.Uuid
  x         Float?   // Optional position (0-1 normalized)
  y         Float?   // Optional position (0-1 normalized)
  createdAt DateTime @default(now())

  photo    Photo  @relation(fields: [photoId], references: [id], onDelete: Cascade)
  member   Member @relation("PhotoTaggedMember", fields: [memberId], references: [id])
  taggedBy Member @relation("PhotoTaggedBy", fields: [taggedById], references: [id])

  @@unique([photoId, memberId])
  @@index([memberId])
  @@index([photoId])
}
```

## News Feed Integration

Update `fetchPhotoNews()` to include:

```typescript
// Photos where member is tagged (in addition to events attended)
const taggedPhotos = await prisma.photoTag.findMany({
  where: {
    memberId: userContext.memberId,
    createdAt: { gte: thirtyDaysAgo },
  },
  include: {
    photo: {
      include: {
        album: { include: { event: true } },
      },
    },
  },
});
```

## UI Components Needed

1. **Photo viewer with tagging** - Click to tag members
2. **Member search/autocomplete** - Find members to tag
3. **Tag display overlay** - Show who's in the photo
4. **Notification preference** - "Notify me when I'm tagged"

## Privacy Considerations

- Members can untag themselves
- Option to disable being tagged (member preference)
- Only members can be tagged (not public)

## Dependencies

- Schema change (HOTSPOT - merge captain)
- Member relation additions to Photo model

## Effort Estimate

- Schema: S (small)
- API: M (medium)
- UI: L (large - photo viewer with tagging UX)

---

## Related

- News Feed API: `src/app/api/v1/news/route.ts`
- Photo model: `prisma/schema.prisma:941`
- Member preferences: `src/hooks/useNewsPreferences.ts`
