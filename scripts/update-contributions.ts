import { writeFile } from "node:fs/promises";
import { fetchContributions } from "../src/lib/github.ts";
import { site } from "../src/site.config.ts";

const target = new URL(
  "../src/data/github-contributions.json",
  import.meta.url,
);

const snapshot = await fetchContributions(
  site.github.username,
  process.env.GITHUB_TOKEN,
);

await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(
  `Saved ${snapshot.total} contributions across ${snapshot.weeks.length} weeks for ${site.github.username}`,
);
