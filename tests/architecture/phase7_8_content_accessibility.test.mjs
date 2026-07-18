import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

test('Phase 7 publishes a versioned complete service policy set with legal approval gate', () => {
  const policies = read('frontend-user/src/data/servicePolicies.ts');
  assert.match(policies, /DL247-SVC-1\.0/);
  assert.match(policies, /01\/08\/2026/);
  for (const slug of ['terms', 'booking', 'cancellation', 'pricing', 'payment', 'warranty', 'complaints', 'privacy', 'cookies']) {
    assert.match(policies, new RegExp(`\\b${slug}: \\{`), `Missing policy ${slug}`);
  }
  assert.match(policies, /không bán lẻ độc lập qua website/i);
  assert.match(policies, /PENDING_OWNER_AND_LEGAL_APPROVAL/);
  assert.equal(existsSync(path.join(root, 'docs/phase-7/BB_ND_phe-duyet-noi-dung.md')), true);
});

test('Phase 7 customer content and CTA surfaces remain service-only', () => {
  const files = [
    'frontend-user/src/pages/Home.tsx',
    'frontend-user/src/pages/About.tsx',
    'frontend-user/src/pages/Services.tsx',
    'frontend-user/src/pages/Contact.tsx',
    'frontend-user/src/pages/Faq.tsx',
    'frontend-user/src/components/layout/Header.tsx',
    'frontend-user/src/components/layout/Footer.tsx',
    'frontend-user/src/data/phase4Content.ts',
  ];
  const visible = files.map((file) => {
    const source = read(file);
    return file.endsWith('Footer.tsx')
      ? source.replace(/function safeLinks[\s\S]*?function FooterLinks/, 'function FooterLinks')
      : source;
  }).join('\n');
  assert.doesNotMatch(visible, /mua ngay|thêm vào giỏ|giỏ hàng|checkout|giao hàng|đổi trả|hoàn trả|category:\s*['"]Bán lẻ['"]/i);
  for (const marker of ['/service-booking', '/service-lookup', 'Gọi']) assert.match(visible, new RegExp(marker));
  assert.match(read('frontend-user/src/router/AppRouter.tsx'), /path="faq"/);
});

test('Phase 8 image contract keeps priority and LCP media locally replaceable', () => {
  const registry = read('frontend-user/src/config/imageAssets.ts');
  for (const marker of ['home.hero', 'srcSet', 'aspectRatio', 'fallbackSrc', 'objectPosition', 'alt:']) assert.match(registry, new RegExp(marker.replace('.', '\\.')));
  for (const image of ['hero-technician-768.webp', 'hero-technician-1280.webp', 'hero-technician-1672.webp']) {
    assert.equal(existsSync(path.join(root, 'frontend-user/public/images/service', image)), true, `Missing ${image}`);
  }
  const home = read('frontend-user/src/pages/Home.tsx');
  assert.match(home, /assetKey="home\.hero"[\s\S]*priority/);
  assert.doesNotMatch(home.match(/<OptimizedImage[\s\S]*?priority[\s\S]*?\/>/)?.[0] || '', /https?:\/\//);
});

test('Phase 8 design system covers focus, touch, reduced motion, overlays and responsive data', () => {
  const source = read('frontend-user/src/design-system/index.tsx');
  const styles = read('frontend-user/src/styles/design-system.css');
  for (const marker of ['ResponsiveTable', 'role="dialog"', 'aria-modal="true"', "event.key === 'Escape'", 'aria-live="polite"']) assert.match(source, new RegExp(marker.replace(/[()]/g, '\\$&')));
  assert.match(styles, /focus-visible/);
  assert.match(styles, /@media \(pointer: coarse\)/);
  assert.match(styles, /min-height: 44px/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /forced-colors: active/);
});

test('Phase 7-8 required reports exist', () => {
  for (const file of [
    'docs/phase-7/BC_ND_chinh-sach-dich-vu.md',
    'docs/phase-7/BB_ND_phe-duyet-noi-dung.md',
    'docs/phase-8/BC_UX_accessibility-responsive.md',
  ]) assert.equal(existsSync(path.join(root, file)), true, `Missing ${file}`);
});
