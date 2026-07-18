import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'frontend-user', 'dist');
const files = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else files.push(absolute);
  }
}

await walk(dist);

const executable = files.filter((file) => /\.(?:js|css)$/i.test(file));
const forbiddenChunkName = /(?:product|cart|checkout|order)(?:detail|summary|grid|card|store|page)?/i;
const forbiddenContent = [
  'dl247_cart_items',
  'dl247_cart_voucher',
  'Product SEO request failed',
  'product-card-premium',
  '/account/orders',
  'Giỏ hàng có',
  'Hoàn tất thông tin giao hàng',
];
const violations = [];

for (const file of executable) {
  const relative = path.relative(dist, file);
  if (forbiddenChunkName.test(path.basename(file))) violations.push(`${relative}: tên chunk bán hàng`);
  const content = await readFile(file, 'utf8');
  for (const marker of forbiddenContent) {
    if (content.includes(marker)) violations.push(`${relative}: còn marker ${JSON.stringify(marker)}`);
  }
}

if (violations.length) {
  console.error('[service-only-bundle] Customer bundle still contains commerce code:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log(`[service-only-bundle] Verified ${executable.length} customer JS/CSS assets.`);
}
