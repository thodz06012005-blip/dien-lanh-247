import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('policy navigation and FAQ routes are public and crawlable', () => {
  const router = read('src/router/AppRouter.tsx');
  const sitemap = read('scripts/generate-sitemap.mjs');
  assert.match(router, /path="faq"/);
  for (const slug of ['booking', 'cancellation', 'pricing', 'payment', 'warranty', 'complaints', 'privacy', 'cookies']) {
    assert.match(sitemap, new RegExp(`/policy/${slug}`));
  }
});

test('image component resolves asset keys and local fallback metadata', () => {
  const image = read('src/components/common/OptimizedImage.tsx');
  assert.match(image, /getImageAsset/);
  assert.match(image, /asset\?\.srcSet/);
  assert.match(image, /image-unavailable\.svg/);
  assert.match(read('src/config/imageAssets.ts'), /home\.hero/);
});

test('mobile navigation implements dialog semantics and focus containment', () => {
  const header = read('src/components/layout/Header.tsx');
  assert.match(header, /role="dialog"/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /event\.key !== 'Tab'/);
  assert.match(header, /trigger\?\.focus/);
});
