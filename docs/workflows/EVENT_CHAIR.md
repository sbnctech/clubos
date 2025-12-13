# Event Chair Workflow

## Purpose

Enable Event Chairs to manage event cancellations and waitlist substitutions with clear handoffs to Finance Manager for any refund processing.

## Who uses this

- Event Chairs
- VPs of Activities
- Category Chairs with event management responsibilities

## Preconditions

- User has Event Chair role or equivalent permissions
- Event exists and has registrations
- Cancellation request has been received from a registered member

## Primary steps

1. Receive and verify cancellation request from member
2. Confirm member identity and registration status
3. Execute cancellation (change registration status to CANCELLED)
4. Check waitlist for eligible replacement
5. If replacement exists, promote next waitlist member to REGISTERED
6. Notify affected members (cancelled member and promoted member if applicable)
7. If refund is needed, initiate refund request (handoff to Finance Manager)
8. Record reason code and any notes

## Inputs

- Member cancellation request (verbal, email, or system)
- Member identity verification
- Event and registration details
- Waitlist state

## Outputs

- Updated registration status (CANCELLED)
- Waitlist promotion (if applicable)
- Member notifications sent
- Refund request created (if applicable, forwarded to Finance Manager)

## Audit trail

- Who requested the cancellation (member)
- Who executed the cancellation (Event Chair)
- Timestamp of cancellation
- Replacement member ID (if any)
- Timestamp of waitlist promotion
- Reason code (voluntary, emergency, no-show, etc.)
- Notes field for exceptional circumstances

## Failure modes and guardrails

- **Cancellation without notification**: System requires confirmation before status change
- **Waitlist promotion skipped**: System auto-identifies next eligible member
- **Refund executed by Event Chair**: System blocks direct refund; must go through Finance Manager
- **Out-of-order waitlist promotion**: System enforces timestamp priority
- **Household limit violation**: System checks compliance before promotion

## Open questions

- Should Event Chairs be able to batch-cancel multiple registrations?
- Should there be a deadline after which Event Chairs cannot cancel without VP approval?
- How should guest registrations (non-members) be handled differently?
