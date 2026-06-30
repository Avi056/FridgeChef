import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const apiUrl = (process.env.FRIDGECHEF_API_URL || process.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(scriptDir, "..", "dist", "_redirects");

if (process.env.NETLIFY && !apiUrl) {
  throw new Error("Set FRIDGECHEF_API_URL or VITE_API_URL to your backend origin before deploying to Netlify.");
}

const redirects = apiUrl
  ? `/auth/*  ${apiUrl}/auth/:splat  200
/api/*  ${apiUrl}/api/:splat  200
/*  /index.html  200
`
  : `/*  /index.html  200
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, redirects);

console.log(`Wrote ${outputPath}${apiUrl ? ` with API proxy target ${apiUrl}` : ""}.`);
