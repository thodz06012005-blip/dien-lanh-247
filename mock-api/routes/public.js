const express = require('express');
const { readDB } = require('../utils/db');
const { respondSuccess } = require('../utils/response');

const router = express.Router();
const capabilities = {
  serviceRequests: true,
  quotations: true,
  servicePayments: true,
  warranty: true,
  commerce: false,
};

const health = () => ({
  status: 'ok',
  service: 'dl247-mock-api',
  version: 'development',
  mode: 'service-only',
  contractVersion: 'service-only-v1',
  capabilities,
  timestamp: new Date().toISOString(),
});

router.get('/', (_req, res) =>
  respondSuccess(res, {
    name: 'Điện Lạnh 247 Mock API',
    mode: 'service-only',
    contractVersion: 'service-only-v1',
    links: {
      health: '/api/v1/health',
      serviceCategories: '/api/v1/service-categories',
      serviceRequests: '/api/v1/service-requests',
    },
  }),
);

router.get('/health', (_req, res) => res.status(200).json(health()));
router.get('/health/live', (_req, res) => res.status(200).json(health()));
router.get('/health/ready', (_req, res) =>
  res.status(200).json({ ...health(), checks: { database: { status: 'up', latencyMs: 0 } } }),
);

router.get('/settings/public', (_req, res) => {
  const { hotline, zalo, email, address } = readDB().settings;
  return respondSuccess(res, { hotline, zalo, email, address });
});

router.get('/service-categories', (_req, res) =>
  respondSuccess(res, readDB().serviceCategories || []),
);

module.exports = router;
