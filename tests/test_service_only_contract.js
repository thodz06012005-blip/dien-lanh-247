const http = require('node:http');

function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const payload = body === undefined ? '' : JSON.stringify(body);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 3001,
        path,
        method,
        headers: {
          Accept: 'application/json',
          ...(payload
            ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () =>
          resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }),
        );
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  const health = await request('GET', '/api/v1/health/live');
  assert(health.status === 200, 'health/live must be available');
  assert(health.body.mode === 'service-only', 'health must publish service-only mode');
  assert(health.body.capabilities?.commerce === false, 'health must advertise commerce=false');

  for (const path of [
    '/api/v1/products',
    '/api/v1/cart',
    '/api/v1/orders',
    '/api/v1/categories',
    '/api/v1/brands',
    '/api/v1/admin/products',
    '/api/v1/admin/orders',
    '/api/v1/account/orders',
  ]) {
    const result = await request('GET', path);
    assert(result.status === 410, `${path} must be a 410 tombstone, received ${result.status}`);
  }

  const login = await request('POST', '/api/v1/admin/auth/login', {
    email: 'owner@dienlanh247.vn',
    password: 'Admin@123',
  });
  assert(login.status === 200, 'mock admin login must succeed');
  const token = login.body?.data?.token;
  const permissions = login.body?.data?.admin?.permissions || [];
  assert(token, 'admin login must return a token');
  assert(permissions.includes('operations.manage'), 'service operations permission is missing');
  assert(
    !permissions.some((permission) => /products|orders|design-system/.test(permission)),
    'commerce permission leaked into admin session',
  );

  const sessions = await request('GET', '/api/v1/admin/auth/sessions', undefined, token);
  assert(sessions.status === 200, 'retained admin profile sessions must be available');
  assert(
    sessions.body?.data?.some((session) => session.current && session.active),
    'current admin session must be identified',
  );

  const profile = await request(
    'PATCH',
    '/api/v1/admin/auth/profile',
    { firstName: 'Điện Lạnh 247', lastName: 'Owner', phone: '0909000247' },
    token,
  );
  assert(profile.status === 200, 'retained admin profile must remain writable');
  assert(
    profile.body?.data?.permissions?.includes('profile.manage'),
    'profile response must preserve the service-only permission contract',
  );

  const overview = await request('GET', '/api/v1/admin/operations/overview', undefined, token);
  assert(overview.status === 200, 'operations overview must be available');
  assert(
    typeof overview.body?.data?.metrics?.activeRequests === 'number',
    'operations overview contract is invalid',
  );

  const quote = await request(
    'POST',
    '/api/v1/admin/operations/requests/SR-240601/quotes',
    {
      lines: [
        {
          lineType: 'LABOR',
          description: 'Công vệ sinh',
          quantity: 1,
          unit: 'lần',
          unitPrice: 200000,
        },
        {
          lineType: 'MATERIAL',
          description: 'Dung dịch vệ sinh',
          quantity: 1,
          unit: 'chai',
          unitPrice: 50000,
        },
      ],
      discountValue: 0,
      taxRate: 0,
    },
    token,
  );
  assert(quote.status === 201, 'service quotation must remain writable');
  assert(
    quote.body?.data?.lines?.some((line) => line.lineType === 'MATERIAL'),
    'material line item was lost',
  );

  const completion = await request(
    'POST',
    '/api/v1/admin/operations/requests/SR-240601/completion',
    {
      diagnosis: 'Bụi bẩn dàn lạnh',
      workPerformed: 'Vệ sinh và kiểm tra vận hành',
      customerName: 'Nguyễn Văn Nam',
      completedAt: new Date().toISOString(),
    },
    token,
  );
  assert(completion.status === 201, 'completion report must remain writable');

  const warranty = await request(
    'POST',
    '/api/v1/admin/operations/requests/SR-240601/warranties',
    {
      completionReportId: completion.body.data.id,
      coverage: 'Bảo hành hạng mục vệ sinh',
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 90 * 86400000).toISOString(),
    },
    token,
  );
  assert(warranty.status === 201, 'service warranty must remain writable');

  console.log('SERVICE-ONLY CONTRACT TESTS PASSED');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
