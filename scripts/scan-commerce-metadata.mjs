import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'frontend-user/src/seo/SeoManager.tsx',
  'frontend-user/scripts/generate-sitemap.mjs',
  'frontend-user/scripts/generate-robots.mjs',
  'frontend-user/public/sitemap.xml',
  'frontend-user/public/robots.txt',
  'frontend-user/index.html',
];
const findings = [];
const productSchema = /["']@type["']\s*:\s*["']Product["']/i;
const commerceRoute =
  /(?:<loc>[^<]*|Disallow:\s*|canonical[^\n]*|og:[^\n]*)(?:\/products?|\/cart|\/checkout|\/orders?|\/inventory|\/shipping|\/returns?|\/coupons?|\/promotions?)(?:\/|[<\s"']|$)/i;

for (const relativePath of targets) {
  const source = readFileSync(path.join(root, relativePath), 'utf8');
  if (productSchema.test(source)) findings.push(`${relativePath}: Product JSON-LD`);
  if (commerceRoute.test(source)) findings.push(`${relativePath}: commerce metadata route`);
}

if (findings.length) {
  console.error('Commerce metadata scan failed:');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Commerce metadata scan PASS (${targets.length} service-only SEO files).`);
