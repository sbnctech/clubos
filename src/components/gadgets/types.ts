/**
 * Shared type definitions for gadget components.
 *
 * All gadgets receive a common set of props from GadgetHost.
 * This file defines those shared types.
 */

/**
 * GadgetProps - Common props that all gadget components receive.
 *
 * slot: Layout slot hint used by the GadgetHost to position the gadget.
 *       Values: "primary", "secondary", "sidebar"
 */
export type GadgetProps = {
  slot?: string;
};

/**
 * EventSummary - Minimal event data for display in gadgets.
 *
 * This type is used by the UpcomingEventsGadget to display
 * a list of events the member can register for.
 */
export type EventSummary = {
  id: string;
  title: string;
  date: string;
  spotsAvailable: number;
};

/**
 * RegistrationSummary - Minimal registration data for display in gadgets.
 *
 * This type is used by the MyRegistrationsGadget to display
 * a list of events the member has signed up for.
 */
export type RegistrationSummary = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  status: "REGISTERED" | "WAITLISTED" | "CANCELLED";
};
