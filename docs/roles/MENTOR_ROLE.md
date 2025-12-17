# Mentor Role

Reference: [SBNC Business Model](../ORG/SBNC_BUSINESS_MODEL.md)

## Overview

Mentors are experienced SBNC members who volunteer to help newbies navigate their first months with the club. This is a low-commitment, high-impact volunteer role.

## Eligibility

To become a mentor, a member must:

1. **Opt in** - Set `agreedToMentor = true` on their profile
2. **Have capacity** - Not exceed the maximum active assignments (default: 1)
3. **Be in good standing** - Active membership

## Responsibilities

Mentors are expected to:

- Reach out to their assigned newbie within 48 hours
- Be available to answer questions about events, groups, and club culture
- Invite the newbie to at least one event they are attending
- Check in periodically (no specific cadence required)

## What Mentors Are NOT Expected To Do

- Guarantee the newbie attends events
- Report on the newbie's progress
- Complete any formal training
- Commit to a specific time period

## Assignment Process

1. VP Membership views unmatched newbies on the Mentorship Dashboard
2. VP Membership selects a mentor based on availability and fit
3. System creates the assignment and notifies both parties via email
4. Assignment is logged in the Leadership Action Log

## Tracking

The following events are logged for third-year membership decisions:

- `mentor.assigned` - When a mentor is matched with a newbie
- `mentor.ended` - When a mentorship is concluded
- `mentor_newbie.registered_same_event` - When both register for the same event
- `mentor_newbie.attended_same_event` - When attendance is confirmed for both

These logs are evidence-based (what happened) not judgment-based (was it good).

## Dashboard Access

- **VP Membership**: Full access (view lists, create matches)
- **President**: Read-only access (when enabled via setting)
- **Mentors**: See their assignment on member profile
- **Newbies**: See their mentor on member profile

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `MENTOR_MAX_ACTIVE_ASSIGNMENTS` | 1 | Max concurrent newbies per mentor |
| `MENTORSHIP_CARD_VISIBLE_TO_PRESIDENT` | false | Show card on President dashboard |

## Related Documentation

- [Leadership Action Log](../governance/LEADERSHIP_ACTION_LOG.md)
- [VP Membership Workflow](../onboarding/OFFICER_ONBOARDING.md)
