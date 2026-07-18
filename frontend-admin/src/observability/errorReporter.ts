type ErrorSource = 'react-boundary' | 'window-error' | 'unhandled-rejection';

function fingerprint(value: string) {
  let hash = 2166136261;
  for (const character of value.slice(0, 2_000)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `e-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function safeRoute() {
  const route = window.location.hash.replace(/^#/, '').split('?')[0] || window.location.pathname;
  return route
    .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/DL247-[^/]+/gi, '/:id');
}

export function reportClientError(error: unknown, source: ErrorSource, componentStack = '') {
  const endpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT?.trim();
  if (!endpoint || import.meta.env.DEV) return;
  const name = error instanceof Error ? error.name : 'UnknownError';
  const signature = componentStack
    .replace(/:\d+:\d+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: 'client_error',
      app: 'admin',
      source,
      name,
      fingerprint: fingerprint(`${name}:${signature}`),
      route: safeRoute(),
      release: import.meta.env.VITE_APP_RELEASE || 'unknown',
      occurredAt: new Date().toISOString(),
    }),
    keepalive: true,
    credentials: 'omit',
  }).catch(() => undefined);
}

export function installGlobalErrorReporting() {
  window.addEventListener('error', (event) => reportClientError(event.error, 'window-error'));
  window.addEventListener('unhandledrejection', (event) =>
    reportClientError(event.reason, 'unhandled-rejection'),
  );
}
