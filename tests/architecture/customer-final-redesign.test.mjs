import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

const root = resolve(import.meta.dirname, '../..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('final customer sitemap keeps every required service route', () => {
  const sitemap = read('frontend-user/src/config/finalSitemap.ts');
  const router = read('frontend-user/src/router/AppRouter.tsx');
  for (const path of [
    '/', '/services', '/services/:slug', '/service-booking',
    '/service-booking/success', '/service-lookup', '/projects',
    '/projects/:slug', '/articles', '/articles/:slug', '/about',
    '/contact', '/policy/:slug', '/account', '/my-services',
    '/my-services/:id', '/login', '/register', '/forgot-password',
    '/reset-password', '/verify-email',
  ]) {
    assert.match(sitemap, new RegExp(path.replace(/[/:]/g, '\\$&')));
  }
  assert.match(router, /path="service-booking"/);
  assert.match(router, /path="my-services\/:id"/);
});

test('homepage exposes five service entrances and the six-step service journey', () => {
  const home = read('frontend-user/src/pages/Home.tsx');
  const content = read('frontend-user/src/data/phase4Content.ts');
  for (const title of ['Sửa chữa', 'Vệ sinh', 'Lắp đặt', 'Bảo trì', 'Kiểm tra']) {
    assert.match(home, new RegExp(`title: '${title}'`));
  }
  for (const step of ['Tiếp nhận', 'Xác nhận yêu cầu', 'Phân công', 'Chẩn đoán & báo giá', 'Thực hiện', 'Nghiệm thu & bảo hành']) {
    assert.match(content, new RegExp(step.replace(/[&]/g, '\\&')));
  }
  assert.match(home, /Khu vực đang hỗ trợ tại Hà Nội/);
  assert.match(home, /8:00 đến 21:00/);
});

test('unverified projects and testimonials cannot leak into public homepage', () => {
  const cms = read('frontend-user/src/components/cms/CmsManagedHomepage.tsx');
  const service = read('backend/src/modules/content/editorial-cms.service.ts');
  const legacy = read('backend/src/modules/content/content.service.ts');
  assert.doesNotMatch(cms, /fallbackTestimonials/);
  assert.match(cms, /testimonials\.length > 0/);
  assert.match(cms, /projects\.length > 0/);
  assert.match(service, /FROM Testimonial x[\s\S]*?WHERE \$\{nowClause\}[\s\S]*?x\.isVerified = TRUE/);
  assert.doesNotMatch(service, /FROM Partner x[\s\S]{0,300}?x\.isVerified = TRUE/);
  assert.match(service, /Nguồn đối chiếu|Nguồn xác minh|verificationReference/i);
  assert.match(legacy, /x\.imageRightsConfirmed = TRUE/);
  assert.match(legacy, /x\.evidenceReference IS NOT NULL/);
});

test('booking form preserves idempotency while enforcing final field and consent contract', () => {
  const booking = read('frontend-user/src/pages/ServiceBooking.tsx');
  const dto = read('backend/src/modules/service-requests/dto/create-service-request.dto.ts');
  const migration = read('backend/prisma/migrations/20260727200000_customer_website_final/migration.sql');
  for (const field of [
    'province', 'ward', 'applianceBrand', 'applianceModel',
    'accessNote', 'photoNote', 'contactConsent',
    'dataProcessingConsent', 'termsAccepted', 'companyWebsite',
  ]) {
    assert.match(booking, new RegExp(field));
    assert.match(dto, new RegExp(field));
  }
  assert.match(booking, /crypto\.randomUUID/);
  assert.match(booking, /detectImageMime/);
  assert.match(booking, /MAX_IMAGE_BYTES/);
  assert.match(booking, /SUPPORTED_IMAGE_MIME/);
  assert.match(booking, /VIETNAM_TIME_ZONE/);
  assert.match(migration, /ADD COLUMN `contactConsentAt`/);
  assert.match(migration, /ADD COLUMN `imageRightsConfirmed`/);
  assert.match(migration, /INFORMATION_SCHEMA\.COLUMNS/);
  assert.match(migration, /COUNT\(\*\) = 4/);
});
