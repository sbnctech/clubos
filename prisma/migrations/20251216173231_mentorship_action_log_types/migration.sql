-- Add new mentorship action types to AuditAction enum
-- These enable distinct tracking of mentor-newbie registration and attendance overlap
-- Reference: docs/governance/MENTOR_ACTION_LOG_SIGNALS.md

-- Add MENTOR_NEWBIE_SHARED_REGISTRATION action type
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MENTOR_NEWBIE_SHARED_REGISTRATION';

-- Add MENTOR_NEWBIE_SHARED_ATTENDANCE action type
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'MENTOR_NEWBIE_SHARED_ATTENDANCE';
