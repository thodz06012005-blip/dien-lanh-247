const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const { respondSuccess, respondError } = require('../utils/response');
const { requirePermission } = require('../utils/auth');

const router = express.Router();

router.get('/admin/notifications', requirePermission('notifications:read'), (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 30)));
  const unreadOnly = req.query.unreadOnly === 'true';
  const rows = (readDB().adminNotifications || [])
    .filter((item) => !unreadOnly || !item.readAt)
    .slice(0, limit);
  return respondSuccess(res, rows);
});

router.patch(
  '/admin/notifications/:id/read',
  requirePermission('notifications:read'),
  (req, res) => {
    const db = readDB();
    const notification = (db.adminNotifications || []).find((item) => item.id === req.params.id);
    if (!notification)
      return respondError(res, 404, 'Không tìm thấy thông báo', 'NOTIFICATION_NOT_FOUND');
    notification.readAt = new Date().toISOString();
    writeDB(db);
    return respondSuccess(res, notification);
  },
);

module.exports = router;
