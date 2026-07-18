const express = require('express');
const crypto = require('crypto');
const { readDB, writeDB } = require('../utils/db');
const { respondSuccess, respondCreated, respondError } = require('../utils/response');
const { requirePermission } = require('../utils/auth');

const router = express.Router();
const read = requirePermission('operations:read');
const manage = requirePermission('operations:update');
const terminal = new Set(['COMPLETED', 'CLOSED', 'CANCELLED', 'REJECTED']);

function prepare(db) {
  for (const key of [
    'customerDevices',
    'technicianSchedules',
    'serviceAssignments',
    'serviceNotes',
    'slaPolicies',
    'serviceQuotes',
    'servicePayments',
    'completionReports',
    'warranties',
  ]) {
    if (!Array.isArray(db[key])) db[key] = [];
  }
  return db;
}

function requestOrNull(db, id) {
  return (db.serviceRequests || []).find((item) => item.id === id) || null;
}

function operationsOverview(db) {
  const requests = db.serviceRequests || [];
  const attention = slaAlerts(db);
  return {
    metrics: {
      customers: (db.customers || []).length,
      devices: db.customerDevices.filter((item) => item.isActive !== false).length,
      technicians: (db.technicians || []).filter((item) => item.status !== 'inactive').length,
      activeRequests: requests.filter(
        (item) => !terminal.has(item.workflowStatus || String(item.status).toUpperCase()),
      ).length,
      breachedSla: attention.filter((item) => item.breachStage).length,
      unpaidAcceptedQuotes: db.serviceQuotes.filter(
        (quote) => quote.status === 'ACCEPTED' && !quote.paidAt,
      ).length,
      activeWarranties: db.warranties.filter((item) => item.status === 'ACTIVE').length,
      serviceRevenue30Days: db.servicePayments
        .filter((item) => item.status === 'COMPLETED')
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    },
    attention,
  };
}

function slaAlerts(db) {
  return (db.serviceRequests || [])
    .filter((item) => item.priority === 'urgent' || item.slaBreachStage)
    .filter((item) => !terminal.has(item.workflowStatus || String(item.status).toUpperCase()))
    .map((item) => ({
      id: item.id,
      customerName: item.customerName,
      technicianName:
        (db.technicians || []).find((tech) => tech.id === item.assignedTechnicianId)?.name || null,
      priority: item.priority,
      workflowStatus: item.workflowStatus || String(item.status).toUpperCase(),
      breachStage: item.slaBreachStage || null,
      resolutionDueAt: item.scheduledEnd || null,
    }));
}

function workspace(db, request) {
  const assignment = db.serviceAssignments.filter((item) => item.requestId === request.id);
  const technician = (db.technicians || []).find(
    (item) => item.id === request.assignedTechnicianId,
  );
  if (!assignment.length && technician) {
    assignment.push({
      id: `ASSIGN-${request.id}`,
      requestId: request.id,
      technicianId: technician.id,
      technicianName: technician.name,
      scheduledStart: request.scheduledStart,
      scheduledEnd: request.scheduledEnd,
      status: 'ACTIVE',
    });
  }
  return {
    request,
    customer: (db.customers || []).find((item) => item.phone === request.customerPhone) || null,
    device:
      db.customerDevices.find(
        (item) =>
          item.serviceRequestId === request.id || item.customerPhone === request.customerPhone,
      ) || null,
    assignments: assignment,
    notes: db.serviceNotes.filter((item) => item.requestId === request.id),
    sla: request.sla || null,
    quotes: db.serviceQuotes.filter((item) => item.requestId === request.id),
    payments: db.servicePayments.filter((item) => item.requestId === request.id),
    completion: db.completionReports.find((item) => item.requestId === request.id) || null,
    warranties: db.warranties.filter((item) => item.requestId === request.id),
    timeline: request.statusHistory || [],
    audit: (db.auditLogs || []).filter((item) => item.resourceId === request.id),
  };
}

router.get('/admin/operations/overview', read, (_req, res) =>
  respondSuccess(res, operationsOverview(prepare(readDB()))),
);

router.get('/admin/operations/customers', read, (req, res) => {
  const db = prepare(readDB());
  const items = (db.customers || []).map((customer, index) => {
    const parts = customer.name.trim().split(/\s+/);
    return {
      ...customer,
      id: Number(String(customer.id).replace(/\D/g, '')) || index + 1,
      firstName: parts.slice(0, -1).join(' '),
      lastName: parts.at(-1) || '',
      deviceCount: db.customerDevices.filter((device) => device.customerPhone === customer.phone)
        .length,
    };
  });
  return respondSuccess(res, {
    items,
    meta: { page: 1, limit: Number(req.query.limit || 100), total: items.length, totalPages: 1 },
  });
});

router.get('/admin/operations/customers/:id', read, (req, res) => {
  const db = prepare(readDB());
  const customer =
    (db.customers || [])[Number(req.params.id) - 1] ||
    (db.customers || []).find((item) => item.id === req.params.id);
  return customer
    ? respondSuccess(res, {
        customer,
        devices: db.customerDevices.filter((item) => item.customerPhone === customer.phone),
        serviceRequests: (db.serviceRequests || []).filter(
          (item) => item.customerPhone === customer.phone,
        ),
      })
    : respondError(res, 404, 'Không tìm thấy khách hàng', 'CUSTOMER_NOT_FOUND');
});

router.post('/admin/operations/devices', manage, (req, res) => {
  const db = prepare(readDB());
  const device = {
    id: db.customerDevices.length + 1,
    ...req.body,
    isActive: req.body.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.customerDevices.unshift(device);
  writeDB(db);
  return respondCreated(res, device);
});

router.patch('/admin/operations/devices/:id', manage, (req, res) => {
  const db = prepare(readDB());
  const device = db.customerDevices.find((item) => item.id === Number(req.params.id));
  if (!device) return respondError(res, 404, 'Không tìm thấy thiết bị', 'DEVICE_NOT_FOUND');
  Object.assign(device, req.body, { updatedAt: new Date().toISOString() });
  writeDB(db);
  return respondSuccess(res, device);
});

router.get('/admin/operations/technicians', read, (req, res) => {
  const db = prepare(readDB());
  const items = (db.technicians || []).map((technician) => ({
    ...technician,
    activeAssignments: db.serviceAssignments.filter(
      (item) => item.technicianId === technician.id && item.status === 'ACTIVE',
    ).length,
    nextScheduleAt:
      db.technicianSchedules.find((item) => item.technicianId === technician.id)?.startAt || null,
  }));
  return respondSuccess(res, {
    items,
    meta: { page: 1, limit: Number(req.query.limit || 100), total: items.length, totalPages: 1 },
  });
});

router.get('/admin/operations/technicians/:id', read, (req, res) => {
  const db = prepare(readDB());
  const technician = (db.technicians || []).find((item) => item.id === req.params.id);
  return technician
    ? respondSuccess(res, {
        technician,
        schedules: db.technicianSchedules.filter((item) => item.technicianId === technician.id),
        assignments: db.serviceAssignments.filter((item) => item.technicianId === technician.id),
      })
    : respondError(res, 404, 'Không tìm thấy kỹ thuật viên', 'TECHNICIAN_NOT_FOUND');
});

router.post('/admin/operations/technician-schedules', manage, (req, res) => {
  const db = prepare(readDB());
  const schedule = {
    id: db.technicianSchedules.length + 1,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  db.technicianSchedules.unshift(schedule);
  writeDB(db);
  return respondCreated(res, schedule);
});

router.get('/admin/operations/requests/:id', read, (req, res) => {
  const db = prepare(readDB());
  const request = requestOrNull(db, req.params.id);
  return request
    ? respondSuccess(res, workspace(db, request))
    : respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
});

router.post('/admin/operations/requests/:id/dispatch', manage, (req, res) => {
  const db = prepare(readDB());
  const request = requestOrNull(db, req.params.id);
  if (!request)
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const technician = (db.technicians || []).find((item) => item.id === req.body.technicianId);
  if (!technician)
    return respondError(res, 404, 'Không tìm thấy kỹ thuật viên', 'TECHNICIAN_NOT_FOUND');
  db.serviceAssignments.forEach((item) => {
    if (item.requestId === request.id) item.status = 'REASSIGNED';
  });
  db.serviceAssignments.unshift({
    id: crypto.randomUUID(),
    requestId: request.id,
    technicianId: technician.id,
    technicianName: technician.name,
    scheduledStart: req.body.scheduledStart,
    scheduledEnd: req.body.scheduledEnd,
    status: 'ACTIVE',
  });
  Object.assign(request, {
    assignedTechnicianId: technician.id,
    scheduledStart: req.body.scheduledStart,
    scheduledEnd: req.body.scheduledEnd,
    status: 'assigned',
    workflowStatus: 'ASSIGNED',
    updatedAt: new Date().toISOString(),
  });
  technician.status = 'busy';
  writeDB(db);
  return respondSuccess(res, workspace(db, request));
});

router.post('/admin/operations/requests/:id/reschedule', manage, (req, res) => {
  const db = prepare(readDB());
  const request = requestOrNull(db, req.params.id);
  if (!request)
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  Object.assign(request, {
    scheduledStart: req.body.scheduledStart,
    scheduledEnd: req.body.scheduledEnd,
    updatedAt: new Date().toISOString(),
  });
  writeDB(db);
  return respondSuccess(res, workspace(db, request));
});

router.post('/admin/operations/requests/:id/notes', manage, (req, res) => {
  const db = prepare(readDB());
  if (!requestOrNull(db, req.params.id))
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const note = {
    id: crypto.randomUUID(),
    requestId: req.params.id,
    body: req.body.body,
    visibility: req.body.visibility || 'INTERNAL',
    createdAt: new Date().toISOString(),
  };
  db.serviceNotes.unshift(note);
  writeDB(db);
  return respondCreated(res, note);
});

router.get('/admin/operations/sla/policies', read, (_req, res) =>
  respondSuccess(res, prepare(readDB()).slaPolicies),
);
router.post('/admin/operations/sla/policies', manage, (req, res) => {
  const db = prepare(readDB());
  const policy = { id: db.slaPolicies.length + 1, ...req.body };
  db.slaPolicies.push(policy);
  writeDB(db);
  return respondCreated(res, policy);
});
router.patch('/admin/operations/sla/policies/:id', manage, (req, res) => {
  const db = prepare(readDB());
  const policy = db.slaPolicies.find((item) => item.id === Number(req.params.id));
  if (!policy)
    return respondError(res, 404, 'Không tìm thấy chính sách SLA', 'SLA_POLICY_NOT_FOUND');
  Object.assign(policy, req.body);
  writeDB(db);
  return respondSuccess(res, policy);
});
router.get('/admin/operations/sla/alerts', read, (_req, res) =>
  respondSuccess(res, slaAlerts(prepare(readDB()))),
);
router.post('/admin/operations/sla/evaluate', manage, (_req, res) =>
  respondSuccess(res, slaAlerts(prepare(readDB()))),
);

router.post('/admin/operations/requests/:id/quotes', manage, (req, res) => {
  const db = prepare(readDB());
  if (!requestOrNull(db, req.params.id))
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const lines = (req.body.lines || []).map((line, index) => ({
    id: index + 1,
    lineType: line.lineType,
    description: line.description,
    quantity: Number(line.quantity),
    unit: line.unit,
    unitPrice: Number(line.unitPrice),
    lineTotal: Number(line.quantity) * Number(line.unitPrice),
    sortOrder: line.sortOrder || index,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const discount = Number(req.body.discountValue || 0);
  const tax = Math.max(0, ((subtotal - discount) * Number(req.body.taxRate || 0)) / 100);
  const quote = {
    id: db.serviceQuotes.length + 1,
    requestId: req.params.id,
    status: 'SENT',
    lines,
    subtotal,
    discountAmount: discount,
    taxAmount: tax,
    totalAmount: Math.max(0, subtotal - discount + tax),
    confirmationToken: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.serviceQuotes.unshift(quote);
  writeDB(db);
  return respondCreated(res, {
    ...quote,
    confirmationUrl: `/operations/quotes/confirm?token=${quote.confirmationToken}`,
  });
});

router.get('/admin/operations/quotes/:id', read, (req, res) => {
  const quote = prepare(readDB()).serviceQuotes.find((item) => item.id === Number(req.params.id));
  return quote
    ? respondSuccess(res, quote)
    : respondError(res, 404, 'Không tìm thấy báo giá', 'QUOTE_NOT_FOUND');
});
router.post('/operations/quotes/confirm', (req, res) => {
  const db = prepare(readDB());
  const quote = db.serviceQuotes.find((item) => item.confirmationToken === req.body.token);
  if (!quote) return respondError(res, 404, 'Báo giá không hợp lệ', 'QUOTE_NOT_FOUND');
  quote.status = req.body.decision === 'REJECTED' ? 'REJECTED' : 'ACCEPTED';
  quote.decidedAt = new Date().toISOString();
  writeDB(db);
  return respondSuccess(res, quote);
});

router.post('/admin/operations/requests/:id/payments', manage, (req, res) => {
  const db = prepare(readDB());
  if (!requestOrNull(db, req.params.id))
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const payment = {
    id: db.servicePayments.length + 1,
    requestId: req.params.id,
    status: 'COMPLETED',
    paidAt: new Date().toISOString(),
    ...req.body,
    amount: Number(req.body.amount),
  };
  db.servicePayments.unshift(payment);
  const request = requestOrNull(db, req.params.id);
  request.paymentStatus = 'paid';
  writeDB(db);
  return respondCreated(res, payment);
});
router.post('/admin/operations/requests/:id/completion', manage, (req, res) => {
  const db = prepare(readDB());
  if (!requestOrNull(db, req.params.id))
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const report = {
    id: db.completionReports.length + 1,
    requestId: req.params.id,
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  db.completionReports.unshift(report);
  writeDB(db);
  return respondCreated(res, report);
});
router.post('/admin/operations/requests/:id/warranties', manage, (req, res) => {
  const db = prepare(readDB());
  if (!requestOrNull(db, req.params.id))
    return respondError(res, 404, 'Không tìm thấy yêu cầu dịch vụ', 'SERVICE_REQUEST_NOT_FOUND');
  const warranty = {
    id: db.warranties.length + 1,
    requestId: req.params.id,
    status: 'ACTIVE',
    events: [],
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  db.warranties.unshift(warranty);
  writeDB(db);
  return respondCreated(res, warranty);
});
router.post('/admin/operations/warranties/:id/events', manage, (req, res) => {
  const db = prepare(readDB());
  const warranty = db.warranties.find((item) => item.id === Number(req.params.id));
  if (!warranty) return respondError(res, 404, 'Không tìm thấy bảo hành', 'WARRANTY_NOT_FOUND');
  const event = { id: crypto.randomUUID(), ...req.body, createdAt: new Date().toISOString() };
  warranty.events = warranty.events || [];
  warranty.events.unshift(event);
  writeDB(db);
  return respondCreated(res, event);
});

module.exports = router;
