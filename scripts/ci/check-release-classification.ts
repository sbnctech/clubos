import { parseReleaseClassification } from "./release-classification";

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const bodyArg = process.argv.slice(2).join(" ").trim();
const body = (bodyArg || process.env.PR_BODY || "").trim();

const result = parseReleaseClassification(body);

if (!result.valid) {
  fail(`✗ ${result.error || "Invalid release classification"}`);
}

console.log(`✓ Release classification: ${result.classification}`);
