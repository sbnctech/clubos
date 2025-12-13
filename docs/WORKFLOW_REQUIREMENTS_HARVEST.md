# Workflow Requirements Harvest

This document extracts durable business rules and workflow requirements from SBNC
training materials. These rules should be encoded in ClubOS to preserve
organizational knowledge independent of the current platform (Wild Apricot).

Source documents:
- HOW_TO_Events.html
- HOW_TO_Leadership_and_Committees.html
- HOW_TO_Install_New_Leadership.html
- COMMITTEE_CHAIRS_INVESTIGATION.md

---

## 1. Event Management Rules

### 1.1 Event Lifecycle States

Events progress through these states:

- **Draft** - Event created but not visible
- **Published** - Event visible and accepting registrations
- **Registration Closed** - Past registration deadline
- **Cancelled** - Event will not occur (registration data preserved)
- **Completed** - Event occurred
- **Deleted** - Removed from system (NOT RECOMMENDED - use Cancelled)

**Rule: Cancel vs Delete**
- CANCEL preserves registration history and sends automatic cancellation emails
- DELETE removes all data with no notification and no audit trail
- System SHOULD warn before delete and recommend cancel instead

### 1.2 Registration Types

Each event can have multiple registration types with:

- Name (e.g., "Member", "Guest", "Couple")
- Price (0 for free events)
- Availability restrictions:
  - All contacts
  - Members only
  - Specific membership levels
- Capacity limit per type (optional)
- Guest registration enabled/disabled

**Common patterns:**
- Members-Only Free: Single type, $0, members only
- Event with Guest Option: Member type + Guest type at different prices
- Couple Registration: Single type with "allow multiple registrants"

### 1.3 Waitlist Management

**Automatic behavior:**
- When event reaches capacity, new registrations go to waitlist
- Waitlisted registrants receive automatic "You're on the wait list" notification
- When a registered member cancels, earliest waitlisted member is promoted
- Promoted member receives automatic confirmation notification

**Manual override:**
- Admin can manually confirm a waitlisted registration
- This bypasses FIFO order (use for special circumstances only)

**Configuration:**
- Waitlist enabled/disabled per event
- Maximum waitlist size (optional)

### 1.4 Event Cancellation Workflow

When cancelling an event:

1. **Mark event as cancelled** (recommended approach)
   - Add "[CANCELLED]" to event name
   - Update description with cancellation notice
   - Disable further registration
   - This preserves all registration data

2. **Cancel all registrations** (optional additional step)
   - Each registrant receives cancellation notification
   - Registration status changes to "Cancelled"

3. **Send custom notification** (optional)
   - Compose explanation of cancellation
   - Send to all affected registrants

4. **Process refunds** (if applicable)
   - Handled separately via finance workflow
   - Refund requires Finance Manager approval (see FINANCE_ROLES.md)

### 1.5 Registration Recovery (After Accidental Deletion)

If an event is accidentally deleted:

1. Recreate event with same details
2. Find original registrants via:
   - Email notifications (personal records)
   - Database backup (contact Tech Chair)
   - Historical reports (may still contain deleted events)
3. Manually re-register each attendee
4. Mark registrations with note: "Re-registered after system error"
5. Communicate with affected registrants
6. Do NOT re-charge if payments were already processed

**Prevention rule:** Always use Cancel instead of Delete

---

## 2. Committee and Leadership Structure

### 2.1 Committee Chair Storage Pattern

Committee chairs are stored as special "Admin" contacts:

- **MembershipLevel:** "Admins" (not regular member levels)
- **FirstName:** Committee name (e.g., "Dining In", "Games")
- **LastName:** "{CommitteeName} Event_Chair" (e.g., "Dining In Event_Chair")
- **Email:** Generic committee email (e.g., games@sbnewcomers.org)
- **Custom Fields:**
  - "Board or Chair member names" - Chair person names (one per line if multiple)
  - "Board or Chair member emails" - Chair personal emails (one per line if multiple)
  - "Committee description" - Optional description

**Rule: Committee contacts are NOT counted as members**

### 2.2 Leadership Positions

Board positions with role emails:

| Position | Role Email |
|----------|------------|
| President | president@sbnewcomers.org |
| 1st Vice President | vicepresident@sbnewcomers.org |
| 2nd Vice President | vicepresident2@sbnewcomers.org |
| Secretary | secretary@sbnewcomers.org |
| Treasurer | treasurer@sbnewcomers.org |
| Activities VP | activities@sbnewcomers.org |
| Membership VP | membership@sbnewcomers.org |
| Technology Chair | technology@sbnewcomers.org |
| Communications | communications@sbnewcomers.org |

**Rule: Role emails are stable; personal emails change with transitions**

### 2.3 Leadership Transition Timing

- Transitions occur on term boundaries: February 1 or August 1
- System should support transition workflows around these dates
- Outgoing and incoming officers overlap briefly for handoff

### 2.4 Committee Lifecycle

**Adding a committee:**
1. Create Admin contact with naming convention
2. Set up email forward to chair's personal email
3. Test email delivery

**Deactivating a committee ("Going Dark"):**
1. Redirect committee email to activities@sbnewcomers.org
2. Clear chair names/emails OR change status to "Lapsed"
3. Mark as "Currently Inactive" on website
4. Document when/why committee went dark and last chair

**Removing a committee:**
- Do NOT delete - use Archive or change Status to "Lapsed"
- Remove or redirect email forward

---

## 3. Email Forwarding Rules

### 3.1 Architecture

Role emails forward to personal emails:
- Role email is permanent (president@sbnewcomers.org)
- Forward destination changes when person changes
- Multiple co-chairs can share a single role email (comma-separated destinations)

### 3.2 Testing Requirements

After any email forward change:
1. Send test email to role address
2. New recipient confirms receipt
3. Old recipient confirms non-receipt

### 3.3 Inactive Committee Handling

When a committee has no chair:
- Forward committee email to activities@sbnewcomers.org
- Activities VP receives inquiries and can respond or recruit

---

## 4. Admin Access Rules

### 4.1 Administrator Levels

- **Full Administrator:** Complete access to all settings
- **Limited Administrator:** Restricted access per configuration

### 4.2 Access Requirements

**Minimum requirements:**
- Always maintain at least 2 full administrators
- Remove admin access when people leave roles
- Review admin list quarterly

**Position-based access needs:**

| Position | Required Access |
|----------|-----------------|
| President | Full admin |
| Treasurer | Finance admin + Bank accounts |
| Technology Chair | Full admin + Server + All technical accounts |
| Activities VP | Events admin + Jotform |
| Communications | Email admin + Social media |

### 4.3 Credential Handoff

During leadership transitions:
- Rotate passwords for shared accounts
- Update sealed envelope for President (emergency access)
- Document any ongoing projects/issues

---

## 5. Event Submission Workflow (Jotform Pipeline)

### 5.1 Workflow Steps

1. Committee submits event via Jotform
2. Submission triggers email to activities@sbnewcomers.org
3. Activities VP reviews and approves in Jotform
4. Approval triggers email to posting-team@sbnewcomers.org
5. Posting team creates event in system
6. Posting team marks "posted" in Jotform
7. Activities VP activates event in system
8. Confirmation email sent to original submitter

### 5.2 Roles in Pipeline

- **Committee Chair:** Initiates event request
- **Activities VP:** Approves content and activates final event
- **Posting Team:** Creates event in system (data entry)
- **Submitter:** Receives final confirmation

### 5.3 Asset Recovery

If event images are lost:
1. Log into Jotform with admin account
2. Find original submission
3. Download attachments

---

## 6. Verification Checklists

### 6.1 Leadership Transition Verification

**Before transition:**
- [ ] New person has member account
- [ ] New person's email address confirmed
- [ ] Handoff meeting scheduled

**System updates:**
- [ ] Member role field updated for new officer
- [ ] Role removed from outgoing officer
- [ ] Committee admin contact updated (if committee chair)
- [ ] Admin access permissions reviewed

**Email forwarding:**
- [ ] Forward updated in system
- [ ] New forward tested
- [ ] Outgoing person notified of forward change

**Website updates:**
- [ ] Leadership page updated and published
- [ ] Committees page updated (if applicable)
- [ ] Contact info pages updated

**Credential handoff:**
- [ ] Passwords rotated during handoff meeting
- [ ] Emergency access envelope updated
- [ ] Role-specific documentation reviewed

### 6.2 Event Cancellation Verification

- [ ] Event marked as cancelled (not deleted)
- [ ] Registrants notified
- [ ] Refunds processed (if applicable)
- [ ] Wait for Finance Manager approval before executing refunds

---

## 7. Derived Requirements for ClubOS

Based on the above workflows, ClubOS must support:

### 7.1 Event Subsystem Requirements

- Registration type configuration with price, availability, and capacity
- Automatic waitlist with FIFO promotion
- Cancellation workflow that preserves history
- Soft delete (cancelled state) vs hard delete distinction
- Event cloning for recurring events
- Registration recovery/manual entry

### 7.2 Contact Subsystem Requirements

- Admin/committee contact type distinct from member contacts
- Custom fields for chair names and emails
- Status field supporting "Lapsed" and "Archived"
- Committee → Chair relationship tracking

### 7.3 Role and Permission Requirements

- Full vs Limited administrator distinction
- Position-based permission sets
- Minimum administrator count enforcement
- Admin access audit log

### 7.4 Email Requirements

- Role-based email addresses (stable)
- Forward destination management (changes with people)
- Multi-recipient forwarding (co-chairs)
- Test email delivery verification

### 7.5 Workflow Requirements

- Event submission pipeline with approval gates
- Leadership transition workflow with checklists
- Committee activation/deactivation workflow
- Credential rotation tracking

---

## 8. Policy Gates (Approvals Required)

These actions require explicit approval before execution:

| Action | Approver | Reason |
|--------|----------|--------|
| Event activation | Activities VP | Content quality gate |
| Refund execution | Finance Manager | Money movement authorization |
| Committee deactivation | Activities VP | Impact on member programs |
| Admin access grant | President or existing admin | Security control |
| Password rotation | Tech Chair + President | Emergency access preservation |
| Event deletion (vs cancel) | System warning + confirmation | Data preservation |

---

## 9. Cross-References

- Finance roles and refund workflow: docs/rbac/FINANCE_ROLES.md
- Event Chair workflow: docs/workflows/EVENT_CHAIR_WORKFLOW.md
- Finance Manager workflow: docs/workflows/FINANCE_MANAGER_WORKFLOW.md
- QuickBooks integration: docs/QUICKBOOKS_INTEGRATION.md

---

End of harvest document.
