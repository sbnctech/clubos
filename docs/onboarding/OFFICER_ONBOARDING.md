# Officer Onboarding Guide

Reference: [SBNC Business Model](../ORG/SBNC_BUSINESS_MODEL.md)

## VP Membership Workflow

The VP Membership owns the mentorship program. Here is the standard workflow:

### Daily/Weekly Tasks

1. **Check the Mentorship Dashboard**
   - Navigate to Admin > Mentorship Card
   - Review "Newbies Awaiting Mentor" list (sorted by longest waiting)
   - Check "Available Mentors" list

2. **Create Matches**
   - Select a newbie from the dropdown
   - Select an appropriate mentor (consider interests, availability)
   - Add optional notes (e.g., "Both interested in hiking")
   - Click "Create Match"
   - System sends notification emails to both parties

3. **Monitor Active Pairs**
   - Review the "Active Mentor Pairs" table
   - No action required unless issues arise

### Matching Guidelines

- **Priority**: Match newbies who have waited longest first
- **Consider**: Event registration status (newbies who haven't registered need more support)
- **Avoid**: Overloading mentors (capacity is enforced by system)

### What You Cannot Do

- Assign yourself as a mentor (system prevents)
- Create duplicate assignments for same newbie (system prevents)
- Override mentor capacity limits (by design)

## President Dashboard

If the setting `MENTORSHIP_CARD_VISIBLE_TO_PRESIDENT` is enabled:

- President sees a read-only view of the Mentorship Card
- Can view lists and statistics
- Cannot create matches (VP Membership only)

## Other Officers

Other officers do not have direct access to the Mentorship Dashboard but can:

- View their own mentorship status (if a mentor or newbie)
- See mentorship-related entries in the Leadership Action Log (if authorized)

## Settings Reference

| Setting | Description | Who Can Change |
|---------|-------------|----------------|
| `MENTOR_MAX_ACTIVE_ASSIGNMENTS` | Max newbies per mentor | Admin |
| `MENTORSHIP_CARD_VISIBLE_TO_PRESIDENT` | Show card to President | Admin |

## Troubleshooting

### "Mentor not eligible" error

- Check if the mentor has opted in (`agreedToMentor = true`)
- Check if the mentor is at capacity (has max active assignments)

### "Newbie already matched" error

- The newbie already has an active mentor assignment
- Check the Active Pairs table

### Emails not sending

- Check the EmailOutbox table for PENDING status
- In development, emails are queued but not sent

## Related Documentation

- [Mentor Role](../roles/MENTOR_ROLE.md)
- [Leadership Action Log](../governance/LEADERSHIP_ACTION_LOG.md)
