const express = require('express');
const router = express.Router();
const { respondSuccess, respondCreated } = require('../utils/response');

const personalDataRequests = [];

// Mock Authentication (matching User client logins)
router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  const mockUser = {
    id: 1,
    email: email || 'khachhang@gmail.com',
    role: 'user',
    firstName: email ? email.split('@')[0] : 'Khách Hàng',
    lastName: 'Demo',
    phone: '0987654321',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    addressDetail: 'Số 12 Ngõ 34 Trần Thái Tông',
  };
  return respondSuccess(res, mockUser, 'Đăng nhập thành công');
});

router.post('/auth/register', (req, res) => {
  const { email, firstName, lastName } = req.body;
  const mockUser = {
    id: 2,
    email: email || 'khachhang2@gmail.com',
    role: 'user',
    firstName: firstName || 'Khách',
    lastName: lastName || 'Mới',
    phone: '',
    city: '',
    district: '',
    addressDetail: '',
  };
  return respondCreated(res, mockUser, 'Đăng ký thành công');
});

router.post('/auth/logout', (req, res) => {
  return respondSuccess(res, null, 'Đăng xuất thành công');
});

router.get('/auth/me', (req, res) => {
  const mockUser = {
    id: 1,
    email: 'khachhang@gmail.com',
    role: 'user',
    firstName: 'Khách Hàng',
    lastName: 'Demo',
    phone: '0987654321',
    city: 'Hà Nội',
    district: 'Cầu Giấy',
    addressDetail: 'Số 12 Ngõ 34 Trần Thái Tông',
  };
  return respondSuccess(res, mockUser);
});

router.get('/account/privacy/export', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  return respondSuccess(res, {
    exportedAt: new Date().toISOString(),
    account: {
      id: 1,
      email: 'khachhang@gmail.com',
      firstName: 'Khách Hàng',
      lastName: 'Demo',
      phone: '0987654321',
    },
    addresses: [],
    serviceRequests: [],
  });
});

router.get('/account/privacy/requests', (_req, res) => {
  return respondSuccess(res, [...personalDataRequests].reverse());
});

router.post('/account/privacy/requests', (req, res) => {
  const requestType = String(req.body.requestType || '').toUpperCase();
  if (!['ACCESS', 'RECTIFY', 'DELETE', 'RESTRICT'].includes(requestType)) {
    return res.status(400).json({ success: false, message: 'Loại yêu cầu dữ liệu không hợp lệ' });
  }
  const requestedAt = new Date();
  const dueAt = new Date(requestedAt.getTime() + 20 * 24 * 60 * 60 * 1000);
  const request = {
    id: require('crypto').randomUUID(),
    requestType,
    status: 'PENDING',
    reason: typeof req.body.reason === 'string' ? req.body.reason.slice(0, 500) : null,
    requestedAt: requestedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    completedAt: null,
  };
  personalDataRequests.push(request);
  return respondCreated(res, request, 'Đã tiếp nhận yêu cầu dữ liệu cá nhân');
});

module.exports = router;
