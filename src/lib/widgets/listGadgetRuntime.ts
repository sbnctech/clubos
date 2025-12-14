export type ViewerContext = {
  memberId: string | null;
  roleIds: string[];
  scopes: string[];
};

export type ListGadgetRequest = {
  templateId: string;
  params: Record<string, unknown>;
  cursor?: string | null;
  pageSize?: number | null;
};

export type ListGadgetResponse<T> = {
  items: T[];
  nextCursor: string | null;
  meta: {
    templateId: string;
    pageSize: number;
  };
};

export async function runListGadget<T>(
  req: ListGadgetRequest,
  viewer: ViewerContext,
): Promise<ListGadgetResponse<T>> {
  void req;
  void viewer;
  throw new Error("TODO: implement runListGadget using query template registry + RBAC enforcement");
}
