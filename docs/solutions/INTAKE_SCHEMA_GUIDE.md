# ClubOS Onboarding Intake Guide

Copyright (c) Santa Barbara Newcomers Club

---

## What Is This Document?

This guide explains how to complete the ClubOS Onboarding Intake form. The intake collects everything we need to set up your organization safely and correctly.

You do not need to be technical to complete this. Answer in plain English where possible. If you are unsure about something, leave a note and we will discuss it together.

---

## How to Fill It Out

The intake is organized into sections. Each section collects information about a specific area. You can complete sections in any order, but all required fields must be filled before we can begin implementation.

### Format

The intake uses JSON format. If you are comfortable with JSON, you can edit it directly. If not, we can work through it together in a spreadsheet or document and convert it later.

---

## Section-by-Section Guide

### 1. Organization (org)

Basic information about your organization.

**Required fields:**
- `name` - Your organization's name as it should appear in the system
- `timezone` - Your local timezone (e.g., "America/Los_Angeles")

**Example:**
```json
{
  "org": {
    "name": "Santa Barbara Newcomers Club",
    "timezone": "America/Los_Angeles",
    "domains": ["sbnewcomers.org"]
  }
}
```

---

### 2. Contacts (contacts)

Key people we will work with during setup and ongoing operations.

**Required fields:**
- `systemOwner` - The person who can make technical decisions

**Example:**
```json
{
  "contacts": {
    "systemOwner": {
      "name": "Jane Smith",
      "email": "jane@example.org",
      "phone": "805-555-1234",
      "role": "Webmaster"
    },
    "dataOwner": {
      "name": "Bob Johnson",
      "email": "bob@example.org",
      "role": "Membership Chair"
    }
  }
}
```

---

### 3. Current Systems (currentSystems)

What systems you currently use. This helps us understand where data comes from.

**Example:**
```json
{
  "currentSystems": {
    "membershipPlatform": {
      "name": "Legacy membership platform",
      "type": "membership",
      "accessLevel": "admin",
      "exportCapable": true
    },
    "emailProvider": {
      "name": "Mailchimp",
      "type": "email",
      "accessLevel": "admin"
    }
  }
}
```

---

### 4. Policies (policies)

Your organization's rules that affect how we configure the system.

**Example:**
```json
{
  "policies": {
    "membershipLevels": [
      {
        "name": "Regular Member",
        "durationMonths": 24,
        "isRenewable": false,
        "eligibilityCriteria": "Resident of SB County for less than 18 months"
      },
      {
        "name": "Extended Member",
        "durationMonths": 12,
        "isRenewable": true,
        "eligibilityCriteria": "Former regular member, board approved"
      }
    ],
    "eligibilityRules": "Must live in Santa Barbara County, from Carpinteria to Goleta.",
    "dataRetention": "Member records kept for 7 years after membership ends."
  }
}
```

---

### 5. Roles and Permissions (rolesAndPermissions)

Who should have access to what in the new system.

**Example:**
```json
{
  "rolesAndPermissions": {
    "roles": [
      { "name": "President", "isBoardPosition": true },
      { "name": "VP Activities", "isBoardPosition": true },
      { "name": "Webmaster", "isBoardPosition": false }
    ],
    "assignments": [
      { "role": "President", "capabilities": ["admin:full"] },
      { "role": "VP Activities", "capabilities": ["events:manage", "members:view"] },
      { "role": "Webmaster", "capabilities": ["content:manage", "members:view"] }
    ]
  }
}
```

---

### 6. Data Sources (dataSources)

Where your existing data comes from. At minimum, we need member data.

**Required fields:**
- `memberExport` - At least a stub indicating where member data will come from

**Example:**
```json
{
  "dataSources": {
    "memberExport": {
      "type": "csv",
      "dateRange": { "from": "2020-01-01", "to": "2024-12-01" },
      "locationRef": "Google Drive: Member Exports folder",
      "recordCount": 1200,
      "notes": "Includes active and lapsed members",
      "validated": false
    },
    "eventExport": {
      "type": "csv",
      "notes": "Historical events from 2022 forward"
    }
  }
}
```

---

### 7. Communications (communications)

How you communicate with members.

**Example:**
```json
{
  "communications": {
    "audiences": [
      { "name": "All Active Members", "estimatedSize": 800 },
      { "name": "Board Only", "estimatedSize": 15 },
      { "name": "Committee Chairs", "estimatedSize": 25 }
    ],
    "templatesNeeded": [
      "Welcome Email",
      "Renewal Reminder (30 days)",
      "Renewal Reminder (7 days)",
      "Event Confirmation"
    ],
    "approvalFlow": "VP Marketing must approve all-member emails"
  }
}
```

---

### 8. Publishing (publishing)

Your website structure and content needs.

**Example:**
```json
{
  "publishing": {
    "publicPages": ["Home", "About Us", "Join", "Events", "Contact"],
    "memberPages": ["Member Directory", "My Profile", "Event Calendar"],
    "restrictedPages": [
      { "page": "Board Minutes", "allowedRoles": ["Board Member"] },
      { "page": "Financial Reports", "allowedRoles": ["Treasurer", "President"] }
    ],
    "brandAssetsProvided": true
  }
}
```

---

### 9. Risks (risks)

Known issues or concerns we should track.

**Example:**
```json
{
  "risks": {
    "identifiedRisks": [
      {
        "description": "Some member emails may be outdated",
        "severity": "medium",
        "mitigation": "Send verification email after migration"
      }
    ],
    "acceptedRisks": [
      {
        "description": "Historical event attendance data will not be migrated",
        "acceptedBy": "Jane Smith",
        "reviewDate": "2024-12-15"
      }
    ]
  }
}
```

---

### 10. Success Criteria (successCriteria)

What must be true for us to go live.

**Required fields:**
- `goLiveDefinition` - Plain description of what "done" means

**Example:**
```json
{
  "successCriteria": {
    "goLiveDefinition": "All active members can log in, view events, and register. Board can access reports. Payments work.",
    "mustHave": [
      "Member login functional",
      "Event registration working",
      "Payment processing tested",
      "Board trained on admin tools"
    ],
    "noGoConditions": [
      "Member data not validated",
      "No backup/restore test completed",
      "Board has not signed off"
    ],
    "targetDate": "2025-02-01"
  }
}
```

---

## Minimum Viable Intake

At absolute minimum, we need:

```json
{
  "org": {
    "name": "Your Organization Name",
    "timezone": "America/Los_Angeles"
  },
  "contacts": {
    "systemOwner": {
      "name": "Primary Contact Name",
      "email": "contact@example.org"
    }
  },
  "dataSources": {
    "memberExport": {
      "type": "csv",
      "notes": "Will be provided from legacy membership platform"
    }
  },
  "successCriteria": {
    "goLiveDefinition": "Members can log in and register for events."
  }
}
```

This is enough to start a conversation. We will fill in details together.

---

## Common Pitfalls

### 1. Incomplete Contact Information

**Problem:** Only one contact provided, and that person goes on vacation.

**Fix:** Provide at least two contacts. The system owner and one backup.

### 2. Vague Success Criteria

**Problem:** "Everything should work" is not testable.

**Fix:** Be specific. "Members can log in" is testable. "The system is good" is not.

### 3. Missing Data Export Details

**Problem:** "We have member data somewhere" does not help.

**Fix:** Specify format (CSV, JSON), location (Google Drive folder, email attachment), and approximate record count.

### 4. Undocumented Policies

**Problem:** "We handle renewals case by case" creates ambiguity.

**Fix:** Write down your actual policy, even if informal. We need to know what rules to encode.

### 5. Assuming Permissions Are Simple

**Problem:** "Everyone on the board should have access" does not define what access means.

**Fix:** List specific capabilities. Can they view members? Edit events? See finances? Delete content?

### 6. Ignoring Risks

**Problem:** Pretending there are no risks does not make them disappear.

**Fix:** Document known issues. Accepted risks are fine if documented. Hidden risks cause incidents.

### 7. No Go-Live Date

**Problem:** Without a target date, scope expands indefinitely.

**Fix:** Pick a realistic date. It can move if needed, but having one focuses decisions.

---

## Next Steps

1. Fill out what you can
2. Send to your ClubOS contact
3. We will schedule a review call to fill gaps
4. Final intake becomes the implementation contract

Questions? Reach out to your ClubOS implementation contact.
