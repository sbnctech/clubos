/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
export type FileObjectType = "EVENT" | "MEMBER" | "COMMITTEE" | "BOARD_RECORD" | "GENERAL";
export type FileVisibility = "PUBLIC" | "MEMBERS_ONLY" | "COMMITTEE_ONLY" | "BOARD_ONLY" | "PRIVATE";
export interface AuthorizationResult { authorized: boolean; reason?: string; }
export async function authorizeFileAccess(_p: any): Promise<AuthorizationResult> { throw new Error("Not implemented"); }
export async function authorizeFileList(_p: any): Promise<AuthorizationResult> { throw new Error("Not implemented"); }
export function getVisibilityFilter(_p: any): any { throw new Error("Not implemented"); }
