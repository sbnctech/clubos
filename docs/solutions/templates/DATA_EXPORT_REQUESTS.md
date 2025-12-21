# ClubOS Data Export Requests

Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

---

## Purpose

This document provides export instructions for common membership management systems. Send the relevant section to your client based on their current system.

---

## General Requirements (All Systems)

### Member Data Export

**Required fields:**

| Field | Format | Notes |
|-------|--------|-------|
| First Name | Text | Required |
| Last Name | Text | Required |
| Email | Valid email | Primary contact, required |
| Phone | Any format | Will be normalized |
| Address | Street, City, State, ZIP | Separate fields preferred |
| Member Since | YYYY-MM-DD | Join date |
| Membership Level | Text | Must match tier names |
| Expiration Date | YYYY-MM-DD | Current membership end |
| Status | Active/Lapsed/etc. | Current standing |

**Optional but helpful:**

- Member ID (from source system)
- Secondary email
- Emergency contact
- Dietary restrictions
- Volunteer interests
- Committee memberships

### Event Data Export

**Required fields:**

| Field | Format | Notes |
|-------|--------|-------|
| Event Name | Text | Required |
| Event Date | YYYY-MM-DD | Required |
| Event Time | HH:MM (24hr preferred) | Start time |
| Location | Text | Venue name or address |
| Registration Count | Number | Final attendance |

**Optional but helpful:**

- Event ID (from source system)
- Capacity limit
- Wait list count
- Event type/category
- Fee amount
- Registrant list with names

### Acceptable File Formats

- CSV (preferred)
- Excel (.xlsx)
- JSON
- Tab-delimited text

**Not acceptable:** PDF, screenshots, Word documents

---

## System-Specific Instructions

### Wild Apricot

**Member Export:**

1. Navigate to Contacts → Member directory
2. Click "Export" button (top right)
3. Select "All contacts" or filter as needed
4. Choose "CSV" format
5. Check "Include all fields"
6. Download and rename file per naming convention

**Event Export:**

1. Navigate to Events → All events
2. Set date filter to past 12 months
3. Click "Export" (top right)
4. Select "Event list with registration counts"
5. Choose "CSV" format
6. Download and rename file

**Financial Export:**

1. Navigate to Finances → Invoices
2. Set date range for fiscal year
3. Click "Export"
4. Choose "CSV" format
5. Download and rename file

---

### ClubExpress

**Member Export:**

1. Go to Members → Member List
2. Click "Advanced Search" to include all statuses
3. Click "Export to Excel"
4. Select all available columns
5. Save as CSV after download

**Event Export:**

1. Go to Events → Event Manager
2. Select date range (past 12 months)
3. Click "Reports" → "Event Summary"
4. Export to Excel, save as CSV

**Financial Export:**

1. Go to Accounting → Transaction Report
2. Set date range for fiscal year
3. Export to Excel, save as CSV

---

### MemberPlanet

**Member Export:**

1. Navigate to Members → All Members
2. Click "Export" dropdown
3. Select "Export All Fields"
4. Choose CSV format
5. Download and rename

**Event Export:**

1. Navigate to Events → Past Events
2. Set filter for past 12 months
3. Click "Export Event Data"
4. Include registration details
5. Download as CSV

---

### Memberful

**Member Export:**

1. Go to Members tab
2. Click "Export" button
3. Select all member fields
4. Choose CSV format
5. Download file

**Event Export:**

Note: Memberful focuses on subscriptions, not events. If using a separate event system, export from that system instead.

---

### Generic Spreadsheet/Manual System

If your organization tracks members in Excel, Google Sheets, or a custom database:

**Member Export:**

1. Open your master member spreadsheet
2. Ensure all columns are labeled in row 1
3. Save/export as CSV
4. Verify no merged cells or special formatting

**Event Export:**

1. Compile event records from the past 12 months
2. Create a spreadsheet with columns: Event Name, Date, Location, Attendance
3. Save as CSV

**Required cleanup before export:**

- Remove any formula cells (convert to values)
- Remove merged cells
- Ensure consistent date formats
- Remove blank rows
- Check for duplicate entries

---

## Data Quality Checklist

Before submitting exports, verify:

- [ ] File opens correctly in a text editor or spreadsheet
- [ ] Column headers are present and descriptive
- [ ] Date formats are consistent throughout
- [ ] No obvious duplicates in member list
- [ ] Email addresses appear valid (contain @)
- [ ] No blank required fields (First Name, Last Name, Email)
- [ ] File is named per convention: [ORGNAME]_[DOCTYPE]_[YYYYMMDD].csv

---

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| Dates show as numbers (e.g., 44562) | Open in Excel, format as date, re-save as CSV |
| Special characters corrupted | Re-export with UTF-8 encoding |
| Columns misaligned | Check for commas within fields; use quoted CSV |
| File too large (>10MB) | Split by date range or member status |
| Missing columns | Return to source system and re-export with all fields |

---

## After Export

1. Name files per convention: `[ORGNAME]_[DOCTYPE]_[YYYYMMDD].csv`
2. Upload to secure link (do not email)
3. Note any known issues in the Intake Workbook
4. Retain original export for reference

---

*For field requirements and formats, see: INTAKE_SCHEMA_GUIDE.md*
