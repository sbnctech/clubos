#!/usr/bin/env npx tsx
import { analyzeHtmlPatterns } from "../../src/lib/migration/html-pattern-analyzer";

const samples = [
  // Sample 1: Styled content with font tags
  `<div class="gadgetStyleBody gadgetContentEditableArea" style="" data-editableArea="0" data-areaHeight="auto">
    <p align="center" style="line-height: 28px;">
      <font face="Arial" size="4" style="font-size: 18pt;"><strong>Sample Text</strong></font>
    </p>
  </div>`,

  // Sample 2: Content with script
  `<div class="gadgetStyleBody" style="padding-bottom:0px;" data-areaHeight="auto">
    <script language="javascript">
      jq$(function(){ var imgAmount = 5; });
    </script>
  </div>`,

  // Sample 3: Menu inner
  `<div class="menuInner">
    <ul class="firstLevel alignLeft">
      <li class="sel"><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
    </ul>
  </div>`,

  // Sample 4: Simple paragraph
  `<div class="gadgetStyleBody gadgetContentEditableArea">
    <p>Just some regular text content here.</p>
  </div>`,
];

for (let i = 0; i < samples.length; i++) {
  console.log(`\n--- Sample ${i + 1} ---`);
  console.log(`Input: ${samples[i].substring(0, 80).replace(/\n/g, " ")}...`);

  const patterns = analyzeHtmlPatterns(samples[i]);

  if (patterns.length === 0) {
    console.log("Result: No patterns detected");
  } else {
    console.log("Result:");
    patterns.forEach((p) => {
      console.log(`  - ${p.pattern}: ${p.description} (confidence: ${p.confidence})`);
    });
  }
}
