import * as fs from "fs";

const items = JSON.parse(fs.readFileSync("scripts/remaining_97_dump.json", "utf8"));

console.log(`Analyzing ${items.length} remaining items...`);

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`\n[${i + 1}] ID: ${item.id} | Slug: ${item.slug}`);
  console.log(`Question: ${item.title}`);
  console.log(`Category: ${item.category}`);
  console.log(`Options:`, item.options);
}
