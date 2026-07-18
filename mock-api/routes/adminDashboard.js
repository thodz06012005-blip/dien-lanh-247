const express = require('express');
const { readDB } = require('../utils/db');
const { respondSuccess } = require('../utils/response');
const { requirePermission } = require('../utils/auth');

const router = express.Router();

router.get('/admin/dashboard', requirePermission('dashboard:read'), (_req, res) => {
  const db = readDB();
  const requests = db.serviceRequests || [];
  const terminal = new Set(['completed', 'closed', 'cancelled', 'rejected']);
  const attention = requests
    .filter(
      (request) =>
        request.priority === 'urgent' && !terminal.has(String(request.status).toLowerCase()),
    )
    .slice(0, 12)
    .map((request) => ({
      id: request.id,
      customerName: request.customerName,
      priority: request.priority,
      workflowStatus: request.workflowStatus || String(request.status).toUpperCase(),
      resolutionDueAt: request.scheduledEnd || null,
      breachStage: null,
    }));
  const completedRevenue = (db.servicePayments || [])
    .filter((payment) => payment.status === 'COMPLETED')
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return respondSuccess(res, {
    mode: 'service-only',
    contractVersion: 'service-only-v1',
    metrics: {
      customers: (db.customers || []).length,
      devices: (db.customerDevices || []).filter((device) => device.isActive !== false).length,
      technicians: (db.technicians || []).filter((technician) => technician.status !== 'inactive')
        .length,
      activeRequests: requests.filter(
        (request) => !terminal.has(String(request.status).toLowerCase()),
      ).length,
      breachedSla: attention.filter((item) => item.breachStage).length,
      unpaidAcceptedQuotes: (db.serviceQuotes || []).filter((quote) => quote.status === 'ACCEPTED')
        .length,
      activeWarranties: (db.warranties || []).filter((warranty) => warranty.status === 'ACTIVE')
        .length,
      serviceRevenue30Days: completedRevenue,
    },
    attention,
  });
});

module.exports = router;
