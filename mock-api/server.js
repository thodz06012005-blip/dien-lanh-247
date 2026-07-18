const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const { readDB, setInitialDataGenerator } = require('./utils/db');
const { respondSuccess, respondError } = require('./utils/response');

const { getInitialData } = require('./seed/initialData');
const {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} = require('./utils/rateLimit');
const { auditSuccess, auditFailure, auditRateLimited } = require('./utils/auditLog');
const { resolveServiceOnlyMode, serviceOnlyMiddleware } = require('./config/serviceOnly');

const publicRoutes = require('./routes/public');
const { router: serviceRequestRouter } = require('./routes/serviceRequests');
const {
  adminUsers,
  adminSessions,
  requireAdminAuth,
  isDemoAccountsEnabled,
  getUiPermissions,
} = require('./utils/auth');
const technicianRouter = require('./routes/technicians');
const adminDashboardRouter = require('./routes/adminDashboard');
const adminOperationsRouter = require('./routes/adminOperations');
const adminCustomersRouter = require('./routes/adminCustomers');
const adminSettingsRouter = require('./routes/adminSettings');
const adminNotificationsRouter = require('./routes/adminNotifications');
const customerAuthRouter = require('./routes/customerAuth');
const contactRouter = require('./routes/contact');
const devRouter = require('./routes/dev');
const auditLogsRouter = require('./routes/auditLogs');

const app = express();
const PORT = process.env.PORT || 3001;
const serviceOnlyMode = resolveServiceOnlyMode(process.env);

const corsOriginsEnv = process.env.CORS_ORIGINS || process.env.ALLOWED_ORIGINS;
const allowedOrigins = corsOriginsEnv
  ? corsOriginsEnv
      .split(',')
      .map((o) => o.trim())
      .filter((o) => o.length > 0)
  : [
      'http://localhost:5174',
      'http://localhost:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5173',
    ];

app.use(
  cors({
    origin: function (origin, callback) {
      // If request has no origin (like curl or server-to-server), allow it
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Do not throw an Error object to avoid express 500 error logs / stack traces.
        // Deny by passing false.
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With', 'Cookie'],
  }),
);
const JSON_LIMIT = process.env.MOCK_JSON_BODY_LIMIT || '1mb';
const URLENCODED_LIMIT = process.env.MOCK_URLENCODED_BODY_LIMIT || '100kb';

// Custom Security Headers Middleware (Plan 18 Hardening)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 http://localhost:3000 ws://localhost:3001 ws://localhost:3000 http://127.0.0.1:3001 http://127.0.0.1:3000 ws://127.0.0.1:3001 ws://127.0.0.1:3000;",
  );
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

// 1. Content-Type Guard for POST/PATCH/PUT (checked BEFORE parsing body to avoid parsing unapproved content types)
app.use((req, res, next) => {
  const method = req.method;
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    const contentType = req.headers['content-type'];
    const contentLength = req.headers['content-length'];
    if (contentLength === '0') {
      return next();
    }
    if (!contentType || !contentType.toLowerCase().startsWith('application/json')) {
      return res.status(415).json({
        success: false,
        message: 'Unsupported content type',
      });
    }
  }
  next();
});

app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: URLENCODED_LIMIT }));
app.use('/api/v1', serviceOnlyMiddleware(serviceOnlyMode));
app.use('/api/v1', publicRoutes);
app.use('/api/v1', serviceRequestRouter);
app.use('/api/v1', technicianRouter);
app.use('/api/v1', adminDashboardRouter);
app.use('/api/v1', adminOperationsRouter);
app.use('/api/v1', adminCustomersRouter);
app.use('/api/v1', adminSettingsRouter);
app.use('/api/v1', adminNotificationsRouter);
app.use('/api/v1', customerAuthRouter);
app.use('/api/v1', contactRouter);
app.use('/api/v1', devRouter);
app.use('/api/v1', auditLogsRouter);

setInitialDataGenerator(getInitialData);

// ----------------------------------------------------
// 1. SYSTEM / UTILITY ENDPOINTS
// ----------------------------------------------------

// GET /
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <h1 style="color: #2563eb;">Điện Lạnh 247 Mock API Server</h1>
      <p style="color: #475569;">Mock API đang chạy thành công trên cổng <strong>3001</strong>.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <h3 style="color: #0f172a;">Service-only contract:</h3>
      <ul style="line-height: 1.8;">
        <li>Kiểm tra sức khỏe hệ thống: <a href="/api/v1/health" style="color: #2563eb; text-decoration: none;">/api/v1/health</a></li>
        <li>Danh mục dịch vụ: <a href="/api/v1/service-categories" style="color: #2563eb; text-decoration: none;">/api/v1/service-categories</a></li>
      </ul>
    </div>
  `);
});

// ----------------------------------------------------
// 3. ADMIN AUTH ENDPOINTS (Security-1B)
// ----------------------------------------------------

// POST /admin/auth/login
app.post('/api/v1/admin/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return respondError(res, 400, 'Vui lòng nhập đầy đủ email và mật khẩu', 'MISSING_CREDENTIALS');
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Check rate limit trước khi so password
  const rateLimitResult = checkLoginRateLimit(req, normalizedEmail);
  if (rateLimitResult.locked) {
    auditRateLimited(
      req,
      'AUTH_LOGIN_RATE_LIMITED',
      'auth',
      null,
      { email: normalizedEmail },
      'Admin login blocked due to rate limit',
    );
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfterSeconds: rateLimitResult.retryAfterSeconds,
    });
  }

  const demoEmails = ['admin@dienlanh247.vn', 'staff@dienlanh247.vn'];
  const isDefaultOwner = normalizedEmail === 'owner@dienlanh247.vn' && password === 'Admin@123';
  if ((demoEmails.includes(normalizedEmail) || isDefaultOwner) && !isDemoAccountsEnabled()) {
    recordLoginFailure(req, normalizedEmail);
    auditFailure(
      req,
      'AUTH_LOGIN_FAILED',
      'auth',
      null,
      { email: normalizedEmail },
      'Admin login failed (demo accounts disabled)',
    );
    return respondError(res, 401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  const admin = adminUsers.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail && u.password === password && u.status === 'active',
  );

  if (!admin) {
    recordLoginFailure(req, normalizedEmail);
    auditFailure(
      req,
      'AUTH_LOGIN_FAILED',
      'auth',
      null,
      { email: normalizedEmail },
      'Admin login failed (invalid credentials)',
    );
    return respondError(res, 401, 'Email hoặc mật khẩu không chính xác', 'INVALID_CREDENTIALS');
  }

  // Login đúng và chưa bị lock -> record success
  recordLoginSuccess(req, normalizedEmail);
  auditSuccess(
    req,
    'AUTH_LOGIN_SUCCESS',
    'auth',
    admin.id,
    { email: normalizedEmail },
    'Admin login successful',
  );

  // Generate dynamic token using crypto
  const token = 'admin_tok_' + crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

  // Store session in memory
  adminSessions.push({
    id: crypto.randomUUID(),
    token,
    adminId: admin.id,
    userAgent: req.get('user-agent') || null,
    createdAt: Date.now(),
    lastUsedAt: Date.now(),
    expiresAt,
  });

  // Return admin info without password
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 60 * 1000, // 30 minutes
  });

  const { password: _, ...adminWithoutPassword } = admin;
  const adminSafe = { ...adminWithoutPassword, permissions: getUiPermissions(admin.role) };
  return respondSuccess(
    res,
    {
      admin: adminSafe,
      token,
      expiresAt,
    },
    'Đăng nhập thành công',
  );
});

// GET /admin/auth/me
app.get('/api/v1/admin/auth/me', requireAdminAuth, (req, res) => {
  return respondSuccess(
    res,
    { admin: req.admin, permissions: req.admin.permissions },
    'Lấy thông tin admin thành công',
  );
});

const getRequestToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  if (!req.headers.cookie) return null;
  const { parseCookies } = require('./utils/auth');
  return parseCookies(req.headers.cookie).accessToken || null;
};

// GET /admin/auth/sessions
app.get('/api/v1/admin/auth/sessions', requireAdminAuth, (req, res) => {
  const currentToken = getRequestToken(req);
  const sessions = adminSessions
    .filter((session) => session.adminId === req.admin.id)
    .map((session) => ({
      id: session.id,
      userAgent: session.userAgent,
      createdAt: new Date(session.createdAt).toISOString(),
      lastUsedAt: new Date(session.lastUsedAt).toISOString(),
      rotatedAt: null,
      expiresAt: new Date(session.expiresAt).toISOString(),
      revokedAt: null,
      current: session.token === currentToken,
      active: session.expiresAt > Date.now(),
    }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return respondSuccess(res, sessions, 'Lấy danh sách phiên quản trị thành công');
});

// PATCH /admin/auth/profile
app.patch('/api/v1/admin/auth/profile', requireAdminAuth, (req, res) => {
  const firstName = String(req.body.firstName || '').trim();
  const lastName = String(req.body.lastName || '').trim();
  const phone = String(req.body.phone || '').replace(/\D/g, '') || null;
  if (!firstName || !lastName) {
    return respondError(res, 400, 'Họ và tên không được để trống', 'INVALID_PROFILE');
  }
  const admin = adminUsers.find((user) => user.id === req.admin.id);
  admin.firstName = firstName;
  admin.lastName = lastName;
  admin.phone = phone;
  admin.name = `${firstName} ${lastName}`;
  const { password: _, ...adminWithoutPassword } = admin;
  const adminSafe = { ...adminWithoutPassword, permissions: getUiPermissions(admin.role) };
  auditSuccess(
    req,
    'ADMIN_PROFILE_UPDATED',
    'admin-profile',
    admin.id,
    null,
    'Admin profile updated',
  );
  return respondSuccess(
    res,
    { admin: adminSafe, permissions: adminSafe.permissions },
    'Hồ sơ quản trị đã được cập nhật',
  );
});

// POST /admin/auth/change-password
app.post('/api/v1/admin/auth/change-password', requireAdminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const admin = adminUsers.find((user) => user.id === req.admin.id);
  if (!currentPassword || currentPassword !== admin.password) {
    return respondError(res, 403, 'Mật khẩu hiện tại không đúng', 'INVALID_PASSWORD');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8) {
    return respondError(res, 400, 'Mật khẩu mới phải có ít nhất 8 ký tự', 'WEAK_PASSWORD');
  }
  if (newPassword === admin.password) {
    return respondError(res, 400, 'Mật khẩu mới phải khác mật khẩu hiện tại', 'PASSWORD_UNCHANGED');
  }
  admin.password = newPassword;
  for (let index = adminSessions.length - 1; index >= 0; index -= 1) {
    if (adminSessions[index].adminId === admin.id) adminSessions.splice(index, 1);
  }
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  auditSuccess(
    req,
    'ADMIN_PASSWORD_CHANGED',
    'admin-profile',
    admin.id,
    null,
    'Admin password changed',
  );
  return respondSuccess(
    res,
    { revokedAllSessions: true },
    'Mật khẩu đã đổi. Vui lòng đăng nhập lại.',
  );
});

// DELETE /admin/auth/sessions/:id
app.delete('/api/v1/admin/auth/sessions/:id', requireAdminAuth, (req, res) => {
  const index = adminSessions.findIndex(
    (session) => session.id === req.params.id && session.adminId === req.admin.id,
  );
  if (index === -1) {
    return respondError(res, 404, 'Không tìm thấy phiên đăng nhập', 'SESSION_NOT_FOUND');
  }
  const [revokedSession] = adminSessions.splice(index, 1);
  if (revokedSession.token === getRequestToken(req)) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
  return respondSuccess(
    res,
    { revoked: true, sessionId: revokedSession.id },
    'Phiên đăng nhập đã được thu hồi',
  );
});

// POST /admin/auth/logout
app.post('/api/v1/admin/auth/logout', (req, res) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers.cookie) {
    const { parseCookies } = require('./utils/auth');
    const cookies = parseCookies(req.headers.cookie);
    token = cookies['accessToken'];
  }

  let adminId = null;
  if (token) {
    const session = adminSessions.find((s) => s.token === token);
    if (session) {
      adminId = session.adminId;
      const adminRaw = adminUsers.find((u) => u.id === adminId);
      if (adminRaw) {
        const { password: _, ...adminSafe } = adminRaw;
        req.admin = adminSafe;
      }
      const index = adminSessions.findIndex((s) => s.token === token);
      if (index !== -1) {
        adminSessions.splice(index, 1);
      }
    }
  }

  auditSuccess(req, 'AUTH_LOGOUT', 'auth', adminId || 'none', null, 'Admin logout successful');

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return respondSuccess(res, null, 'Đăng xuất thành công');
});

// ----------------------------------------------------
// 4. ADMIN PORTAL ENDPOINTS (frontend-admin) — Protected by requireAdminAuth
// ----------------------------------------------------

// Mounted via adminDashboardRouter, adminCustomersRouter, and adminSettingsRouter.

// Mounted via serviceRequestRouter.
// Mounted via technicianRouter.

// Global error handler for body parsing errors (payload too large or invalid JSON format)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
    });
  }
  if (err && err.status === 413) {
    return res.status(413).json({
      success: false,
      message: 'Payload too large',
    });
  }
  // Generic error fallback
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Mock API Server is running on http://localhost:${PORT}`);
  console.log(`Healthcheck URL: http://localhost:${PORT}/api/v1/health`);
  readDB();
});
