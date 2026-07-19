import { X509Certificate } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.env.GO_LIVE_CONFIG_DIR || 'deploy');
const paths = {
  production: resolve(root, 'env/production.env'),
  backend: resolve(root, 'env/backend.env'),
  database: resolve(root, 'env/database.env'),
  certificate: resolve(root, 'certs/fullchain.pem'),
  privateKey: resolve(root, 'certs/privkey.pem'),
};
const failures = [];

function parseEnv(path) {
  if (!existsSync(path)) {
    failures.push(`missing ${path}`);
    return {};
  }
  const values = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;
    values[trimmed.slice(0, separator)] = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function placeholder(value) {
  return !value || /(?:example|localhost|\.local$|change[_-]?me|replace|placeholder|<|>)/i.test(value);
}

function requireValue(values, name, label, minimum = 1) {
  const value = values[name];
  if (placeholder(value) || String(value).length < minimum) failures.push(`${label}.${name} is missing, weak or placeholder`);
  return value;
}

function requireMode(path, label) {
  if (!existsSync(path) || process.platform === 'win32') return;
  if ((statSync(path).mode & 0o077) !== 0) failures.push(`${label} must not be group/world readable`);
}

const production = parseEnv(paths.production);
const backend = parseEnv(paths.backend);
const database = parseEnv(paths.database);

if (production.APP_VERSION !== '1.0.0') failures.push('APP_VERSION must be exactly 1.0.0');
const userDomain = requireValue(production, 'USER_DOMAIN', 'production');
const adminDomain = requireValue(production, 'ADMIN_DOMAIN', 'production');
if (userDomain && adminDomain && userDomain === adminDomain) failures.push('USER_DOMAIN and ADMIN_DOMAIN must be distinct');

for (const [name, expected] of [
  ['RUN_MIGRATIONS', 'true'],
  ['RUN_SEED', 'false'],
  ['SERVICE_ONLY_MODE', 'true'],
  ['ENABLE_DEV_ENDPOINTS', 'false'],
  ['ENABLE_DEMO_ACCOUNTS', 'false'],
]) {
  if (backend[name] !== expected) failures.push(`backend.${name} must be ${expected}`);
}
for (const name of ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'AUDIT_LOG_HASH_SALT']) {
  requireValue(backend, name, 'backend', name === 'DATABASE_URL' ? 12 : 32);
}
for (const name of ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM']) {
  requireValue(backend, name, 'backend');
}
const backupKey = requireValue(backend, 'BACKUP_ENCRYPTION_KEY', 'backend', 43);
if (backupKey) {
  const decoded = /^[a-f\d]{64}$/i.test(backupKey) ? Buffer.from(backupKey, 'hex') : Buffer.from(backupKey, 'base64');
  if (decoded.length !== 32) failures.push('BACKUP_ENCRYPTION_KEY must decode to exactly 32 bytes');
}
if (!['local', 'cloudinary'].includes(backend.MEDIA_STORAGE_PROVIDER)) failures.push('MEDIA_STORAGE_PROVIDER must be local or cloudinary');
if (backend.MEDIA_STORAGE_PROVIDER === 'local' && backend.MEDIA_STORAGE_PATH !== '/app/storage') failures.push('local MEDIA_STORAGE_PATH must be /app/storage');
if (backend.MEDIA_STORAGE_PROVIDER === 'cloudinary') {
  for (const name of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) requireValue(backend, name, 'backend');
}

for (const name of ['MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD']) {
  requireValue(database, name, 'database', name.includes('PASSWORD') ? 16 : 1);
}

requireMode(paths.production, 'production.env');
requireMode(paths.backend, 'backend.env');
requireMode(paths.database, 'database.env');
requireMode(paths.privateKey, 'TLS private key');

if (!existsSync(paths.certificate)) failures.push(`missing ${paths.certificate}`);
else {
  try {
    const cert = new X509Certificate(readFileSync(paths.certificate));
    if (cert.subject === cert.issuer) failures.push('TLS certificate must be CA-issued, not self-signed');
    if (Date.parse(cert.validTo) - Date.now() < 14 * 24 * 60 * 60 * 1000) failures.push('TLS certificate expires in less than 14 days');
    if (userDomain && !cert.checkHost(userDomain)) failures.push('TLS certificate does not cover USER_DOMAIN');
    if (adminDomain && !cert.checkHost(adminDomain)) failures.push('TLS certificate does not cover ADMIN_DOMAIN');
  } catch {
    failures.push('TLS certificate is invalid');
  }
}
if (!existsSync(paths.privateKey) || !readFileSync(paths.privateKey, 'utf8').includes('PRIVATE KEY')) failures.push('TLS private key is missing or invalid');

if (failures.length) {
  console.error('Production readiness FAIL:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Production readiness PASS: domain, TLS, secrets, SMTP, storage, database, backup and runtime guards are configured.');
