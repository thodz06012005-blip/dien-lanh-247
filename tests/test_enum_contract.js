const fs = require('fs');
const path = require('path');
const http = require('http');

function request(method, pathUrl, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (body) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path: pathUrl,
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      },
    );

    req.on('error', reject);
    if (body) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== Running Enum Contract & Mock DB Validation Tests ===');

  // Read mock-db.json
  const dbPath = path.join(__dirname, '../mock-api/mock-db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Define valid sets
  const VALID_SERVICE_STATUSES = ['pending', 'confirmed', 'assigned', 'completed', 'cancelled'];
  const VALID_SERVICE_PRIORITIES = ['low', 'medium', 'high', 'urgent'];
  const VALID_TECHNICIAN_STATUSES = ['available', 'busy', 'offline', 'inactive'];

  const categoryIds = (db.serviceCategories || []).map((c) => c.id);

  // 1. mock-db.json không có service request status lạ
  console.log('\n[Test 1] Validating service request statuses in mock-db.json...');
  (db.serviceRequests || []).forEach((r) => {
    if (!VALID_SERVICE_STATUSES.includes(r.status)) {
      console.error(`ERROR: Service request ${r.id} has invalid status: ${r.status}`);
      process.exit(1);
    }
  });
  console.log('PASS.');

  // 2. mock-db.json không có priority lạ
  console.log('\n[Test 2] Validating service request priorities in mock-db.json...');
  (db.serviceRequests || []).forEach((r) => {
    if (r.priority && !VALID_SERVICE_PRIORITIES.includes(r.priority)) {
      console.error(`ERROR: Service request ${r.id} has invalid priority: ${r.priority}`);
      process.exit(1);
    }
  });
  console.log('PASS.');

  // 3. mock-db.json không có technician status lạ
  console.log('\n[Test 3] Validating technician statuses in mock-db.json...');
  (db.technicians || []).forEach((t) => {
    if (!VALID_TECHNICIAN_STATUSES.includes(t.status)) {
      console.error(`ERROR: Technician ${t.id} has invalid status: ${t.status}`);
      process.exit(1);
    }
  });
  console.log('PASS.');

  // 4. technician.skills đều khớp service category id hiện có
  console.log('\n[Test 4] Validating technician skills in mock-db.json...');
  (db.technicians || []).forEach((t) => {
    (t.skills || []).forEach((s) => {
      if (!categoryIds.includes(s)) {
        console.error(`ERROR: Technician ${t.id} has skill not matching any category: ${s}`);
        process.exit(1);
      }
    });
  });
  console.log('PASS.');

  // 5. technician.workingAreas đều dùng dạng "Quận ..."
  console.log('\n[Test 5] Validating technician workingAreas in mock-db.json...');
  (db.technicians || []).forEach((t) => {
    (t.workingAreas || []).forEach((w) => {
      if (!w.startsWith('Quận ')) {
        console.error(`ERROR: Technician ${t.id} has workingArea not starting with "Quận ": ${w}`);
        process.exit(1);
      }
    });
  });
  console.log('PASS.');

  // Login as admin for API tests
  console.log('\nLogging in as Admin...');
  const loginRes = await request('POST', '/api/v1/admin/auth/login', {
    email: 'owner@dienlanh247.vn',
    password: 'Admin@123',
  });
  const token = loginRes.data.data.token;

  // 6. API từ chối service request status lạ
  console.log('\n[Test 6] Verifying API rejects invalid service request status...');
  const res6 = await request(
    'PATCH',
    '/api/v1/admin/service-requests/SR-240601/status',
    { status: 'invalid-status' },
    token,
  );
  console.log('Status:', res6.status, 'Message:', res6.data?.message);
  if (res6.status !== 400) {
    console.error('ERROR: API accepted invalid service request status!');
    process.exit(1);
  }
  console.log('PASS.');

  // 7. API từ chối technician status lạ
  console.log('\n[Test 7] Verifying API rejects invalid technician status...');
  const res7 = await request(
    'PATCH',
    '/api/v1/admin/technicians/TECH-001/status',
    { status: 'invalid-status' },
    token,
  );
  console.log('Status:', res7.status, 'Message:', res7.data?.message);
  if (res7.status !== 400) {
    console.error('ERROR: API accepted invalid technician status!');
    process.exit(1);
  }
  console.log('PASS.');

  // 8. API từ chối priority lạ
  console.log('\n[Test 8] Verifying API rejects invalid priority...');
  const res8 = await request(
    'POST',
    '/api/v1/service-requests',
    {
      customerName: 'Test customer',
      customerPhone: '0912345678',
      customerAddress: '123 Test St',
      district: 'Quận Cầu Giấy',
      serviceCategoryId: 've-sinh-dieu-hoa',
      applianceType: 'Điều hòa',
      issueDescription: 'Bảo trì',
      preferredDate: '2026-07-20',
      preferredTimeSlot: '10:00 - 12:00',
      priority: 'invalid-priority',
      pricingDisclosureAccepted: true,
      pricingDisclosureVersion: '2026-07-v1',
    },
    token,
  );
  console.log('Status:', res8.status, 'Message:', res8.data?.message);
  if (res8.status !== 400) {
    console.error('ERROR: API accepted invalid priority!');
    process.exit(1);
  }
  console.log('PASS.');

  // 9. Tạo service request bằng district chuẩn và kiểm tra lưu đúng
  const preferredDate = new Date();
  preferredDate.setDate(preferredDate.getDate() + 7);
  console.log('\n[Test 9] Creating service request with district "Quận Cầu Giấy"...');
  const srRes = await request('POST', '/api/v1/service-requests', {
    customerName: 'Customer District Test',
    customerPhone: '0912345678',
    customerAddress: '123 Test St',
    district: 'Quận Cầu Giấy',
    serviceCategoryId: 've-sinh-dieu-hoa',
    applianceType: 'Điều hòa',
    issueDescription: 'Bảo trì',
    preferredDate: preferredDate.toISOString().slice(0, 10),
    preferredTimeSlot: '10:00 - 12:00',
    pricingDisclosureAccepted: true,
    pricingDisclosureVersion: '2026-07-v1',
  });
  const createdId = srRes.data?.data?.id;
  const savedRequest = createdId
    ? await request('GET', `/api/v1/service-requests/${createdId}?phone=0912345678`)
    : null;
  console.log('Status:', srRes.status, 'Saved district:', savedRequest?.data?.data?.district);
  if (srRes.status !== 201 || savedRequest?.data?.data?.district !== 'Quận Cầu Giấy') {
    console.error('ERROR: Failed to save district correctly!');
    process.exit(1);
  }
  console.log('PASS.');

  console.log('\nALL ENUM CONTRACT & DB VALIDATION TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test run failed with error:', err);
  process.exit(1);
});
