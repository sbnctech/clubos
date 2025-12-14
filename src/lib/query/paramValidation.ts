export type ParamSpec = {
  allowedKeys: string[];
  allowedSortKeys?: string[];
  maxPageSize: number;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateTemplateParams(
  spec: ParamSpec,
  params: Record<string, unknown>,
): ValidationResult {
  const keys = Object.keys(params);
  for (const key of keys) {
    if (!spec.allowedKeys.includes(key)) {
      return { ok: false, reason: `Unknown param key: ${key}` };
    }
  }
  return { ok: true };
}

export function clampPageSize(
  spec: ParamSpec,
  requested: number | undefined | null,
): number {
  if (requested === undefined || requested === null) {
    return spec.maxPageSize;
  }
  const floored = Math.floor(requested);
  if (floored < 1) {
    return 1;
  }
  if (floored > spec.maxPageSize) {
    return spec.maxPageSize;
  }
  return floored;
}
