'use strict';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The mock development server must not run with NODE_ENV=production.');
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ENABLE_DEV_ENDPOINTS = 'true';
process.env.ENABLE_DEMO_ACCOUNTS = 'true';
process.env.MOCK_ENABLE_DEMO_ACCOUNTS = 'true';
// Phase 4 removed the legacy commerce routers; development uses the same
// public contract as production.
process.env.SERVICE_ONLY_MODE = process.env.SERVICE_ONLY_MODE || 'true';

require('../server');
