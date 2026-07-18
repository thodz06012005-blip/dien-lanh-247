'use strict';

const COMMERCE_PATHS = [
  /^\/(?:products|cart|orders|categories|brands)(?:\/|$)/,
  /^\/admin\/(?:products|orders)(?:\/|$)/,
  /^\/account\/orders(?:\/|$)/
];

function resolveServiceOnlyMode(environment = process.env, fallback = true) {
  const raw = environment.SERVICE_ONLY_MODE;
  let enabled = fallback;
  if (raw === true || raw === 'true' || raw === '1') enabled = true;
  else if (raw === false || raw === 'false' || raw === '0') enabled = false;
  else if (raw !== undefined && raw !== null && raw !== '') {
    throw new Error('SERVICE_ONLY_MODE must be true or false.');
  }

  if (environment.NODE_ENV === 'production' && !enabled) {
    throw new Error('SERVICE_ONLY_MODE must be true in production.');
  }
  return enabled;
}

function isCommerceApiPath(value) {
  const pathname = String(value || '').split('?')[0].replace(/\/{2,}/g, '/');
  return COMMERCE_PATHS.some(pattern => pattern.test(pathname));
}

function serviceOnlyMiddleware(enabled) {
  return (req, res, next) => {
    if (!enabled || !isCommerceApiPath(req.path || req.url)) return next();
    return res.status(410).json({
      success: false,
      statusCode: 410,
      error: {
        code: 'COMMERCE_DISABLED',
        message: 'Chức năng bán sản phẩm không còn khả dụng ở chế độ dịch vụ thuần túy.'
      }
    });
  };
}

module.exports = {
  isCommerceApiPath,
  resolveServiceOnlyMode,
  serviceOnlyMiddleware
};
