# ClubOS

Admin and membership management system.

## Development

### Install Dependencies
npm install

### Run Dev Server
npm run dev

### Testing
See docs/INDEX.md for full testing instructions.

- make test-api
- make test-admin
- make test-changed
- make smoke
- make preflight

### Documentation

Full documentation index:
- docs/INDEX.md

Quick links:

#### Developer Guides
- docs/ONBOARDING.md
- docs/DEVELOPMENT_WORKFLOW.md
- docs/ADMIN_ARCHITECTURE_MAP.md

#### Admin Feature Guides
- docs/ADMIN_DASHBOARD_OVERVIEW.md
- docs/ADMIN_MEMBERS_UI.md
- docs/ADMIN_EVENTS_UI.md
- docs/ADMIN_REGISTRATIONS_UI.md
- docs/ADMIN_ACTIVITY_UI.md

#### API Reference
- docs/API_SURFACE.md

#### Navigation Overview
- docs/NAV.md

### Tooling

#### Development Scripts (scripts/dev)
- doctor.sh
- smoke.sh
- preflight.sh
- install-git-hooks.sh
- collect-diagnostics.sh
- test-changed.sh
- playwright-clean.sh
- playwright-report.sh

All scripts are ASCII-only, zsh-based, and autodetect the project root.

