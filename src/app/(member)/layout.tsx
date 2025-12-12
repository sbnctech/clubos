import MemberLayout from "@/components/layout/MemberLayout";

/**
 * Member Route Group Layout
 *
 * This layout file wraps ALL routes under the (member) route group.
 * The parentheses in "(member)" mean this is a route group - it organizes
 * files without affecting the URL structure.
 *
 * Routes using this layout:
 *   /member          -> My Club home page
 *   /member/events   -> Events list (TODO)
 *   /member/account  -> Account settings (TODO)
 */

export default function MemberRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MemberLayout>{children}</MemberLayout>;
}
