// Authorization helpers.
// RBAC decides which endpoints can be called.
// These helpers are for row-level (data-level) authorization.

export type Role = "ADMIN" | "VP_ACTIVITIES" | "EVENT_CHAIR" | "MEMBER";

export type UserContext = {
  id: string;
  role: Role;
};

export type EventRecord = {
  id: string;
  ownerId?: string | null;
};

export function canManageAnyEvent(user: UserContext): boolean {
  return user.role === "ADMIN";
}

export function canManageEvent(user: UserContext, event: EventRecord): boolean {
  if (canManageAnyEvent(user)) return true;
  if (user.role === "EVENT_CHAIR") return !!event.ownerId && event.ownerId === user.id;

  // VP_ACTIVITIES support requires "chair reports to VP" relationship data.
  // That will be implemented once we add the reporting model to Prisma.
  return false;
}
