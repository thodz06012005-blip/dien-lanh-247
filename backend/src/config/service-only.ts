export const SERVICE_ONLY_ENV_NAME = 'SERVICE_ONLY_MODE';

export function resolveServiceOnlyMode(
  source: Record<string, unknown>,
  fallback = true,
): boolean {
  const raw = source[SERVICE_ONLY_ENV_NAME];
  if (raw === undefined || raw === null || raw === '') return fallback;
  if (raw === true || raw === 'true' || raw === '1') return true;
  if (raw === false || raw === 'false' || raw === '0') return false;
  throw new Error(`${SERVICE_ONLY_ENV_NAME} must be true or false.`);
}
