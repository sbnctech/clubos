export type ReleaseClass = "experimental" | "candidate" | "stable";

export type ReleaseClassificationResult = {
  valid: boolean;
  classification: ReleaseClass | null;
  error: string | null;
  selectedCount: number;
};

const CLASSES: ReleaseClass[] = ["experimental", "candidate", "stable"];

function normalize(s: string): string {
  return (s || "").trim().toLowerCase();
}

function firstNonEmptyLine(text: string): string {
  for (const line of (text || "").split(/\r?\n/)) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

function parseCheckedBoxes(text: string): ReleaseClass[] {
  const hits: ReleaseClass[] = [];
  const re = /-\s*\[\s*[xX]\s*\]\s*(experimental|candidate|stable)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const v = normalize(m[1]);
    if ((CLASSES as string[]).includes(v)) hits.push(v as ReleaseClass);
  }
  return hits;
}

function parseFirstLineToken(text: string): ReleaseClass[] {
  const line = normalize(firstNonEmptyLine(text));
  if ((CLASSES as string[]).includes(line)) return [line as ReleaseClass];
  return [];
}

export function parseReleaseClassification(text: string): ReleaseClassificationResult {
  const raw = (text || "").trim();
  if (!raw) {
    return { valid: false, classification: null, error: "PR body is empty", selectedCount: 0 };
  }

  const checked = parseCheckedBoxes(raw);
  const candidates = checked.length > 0 ? checked : parseFirstLineToken(raw);

  const uniq = Array.from(new Set(candidates));
  if (uniq.length === 1) {
    return { valid: true, classification: uniq[0], error: null, selectedCount: 1 };
  }
  if (uniq.length === 0) {
    return {
      valid: false,
      classification: null,
      error: "No release classification selected. Select one of: experimental, candidate, stable",
      selectedCount: 0,
    };
  }
  return {
    valid: false,
    classification: null,
    error: `Multiple classifications selected: ${uniq.join(", ")}`,
    selectedCount: uniq.length,
  };
}
