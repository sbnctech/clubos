/**
 * Wild Apricot Transformers Unit Tests
 *
 * Tests for field transformation, status mapping, and data validation.
 */

import { describe, it, expect } from "vitest";
import {
  transformContact,
  transformEvent,
  transformRegistration,
  mapContactStatusToCode,
  mapRegistrationStatus,
  extractFieldValue,
  extractPhone,
  normalizeEmail,
  parseDate,
  deriveCategory,
  getMemberChanges,
  getEventChanges,
  hasChanged,
} from "@/lib/importing/wildapricot/transformers";
import {
  WAContact,
  WAEvent,
  WAEventRegistration,
  WAFieldValue,
} from "@/lib/importing/wildapricot/types";

// ============================================================================
// Status Mapping Tests
// ============================================================================

describe("Status Mappings", () => {
  describe("mapContactStatusToCode", () => {
    it("maps Active to active", () => {
      expect(mapContactStatusToCode("Active")).toBe("active");
    });

    it("maps Lapsed to lapsed", () => {
      expect(mapContactStatusToCode("Lapsed")).toBe("lapsed");
    });

    it("maps PendingNew to pending_new", () => {
      expect(mapContactStatusToCode("PendingNew")).toBe("pending_new");
    });

    it("maps PendingRenewal to pending_renewal", () => {
      expect(mapContactStatusToCode("PendingRenewal")).toBe("pending_renewal");
    });

    it("maps Suspended to suspended", () => {
      expect(mapContactStatusToCode("Suspended")).toBe("suspended");
    });

    it("maps NotAMember to not_a_member", () => {
      expect(mapContactStatusToCode("NotAMember")).toBe("not_a_member");
    });
  });

  describe("mapRegistrationStatus", () => {
    it("maps Confirmed to CONFIRMED", () => {
      expect(mapRegistrationStatus("Confirmed", false)).toBe("CONFIRMED");
    });

    it("maps Cancelled to CANCELLED", () => {
      expect(mapRegistrationStatus("Cancelled", false)).toBe("CANCELLED");
    });

    it("maps PendingPayment to PENDING_PAYMENT", () => {
      expect(mapRegistrationStatus("PendingPayment", false)).toBe("PENDING_PAYMENT");
    });

    it("returns WAITLISTED when onWaitlist is true regardless of status", () => {
      expect(mapRegistrationStatus("Confirmed", true)).toBe("WAITLISTED");
      expect(mapRegistrationStatus("PendingPayment", true)).toBe("WAITLISTED");
    });

    it("maps NoShow to NO_SHOW", () => {
      expect(mapRegistrationStatus("NoShow", false)).toBe("NO_SHOW");
    });
  });
});

// ============================================================================
// Field Extraction Tests
// ============================================================================

describe("Field Extraction", () => {
  describe("extractFieldValue", () => {
    const fieldValues: WAFieldValue[] = [
      { FieldName: "Phone", SystemCode: "phone", Value: "805-555-1234" },
      { FieldName: "City", SystemCode: "city", Value: "Santa Barbara" },
      { FieldName: "ZipCode", SystemCode: "zip", Value: 93101 },
    ];

    it("extracts value by FieldName", () => {
      expect(extractFieldValue(fieldValues, "Phone")).toBe("805-555-1234");
    });

    it("extracts value by SystemCode", () => {
      expect(extractFieldValue(fieldValues, "phone")).toBe("805-555-1234");
    });

    it("returns null for missing field", () => {
      expect(extractFieldValue(fieldValues, "NonExistent")).toBeNull();
    });

    it("handles numeric values", () => {
      expect(extractFieldValue(fieldValues, "ZipCode")).toBe(93101);
    });
  });

  describe("extractPhone", () => {
    it("extracts and cleans phone number", () => {
      const fieldValues: WAFieldValue[] = [
        { FieldName: "Phone", SystemCode: "phone", Value: "(805) 555-1234" },
      ];
      expect(extractPhone(fieldValues)).toBe("8055551234");
    });

    it("preserves + prefix for international numbers", () => {
      const fieldValues: WAFieldValue[] = [
        { FieldName: "Phone", SystemCode: "phone", Value: "+1-805-555-1234" },
      ];
      expect(extractPhone(fieldValues)).toBe("+18055551234");
    });

    it("returns null for missing phone", () => {
      expect(extractPhone([])).toBeNull();
    });

    it("returns null for empty phone string", () => {
      const fieldValues: WAFieldValue[] = [
        { FieldName: "Phone", SystemCode: "phone", Value: "" },
      ];
      expect(extractPhone(fieldValues)).toBeNull();
    });
  });

  describe("normalizeEmail", () => {
    it("lowercases email", () => {
      expect(normalizeEmail("John.Doe@Example.COM")).toBe("john.doe@example.com");
    });

    it("trims whitespace", () => {
      expect(normalizeEmail("  john@example.com  ")).toBe("john@example.com");
    });

    it("returns null for null input", () => {
      expect(normalizeEmail(null)).toBeNull();
    });

    it("returns null for invalid email without @", () => {
      expect(normalizeEmail("notanemail")).toBeNull();
    });

    it("returns null for invalid email without .", () => {
      expect(normalizeEmail("not@email")).toBeNull();
    });
  });

  describe("parseDate", () => {
    it("parses ISO8601 date string", () => {
      const date = parseDate("2024-01-15T10:30:00-08:00");
      expect(date).toBeInstanceOf(Date);
      expect(date?.toISOString()).toBe("2024-01-15T18:30:00.000Z");
    });

    it("parses date-only string", () => {
      const date = parseDate("2024-01-15");
      expect(date).toBeInstanceOf(Date);
    });

    it("returns null for null input", () => {
      expect(parseDate(null)).toBeNull();
    });

    it("returns null for invalid date", () => {
      expect(parseDate("not-a-date")).toBeNull();
    });
  });
});

// ============================================================================
// Category Derivation Tests
// ============================================================================

describe("deriveCategory", () => {
  it("derives category from organizer email prefix", () => {
    const event: WAEvent = {
      Id: 1,
      Name: "Wine Tasting Event",
      StartDate: "2024-01-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: [],
      Details: {
        DescriptionHtml: null,
        Organizer: {
          Id: 123,
          Name: "Wine Committee",
          Email: "wine@sbnewcomers.org",
        },
        RegistrationTypes: [],
      },
      Url: "",
    };

    expect(deriveCategory(event)).toBe("Wine Appreciation");
  });

  it("falls back to first tag when no matching email pattern", () => {
    const event: WAEvent = {
      Id: 1,
      Name: "Mystery Event",
      StartDate: "2024-01-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: ["Social", "Members Only"],
      Details: {
        DescriptionHtml: null,
        Organizer: {
          Id: 123,
          Name: "Someone",
          Email: "someone@sbnewcomers.org",
        },
        RegistrationTypes: [],
      },
      Url: "",
    };

    expect(deriveCategory(event)).toBe("Social");
  });

  it("returns null when no category can be derived", () => {
    const event: WAEvent = {
      Id: 1,
      Name: "Generic Event",
      StartDate: "2024-01-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: [],
      Details: null,
      Url: "",
    };

    expect(deriveCategory(event)).toBeNull();
  });

  it("recognizes hiking committee email", () => {
    const event: WAEvent = {
      Id: 1,
      Name: "Morning Hike",
      StartDate: "2024-01-15T08:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: [],
      Details: {
        DescriptionHtml: null,
        Organizer: {
          Id: 456,
          Name: "Happy Hikers",
          Email: "hiking@sbnewcomers.org",
        },
        RegistrationTypes: [],
      },
      Url: "",
    };

    expect(deriveCategory(event)).toBe("Happy Hikers");
  });
});

// ============================================================================
// Contact Transform Tests
// ============================================================================

describe("transformContact", () => {
  const membershipStatusId = "status-uuid-123";

  it("transforms valid contact to member input", () => {
    const contact: WAContact = {
      Id: 12345,
      FirstName: "John",
      LastName: "Doe",
      Email: "john.doe@example.com",
      DisplayName: "John Doe",
      Organization: null,
      MembershipLevel: { Id: 1, Name: "Newcomer", Url: "" },
      Status: "Active",
      MemberSince: "2024-01-01T00:00:00",
      IsSuspendedMember: false,
      ProfileLastUpdated: "2024-12-01T00:00:00",
      IsAccountAdministrator: false,
      FieldValues: [
        { FieldName: "Phone", SystemCode: "phone", Value: "(805) 555-1234" },
      ],
    };

    const result = transformContact(contact, membershipStatusId);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.firstName).toBe("John");
    expect(result.data?.lastName).toBe("Doe");
    expect(result.data?.email).toBe("john.doe@example.com");
    expect(result.data?.phone).toBe("8055551234");
  });

  it("fails for missing email", () => {
    const contact: WAContact = {
      Id: 12345,
      FirstName: "John",
      LastName: "Doe",
      Email: null,
      DisplayName: "John Doe",
      Organization: null,
      MembershipLevel: null,
      Status: "Active",
      MemberSince: "2024-01-01T00:00:00",
      IsSuspendedMember: false,
      ProfileLastUpdated: null,
      IsAccountAdministrator: false,
      FieldValues: [],
    };

    const result = transformContact(contact, membershipStatusId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid or missing email");
  });

  it("fails for missing first name", () => {
    const contact: WAContact = {
      Id: 12345,
      FirstName: null,
      LastName: "Doe",
      Email: "john@example.com",
      DisplayName: "Doe",
      Organization: null,
      MembershipLevel: null,
      Status: "Active",
      MemberSince: "2024-01-01T00:00:00",
      IsSuspendedMember: false,
      ProfileLastUpdated: null,
      IsAccountAdministrator: false,
      FieldValues: [],
    };

    const result = transformContact(contact, membershipStatusId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing first name");
  });

  it("uses CreationDate as fallback for MemberSince", () => {
    const contact: WAContact = {
      Id: 12345,
      FirstName: "John",
      LastName: "Doe",
      Email: "john@example.com",
      DisplayName: "John Doe",
      Organization: null,
      MembershipLevel: null,
      Status: "Active",
      MemberSince: null,
      IsSuspendedMember: false,
      ProfileLastUpdated: null,
      IsAccountAdministrator: false,
      FieldValues: [],
      CreationDate: "2024-06-15T00:00:00",
    };

    const result = transformContact(contact, membershipStatusId);

    expect(result.success).toBe(true);
    expect(result.data?.joinedAt).toBeInstanceOf(Date);
  });
});

// ============================================================================
// Event Transform Tests
// ============================================================================

describe("transformEvent", () => {
  it("transforms valid event to event input", () => {
    const event: WAEvent = {
      Id: 67890,
      Name: "Wine Tasting",
      StartDate: "2024-06-15T18:00:00-07:00",
      EndDate: "2024-06-15T21:00:00-07:00",
      Location: "Member's Home",
      RegistrationEnabled: true,
      RegistrationsLimit: 20,
      ConfirmedRegistrationsCount: 15,
      PendingRegistrationsCount: 2,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: ["Social"],
      Details: {
        DescriptionHtml: "<p>Join us for wine tasting!</p>",
        Organizer: null,
        RegistrationTypes: [],
      },
      Url: "",
    };

    const result = transformEvent(event);

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe("Wine Tasting");
    expect(result.data?.location).toBe("Member's Home");
    expect(result.data?.capacity).toBe(20);
    expect(result.data?.isPublished).toBe(true);
    expect(result.data?.description).toBe("Join us for wine tasting!");
  });

  it("fails for missing event name", () => {
    const event: WAEvent = {
      Id: 67890,
      Name: "",
      StartDate: "2024-06-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: [],
      Details: null,
      Url: "",
    };

    const result = transformEvent(event);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Missing name");
  });

  it("sets isPublished false for Restricted events", () => {
    const event: WAEvent = {
      Id: 67890,
      Name: "Private Event",
      StartDate: "2024-06-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Restricted",
      Tags: [],
      Details: null,
      Url: "",
    };

    const result = transformEvent(event);

    expect(result.success).toBe(true);
    expect(result.data?.isPublished).toBe(false);
  });

  it("connects event chair when provided", () => {
    const event: WAEvent = {
      Id: 67890,
      Name: "Test Event",
      StartDate: "2024-06-15T18:00:00",
      EndDate: null,
      Location: null,
      RegistrationEnabled: true,
      RegistrationsLimit: null,
      ConfirmedRegistrationsCount: 0,
      PendingRegistrationsCount: 0,
      CheckedInAttendeesCount: 0,
      AccessLevel: "Public",
      Tags: [],
      Details: null,
      Url: "",
    };

    const result = transformEvent(event, "chair-uuid-123");

    expect(result.success).toBe(true);
    expect(result.data?.eventChair).toEqual({ connect: { id: "chair-uuid-123" } });
  });
});

// ============================================================================
// Registration Transform Tests
// ============================================================================

describe("transformRegistration", () => {
  it("transforms valid registration to registration input", () => {
    const registration: WAEventRegistration = {
      Id: 99999,
      Event: { Id: 67890, Name: "Wine Tasting", StartDate: "2024-06-15" },
      Contact: { Id: 12345, Name: "John Doe", Email: "john@example.com" },
      RegistrationType: { Id: 1, Name: "Newcomer" },
      Status: "Confirmed",
      RegistrationDate: "2024-06-01T10:00:00",
      IsCheckedIn: false,
      OnWaitlist: false,
      RegistrationFee: 25,
      PaidSum: 25,
      Memo: null,
    };

    const result = transformRegistration(registration, "event-uuid", "member-uuid");

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe("CONFIRMED");
    expect(result.data?.waitlistPosition).toBeNull();
  });

  it("sets waitlist position for waitlisted registrations", () => {
    const registration: WAEventRegistration = {
      Id: 99999,
      Event: { Id: 67890, Name: "Wine Tasting", StartDate: "2024-06-15" },
      Contact: { Id: 12345, Name: "John Doe", Email: "john@example.com" },
      RegistrationType: null,
      Status: "WaitList",
      RegistrationDate: "2024-06-01T10:00:00",
      IsCheckedIn: false,
      OnWaitlist: true,
      RegistrationFee: 0,
      PaidSum: 0,
      Memo: null,
    };

    const result = transformRegistration(registration, "event-uuid", "member-uuid");

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe("WAITLISTED");
    expect(result.data?.waitlistPosition).toBe(999); // Placeholder
  });
});

// ============================================================================
// Change Detection Tests
// ============================================================================

describe("Change Detection", () => {
  describe("hasChanged", () => {
    it("returns false for equal primitives", () => {
      expect(hasChanged("foo", "foo")).toBe(false);
      expect(hasChanged(123, 123)).toBe(false);
      expect(hasChanged(true, true)).toBe(false);
    });

    it("returns true for different primitives", () => {
      expect(hasChanged("foo", "bar")).toBe(true);
      expect(hasChanged(123, 456)).toBe(true);
      expect(hasChanged(true, false)).toBe(true);
    });

    it("returns false for both null", () => {
      expect(hasChanged(null, null)).toBe(false);
      expect(hasChanged(undefined, undefined)).toBe(false);
      expect(hasChanged(null, undefined)).toBe(false);
    });

    it("returns true when one is null", () => {
      expect(hasChanged("foo", null)).toBe(true);
      expect(hasChanged(null, "foo")).toBe(true);
    });

    it("compares dates by value", () => {
      const date1 = new Date("2024-01-01");
      const date2 = new Date("2024-01-01");
      const date3 = new Date("2024-01-02");

      expect(hasChanged(date1, date2)).toBe(false);
      expect(hasChanged(date1, date3)).toBe(true);
    });
  });

  describe("getMemberChanges", () => {
    it("returns null when no changes", () => {
      const existing = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234",
      };
      const transformed = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234",
        joinedAt: new Date(),
        membershipStatus: { connect: { id: "uuid" } },
      };

      expect(getMemberChanges(existing, transformed)).toBeNull();
    });

    it("returns changed fields only", () => {
      const existing = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "5551234",
      };
      const transformed = {
        firstName: "John",
        lastName: "Smith", // Changed
        email: "john@example.com",
        phone: "5559999", // Changed
        joinedAt: new Date(),
        membershipStatus: { connect: { id: "uuid" } },
      };

      const changes = getMemberChanges(existing, transformed);

      expect(changes).toEqual({
        lastName: "Smith",
        phone: "5559999",
      });
    });
  });

  describe("getEventChanges", () => {
    it("returns null when no changes", () => {
      const existing = {
        title: "Wine Tasting",
        description: "Join us",
        location: "Home",
        category: "Wine",
        capacity: 20,
        isPublished: true,
      };
      const transformed = {
        title: "Wine Tasting",
        description: "Join us",
        location: "Home",
        category: "Wine",
        capacity: 20,
        isPublished: true,
        startTime: new Date(),
      };

      expect(getEventChanges(existing, transformed)).toBeNull();
    });

    it("returns changed fields only", () => {
      const existing = {
        title: "Wine Tasting",
        description: "Join us",
        location: "Home",
        category: "Wine",
        capacity: 20,
        isPublished: true,
      };
      const transformed = {
        title: "Wine Tasting Updated", // Changed
        description: "Join us",
        location: "New Location", // Changed
        category: "Wine",
        capacity: 20,
        isPublished: true,
        startTime: new Date(),
      };

      const changes = getEventChanges(existing, transformed);

      expect(changes).toEqual({
        title: "Wine Tasting Updated",
        location: "New Location",
      });
    });
  });
});
