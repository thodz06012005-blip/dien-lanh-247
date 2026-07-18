import { HttpStatus } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../constants/error-codes';
import type { RequestWithContext } from './request-context.middleware';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const AUTH_COOKIE_PATTERN =
  /(?:^|;\s*)(?:accessToken|refreshToken|adminAccessToken|adminRefreshToken)=/;
const ALLOWED_CONTENT_TYPES = [
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
];

/**
 * Dependency-free Helmet-compatible baseline. Keeping this policy local avoids
 * package drift while enforcing the same high-value headers on every response.
 */
export function helmetSecurityMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  response.removeHeader('X-Powered-By');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-DNS-Prefetch-Control', 'off');
  response.setHeader('X-Download-Options', 'noopen');
  response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()',
  );
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  response.setHeader('Origin-Agent-Cluster', '?1');
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
  );

  if (request.secure || request.headers['x-forwarded-proto'] === 'https') {
    response.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  next();
}

// Backward-compatible export for older imports.
export const securityHeadersMiddleware = helmetSecurityMiddleware;

/**
 * Cookie-authenticated browser writes must come from an allowed origin and
 * include a non-simple header. Requests without browser origin metadata remain
 * available to trusted CLI/health integrations and are still authenticated.
 */
export function csrfProtectionMiddleware(allowedOrigins: readonly string[]) {
  const allowlist = new Set(allowedOrigins);
  return (request: Request, response: Response, next: NextFunction) => {
    if (!STATE_CHANGING_METHODS.has(request.method)) return next();
    if (!AUTH_COOKIE_PATTERN.test(request.headers.cookie ?? '')) return next();

    const origin = request.headers.origin;
    const fetchSite = request.headers['sec-fetch-site'];
    const browserRequest = Boolean(origin || fetchSite);
    if (!browserRequest) return next();

    const sameSite = fetchSite === 'same-origin' || fetchSite === 'same-site';
    const allowedOrigin = Boolean(origin && allowlist.has(origin));
    const explicitProtection = request.header('x-csrf-protection') === '1';
    if ((sameSite || allowedOrigin) && explicitProtection) return next();

    const requestWithContext = request as RequestWithContext;
    return response.status(HttpStatus.FORBIDDEN).json({
      success: false,
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Yêu cầu thay đổi trạng thái không vượt qua kiểm tra CSRF.',
      error: {
        code: 'CSRF_VALIDATION_FAILED',
        message: 'Yêu cầu thay đổi trạng thái không vượt qua kiểm tra CSRF.',
      },
      requestId: requestWithContext.requestId ?? 'unknown',
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.path,
    });
  };
}

export function contentTypeGuardMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (!BODY_METHODS.has(request.method)) {
    next();
    return;
  }

  const contentLength = request.headers['content-length'];
  if (contentLength === '0') {
    next();
    return;
  }

  const contentType = request.headers['content-type']?.toLowerCase() ?? '';
  const isAllowed = ALLOWED_CONTENT_TYPES.some((allowed) =>
    contentType.startsWith(allowed),
  );

  if (isAllowed) {
    next();
    return;
  }

  const requestWithContext = request as RequestWithContext;
  const message =
    'Content-Type must be application/json, form-urlencoded or multipart/form-data.';

  response.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json({
    success: false,
    statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    message,
    error: {
      code: ErrorCode.UNSUPPORTED_MEDIA_TYPE,
      message,
    },
    requestId: requestWithContext.requestId ?? 'unknown',
    timestamp: new Date().toISOString(),
    method: request.method,
    path: request.originalUrl,
  });
}
