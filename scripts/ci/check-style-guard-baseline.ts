import fs from "node:fs";
import path from "node:path";

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const baselinePath = path.join(process.cwd(), "scripts/ci/style-guard-baseline.json");
  if (!fs.existsSync(baselinePath)) {
    console.error("FAIL: missing baseline file:", baselinePath);
    process.exit(1);
  }

  const baseline = readJson(baselinePath);
  const max = Number(baseline?.max_findings ?? 0);
  const count = Number(process.env.STYLE_GUARD_FINDINGS_COUNT ?? 0);

  console.log(`STYLE_GUARD_BASELINE_MAX=${max}`);
  console.log(`STYLE_GUARD_FINDINGS_COUNT=${count}`);

  if (!Number.isFinite(max) || !Number.isFinite(count)) {
    console.error("FAIL: baseline max/findings must be numbers.");
    process.exit(1);
  }

  if (count > max) {
    console.error("");
    console.error("FAIL: style-guard baseline regression detected.");
    console.error(`Expected <= ${max} findings but got ${count}.`);
    console.error("Fix: convert new inline styles / hex colors to tokens.");
    process.exit(1);
  }

  console.log("OK: no regression vs baseline.");
}

main();
