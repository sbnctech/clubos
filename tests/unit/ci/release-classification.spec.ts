 import { describe, test, expect } from "vitest";

import { parseReleaseClassification } from "../../../scripts/ci/release-classification";

describe("release classification parser (contract)", () => {
  test("checkbox: candidate", () => {
    const body = `## Release classification (required)
- [ ] experimental
- [x] candidate
- [ ] stable
`;
    const r = parseReleaseClassification(body);
    expect(r.valid).toBe(true);
    expect(r.classification).toBe("candidate");
    expect(r.error).toBeNull();
    expect(r.selectedCount).toBe(1);
  });

  test("first-line token: experimental", () => {
    const body = `experimental

anything else
`;
    const r = parseReleaseClassification(body);
    expect(r.valid).toBe(true);
    expect(r.classification).toBe("experimental");
    expect(r.error).toBeNull();
    expect(r.selectedCount).toBe(1);
  });

  test("none selected", () => {
    const body = `## Release classification (required)
- [ ] experimental
- [ ] candidate
- [ ] stable
`;
    const r = parseReleaseClassification(body);
    expect(r.valid).toBe(false);
    expect(r.classification).toBeNull();
    expect(r.error).toContain("No release classification selected");
    expect(r.selectedCount).toBe(0);
  });

  test("empty body", () => {
    const r = parseReleaseClassification("");
    expect(r.valid).toBe(false);
    expect(r.classification).toBeNull();
    expect(r.error).toContain("PR body is empty");
    expect(r.selectedCount).toBe(0);
  });

  test("multiple checked boxes", () => {
    const body = `## Release classification (required)
- [x] experimental
- [x] stable
`;
    const r = parseReleaseClassification(body);
    expect(r.valid).toBe(false);
    expect(r.classification).toBeNull();
    expect(r.error).toContain("Multiple classifications selected");
    expect(r.error).toContain("experimental");
    expect(r.error).toContain("stable");
    expect(r.selectedCount).toBe(2);
  });
});
