# Event Policy Gates

**Purpose**: Define system-enforced rules that prevent invalid events or attendance scenarios
**Audience**: Event Chairs, VPs of Activities, Tech Chair

---

## Overview

Policy gates are validation rules that ClubOS enforces before an event can be published
or before a registration can be accepted. These rules derive from club insurance
requirements, operational policies, and governance decisions.

Gates are checked at two points:
1. Event publishing (can this event go live?)
2. Registration acceptance (can this person register?)

---

## Gate 1: Venue Type

### Rule

Every event must specify a venue_type:
- PRIVATE_HOME
- PUBLIC_VENUE
- BOATING (special case; see Gate 5)

### Enforcement

**PRIVATE_HOME events**:
- Require House Registrar approval before publishing
- Approval record must include:
  - Homeowner liability acknowledgment
  - Maximum capacity
  - Parking instructions (if applicable)
- System blocks "Publish" action until approval is attached

**PUBLIC_VENUE events**:
- No special approval required
- Venue contract or reservation confirmation recommended but not gated

### Example

```
Event: "Wine Tasting at the Smiths"
venue_type: PRIVATE_HOME
house_registrar_approved: false
--> PUBLISH BLOCKED: "Requires House Registrar approval"

Event: "Lunch at Eladio's"
venue_type: PUBLIC_VENUE
--> PUBLISH ALLOWED
```

---

## Gate 2: Non-Member Policy

### Rule

Non-members (alumni, guests, prospects) have restricted access based on venue type.

### Enforcement

**PRIVATE_HOME events**:
- Non-members are NOT permitted (insurance restriction)
- System must reject registration attempts from non-member contacts
- Error: "This event is for active members only (private venue insurance policy)"

**PUBLIC_VENUE events**:
- Non-members permitted ONLY if event.allow_nonmembers = true
- Member priority window: if event.member_priority_hours > 0, non-members
  cannot register until that window expires
- Non-member fee >= member fee (system enforces; cannot save event otherwise)

### Example

```
Event: "Garden Party" (PRIVATE_HOME)
Registrant: Alumni member
--> REGISTRATION BLOCKED: "Private home events are for active members only"

Event: "Museum Tour" (PUBLIC_VENUE, allow_nonmembers=true, member_priority_hours=48)
Registrant: Guest (attempting at hour 24)
--> REGISTRATION BLOCKED: "Registration opens for non-members in 24 hours"

Registrant: Guest (attempting at hour 50)
--> REGISTRATION ALLOWED
```

---

## Gate 3: Registration Required

### Rule

Events may require advance registration (registration_required = true) or allow drop-ins.

### Enforcement

**registration_required = true**:
- Drop-ins are not permitted
- Check-in system must verify registration before admitting attendee
- Walk-ups can be registered on-site ONLY if capacity allows
- Event chair must be able to add late registrations

**registration_required = false**:
- No registration tracking; attendance is open
- Headcount may still be tracked for planning purposes

### Example

```
Event: "Hiking Trip" (registration_required=true, capacity=20, registered=20)
Walk-up arrives at trailhead
--> CHECK-IN BLOCKED: "Not on registration list; event at capacity"

Event: "Coffee Chat" (registration_required=false)
Walk-up arrives
--> ALLOWED (no gate)
```

---

## Gate 4: Host and Hostess Rules

### Rule

Events may designate one or more hosts with special privileges.

### Enforcement

- Host registration is automatic; does not consume a capacity slot
- Host may bring personal guests up to event.host_guest_limit (default: 0)
- Host guests still subject to venue type rules:
  - At PRIVATE_HOME: host guests NOT allowed (insurance)
  - At PUBLIC_VENUE: host guests allowed if event.allow_nonmembers = true
- Host is responsible for their guests' conduct and fees

### Example

```
Event: "Potluck Dinner" (PRIVATE_HOME, host=Jane Doe, host_guest_limit=2)
Jane attempts to register 1 guest
--> BLOCKED: "Guests not permitted at private home events"

Event: "Restaurant Night" (PUBLIC_VENUE, host=Jane Doe, host_guest_limit=2)
Jane registers with 2 guests
--> ALLOWED
```

---

## Gate 5: Special Event Types (Boating)

### Rule

Boating events carry elevated insurance and liability requirements.

### Enforcement

- Events with venue_type = BOATING require VP Activities pre-review
- Insurance documentation must be attached before publishing
- System flags boating events for manual review queue
- Cannot publish without vp_activities_approved = true

### Example

```
Event: "Sailing Day on the Harbor"
venue_type: BOATING
vp_activities_approved: false
--> PUBLISH BLOCKED: "Boating events require VP Activities approval"
```

---

## Gate 6: Alcohol Policy

### Rule

Events serving alcohol must comply with club alcohol policy.

### Enforcement

- If event.serves_alcohol = true:
  - Must designate a responsible_party_contact_id
  - Registrants must acknowledge alcohol policy (checkbox or equivalent)
  - System blocks publishing if responsible_party not assigned
- Responsible party is accountable for compliance; specific tactics (bartender,
  wristbands, etc.) are operational decisions not enforced by system

### Example

```
Event: "Wine Tasting Evening"
serves_alcohol: true
responsible_party_contact_id: null
--> PUBLISH BLOCKED: "Alcohol events require a designated responsible party"

serves_alcohol: true
responsible_party_contact_id: 12345 (John Smith)
--> PUBLISH ALLOWED
```

---

## Event Chair Checklist: Policy Gates to Confirm Before Posting

Before requesting event publication, verify:

- [ ] Venue type selected (PRIVATE_HOME, PUBLIC_VENUE, or BOATING)
- [ ] If PRIVATE_HOME: House Registrar approval attached
- [ ] If BOATING: VP Activities approval attached
- [ ] Non-member policy configured correctly for venue type
- [ ] Member priority window set (if allowing non-members)
- [ ] Non-member fee >= member fee (if applicable)
- [ ] Registration required setting matches event intent
- [ ] Host(s) designated if applicable
- [ ] If serving alcohol: responsible party assigned
- [ ] Capacity set appropriately for venue

---

## Policy Clarifications Needed

The following items require clarification from club leadership:

1. **Host guest count at public venues**: Chair Guidelines mention host may have
   "a guest or two" but exact limit is not specified. TBD: Default host_guest_limit?

2. **Member priority window duration**: No standard duration specified. TBD: Should
   default be 24h, 48h, or configurable per event?

3. **Vaccination policy (legacy)**: 2021 Chair Guidelines reference vaccination
   requirements. Legacy reference; not enforced in current system unless policy
   is reaffirmed by board.

4. **Budget threshold for VP review**: Some events may require VP review based on
   budget amount, not just venue type. TBD: Is there a dollar threshold?

---

## Related Documents

- SYSTEM_SPEC.md - Event Policy Gates section
- docs/rbac/AUTH_AND_RBAC.md - Role permissions for event publishing

---

*Document maintained by ClubOS development team. Last updated: December 2024*
