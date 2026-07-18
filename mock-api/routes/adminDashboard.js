const express = require('express');
const router = express.Router();
const { readDB } = require('../utils/db');
const { respondSuccess } = require('../utils/response');
const { requirePermission } = require('../utils/auth');
const { resolveServiceOnlyMode } = require('../config/serviceOnly');

// GET /admin/dashboard — requires: dashboard:read (superadmin, admin, staff)
router.get('/admin/dashboard', requirePermission('dashboard:read'), (req, res) => {
  const db = readDB();
  const todayStr = new Date().toISOString().split('T')[0];

  if (resolveServiceOnlyMode(process.env)) {
    const serviceRequests = Array.isArray(db.serviceRequests) ? db.serviceRequests : [];
    const technicians = Array.isArray(db.technicians) ? db.technicians : [];
    const customers = Array.isArray(db.customers) ? db.customers : [];
    const terminalStatuses = new Set(['completed', 'closed', 'cancelled', 'rejected']);
    const statusCounts = new Map();
    for (const request of serviceRequests) {
      const status = request.workflowStatus || request.status || 'pending';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    }
    const urgent = serviceRequests
      .filter(request => request.priority === 'urgent' && !terminalStatuses.has(request.workflowStatus || request.status))
      .slice(0, 12)
      .map(request => ({
        id: `service:${request.id}`,
        type: 'urgent_service',
        severity: 'critical',
        title: `Yêu cầu khẩn ${request.id}`,
        description: `${request.customerName} · ${request.applianceType}`,
        href: `/service-requests/${request.id}`,
        createdAt: request.createdAt,
        dueAt: request.scheduledAt || null
      }));
    return respondSuccess(res, {
      generatedAt: new Date().toISOString(),
      kpis: {
        todayRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        newCustomers: customers.filter(customer => customer.createdAt?.startsWith(todayStr)).length,
        totalProducts: 0,
        openServiceRequests: serviceRequests.filter(request => !terminalStatuses.has(request.workflowStatus || request.status)).length,
        activeTechnicians: technicians.filter(technician => ['available', 'busy'].includes(technician.status)).length,
        lowStockVariants: 0
      },
      charts: {
        revenue7d: [],
        orderStatus: [],
        serviceStatus: [...statusCounts].map(([status, total]) => ({ status, total }))
      },
      attention: urgent,
      recentOrders: [],
      lowStock: []
    });
  }

  const todayRevenue = db.orders
    .filter(o => o.status === 'delivered' && o.deliveredAt && o.deliveredAt.startsWith(todayStr))
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = db.orders.filter(o => o.status === 'pending').length;

  const newCustomers = db.customers.filter(c => c.createdAt && c.createdAt.startsWith(todayStr)).length;

  const totalProducts = db.products.length;
  const totalOrders = db.orders.length;

  const recentOrders = db.orders.slice(0, 5).map(o => ({
    key: o.id,
    orderNumber: o.code,
    customer: o.customerName,
    total: o.total,
    status: o.status,
    date: new Date(o.createdAt).toLocaleDateString('vi-VN')
  }));

  const stats = {
    todayRevenue,
    pendingOrders,
    newCustomers,
    totalProducts,
    totalOrders,
    recentOrders
  };

  return respondSuccess(res, stats);
});

module.exports = router;
