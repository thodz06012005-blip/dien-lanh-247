import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

const baseUrl = process.env.PHASE11_API_URL || 'http://127.0.0.1:3000/api/v1';
const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin-phase11@example.test';
const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'Phase11AdminFixture123';
const staffEmail = process.env.STAFF_SEED_EMAIL || 'staff-phase11@example.test';
const staffPassword = process.env.STAFF_SEED_PASSWORD || 'Phase11StaffFixture123';
const jwtAccessSecret = process.env.JWT_ACCESS_SECRET || 'phase11_access_secret_more_than_32_characters';

class CookieJar {
  constructor() { this.values = new Map(); }
  absorb(headers) {
    const cookies = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
    for (const cookie of cookies) {
      const [pair, ...attributes] = cookie.split(';');
      const separator = pair.indexOf('=');
      if (separator < 1) continue;
      const name = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();
      const expired = attributes.some((item) => /max-age=0|expires=thu, 01 jan 1970/i.test(item));
      if (expired || !value) this.values.delete(name); else this.values.set(name, value);
    }
  }
  header() { return [...this.values].map(([name, value]) => `${name}=${value}`).join('; '); }
  set(name, value) { this.values.set(name, value); }
}

async function api(path, { method = 'GET', body, form, jar, headers: extraHeaders = {} } = {}) {
  const headers = { Accept: 'application/json', ...extraHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (jar?.header()) headers.Cookie = jar.header();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: form || (body === undefined ? undefined : JSON.stringify(body)),
    signal: AbortSignal.timeout(15_000),
  });
  jar?.absorb(response.headers);
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  return { status: response.status, json };
}

function base64url(value) { return Buffer.from(JSON.stringify(value)).toString('base64url'); }
function expiredAccessToken(userId) {
  const header = base64url({ alg: 'HS256', typ: 'JWT' });
  const payload = base64url({ sub: userId, userId, email: 'phase11@example.test', role: 'CUSTOMER', iat: 1, exp: 2 });
  const signature = createHmac('sha256', jwtAccessSecret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}
function futureDate(days = 3) { const date = new Date(); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); }
function windowAt(days = 3) {
  const start = new Date(); start.setUTCDate(start.getUTCDate() + days); start.setUTCHours(1, 0, 0, 0);
  const end = new Date(start); end.setUTCHours(3, 0, 0, 0);
  return { start: start.toISOString(), end: end.toISOString() };
}

const categories = await api('/service-categories');
const categoryList = Array.isArray(categories.json?.data) ? categories.json.data : categories.json?.data?.data;
const category = categoryList?.find((item) => item.id === 'sua-dieu-hoa') || categoryList?.[0];
assert.ok(category?.id);

const unique = Date.now();
const booking = (suffix) => ({
  customerName: `Khách UAT ${suffix}`,
  customerPhone: `09${String(unique + suffix).slice(-8)}`,
  customerEmail: `phase11.${unique}.${suffix}@example.test`,
  customerAddress: '12 Trần Thái Tông',
  district: 'Quận Cầu Giấy',
  serviceCategoryId: category.id,
  applianceType: 'Điều hòa treo tường',
  issueDescription: 'Điều hòa không lạnh, cần kiểm tra trước khi sửa.',
  preferredDate: futureDate(),
  preferredTimeSlot: '08:00 - 10:00',
  priority: 'medium',
  pricingDisclosureAccepted: true,
  pricingDisclosureVersion: '2026-07-v1',
});

const idempotencyKey = `phase11-multi-submit-${unique}`;
const first = await api('/service-requests', { method: 'POST', body: booking(1), headers: { 'Idempotency-Key': idempotencyKey } });
assert.equal(first.status, 201);
const replay = await api('/service-requests', { method: 'POST', body: booking(1), headers: { 'Idempotency-Key': idempotencyKey } });
assert.equal(replay.status, 201);
assert.equal(replay.json?.data?.code, first.json?.data?.code);
assert.equal(replay.json?.data?.replayed, true);

const spoofed = new FormData();
spoofed.append('files', new Blob(['<script>alert(1)</script>'], { type: 'image/png' }), 'hien-trang.png');
spoofed.append('phone', booking(1).customerPhone);
spoofed.append('stage', 'CUSTOMER_BEFORE');
const badUpload = await api(`/service-requests/${first.json?.data?.code}/media`, { method: 'POST', form: spoofed });
assert.equal(badUpload.status, 400);

const customerJar = new CookieJar();
const registered = await api('/auth/register', {
  method: 'POST', jar: customerJar,
  body: { email: booking(1).customerEmail, password: 'Phase11Customer123', firstName: 'Khách', lastName: 'UAT', phone: booking(1).customerPhone },
});
assert.equal(registered.status, 201);
const userId = registered.json?.data?.user?.id;
assert.ok(userId, 'Registration response must include data.user.id');
customerJar.set('accessToken', expiredAccessToken(userId));
assert.equal((await api('/account', { jar: customerJar })).status, 401);
assert.equal((await api('/auth/refresh', { method: 'POST', jar: customerJar })).status, 200);
assert.equal((await api('/account', { jar: customerJar })).status, 200);
assert.equal((await api('/admin/operations/overview', { jar: customerJar })).status, 403);

const adminJar = new CookieJar();
assert.equal((await api('/admin/auth/login', { method: 'POST', jar: adminJar, body: { email: adminEmail, password: adminPassword } })).status, 200);
const second = await api('/service-requests', { method: 'POST', body: booking(2), headers: { 'Idempotency-Key': `${idempotencyKey}-2` } });
assert.equal(second.status, 201);
const schedule = windowAt();
const dispatch = (code) => api(`/admin/operations/requests/${code}/dispatch`, {
  method: 'POST', jar: adminJar,
  body: { technicianId: 'TECH-001', scheduledStart: schedule.start, scheduledEnd: schedule.end, reason: 'UAT overlap fixture' },
});
assert.equal((await dispatch(first.json?.data?.code)).status, 201);
assert.equal((await dispatch(second.json?.data?.code)).status, 409);

const staffJar = new CookieJar();
assert.equal((await api('/admin/auth/login', { method: 'POST', jar: staffJar, body: { email: staffEmail, password: staffPassword } })).status, 200);
assert.equal((await api('/admin/operations/overview', { jar: staffJar })).status, 200);
assert.equal((await api('/admin/settings', { jar: staffJar })).status, 403);
assert.equal((await api('/admin/audit-logs', { jar: staffJar })).status, 403);

console.log('Phase 11 risk matrix passed: duplicate submit, spoofed upload, expired token refresh, RBAC roles and schedule conflict.');
