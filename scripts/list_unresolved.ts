import * as fs from "fs";

const plans = JSON.parse(fs.readFileSync("scripts/repair_plan.json", "utf8"));
const unresolved = plans.filter((p: any) => p.status === "NEEDS_VERIFICATION" || p.status === "SOURCE_CONFLICT");

let out = "";
unresolved.forEach((u: any, idx: number) => {
  out += `\n[${idx + 1}] ID: ${u.id} | Slug: ${u.slug}\n`;
  out += `Stem: ${u.cleanStem}\n`;
  out += `Options: A="${u.cleanOptions.A}", B="${u.cleanOptions.B}", C="${u.cleanOptions.C}", D="${u.cleanOptions.D}"\n`;
  out += `Status: ${u.status} | Reason: ${u.reason}\n`;
});

fs.writeFileSync("scripts/unresolved_list.txt", out);
console.log(`Wrote ${unresolved.length} unresolved items to scripts/unresolved_list.txt`);
