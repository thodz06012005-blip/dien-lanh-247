import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = mkdtempSync(join(tmpdir(), 'dl247-go-live-'));
const envDir = join(root, 'env');
const certDir = join(root, 'certs');
mkdirSync(envDir, { recursive: true });
mkdirSync(certDir, { recursive: true });

const files = {
  production: join(envDir, 'production.env'),
  backend: join(envDir, 'backend.env'),
  database: join(envDir, 'database.env'),
};

writeFileSync(files.production, 'APP_VERSION=1.0.0\nUSER_DOMAIN=customer.dl247.test\nADMIN_DOMAIN=admin.dl247.test\n', { mode: 0o600 });
writeFileSync(files.backend, [
  'DATABASE_URL=mysql://dl247:FixtureDatabasePassword123@db:3306/dien_lanh_247',
  'JWT_ACCESS_SECRET=fixture_access_secret_0123456789_abcdef',
  'JWT_REFRESH_SECRET=fixture_refresh_secret_0123456789_abcdef',
  'AUDIT_LOG_HASH_SALT=fixture_audit_secret_0123456789_abcdef',
  'RUN_MIGRATIONS=true',
  'RUN_SEED=false',
  'SERVICE_ONLY_MODE=true',
  'ENABLE_DEV_ENDPOINTS=false',
  'ENABLE_DEMO_ACCOUNTS=false',
  'BACKUP_ENCRYPTION_KEY=ZmFrZS1iYWNrLXVwLWtleS0zMi1ieXRlcy0xMjM0NTY=',
  'SMTP_HOST=smtp.dl247.test',
  'SMTP_PORT=587',
  'SMTP_USER=mailer',
  'SMTP_PASS=FixtureMailPassword123',
  'MAIL_FROM=no-reply@dl247.test',
  'MEDIA_STORAGE_PROVIDER=local',
  'MEDIA_STORAGE_PATH=/app/storage',
  '',
].join('\n'), { mode: 0o600 });
writeFileSync(files.database, [
  'MYSQL_DATABASE=dien_lanh_247',
  'MYSQL_USER=dl247_app',
  'MYSQL_PASSWORD=FixtureDatabasePassword123',
  'MYSQL_ROOT_PASSWORD=FixtureRootPassword12345',
  '',
].join('\n'), { mode: 0o600 });

const caKey = join(root, 'ca.key');
const caCert = join(root, 'ca.pem');
const csr = join(root, 'server.csr');
const ext = join(root, 'server.ext');
const privateKey = join(certDir, 'privkey.pem');
const certificate = join(certDir, 'fullchain.pem');
writeFileSync(ext, 'subjectAltName=DNS:customer.dl247.test,DNS:admin.dl247.test\n');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', caKey, '-out', caCert, '-subj', '/CN=DL247 Fixture CA', '-days', '30'], { stdio: 'ignore' });
execFileSync('openssl', ['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', privateKey, '-out', csr, '-subj', '/CN=customer.dl247.test'], { stdio: 'ignore' });
execFileSync('openssl', ['x509', '-req', '-in', csr, '-CA', caCert, '-CAkey', caKey, '-CAcreateserial', '-out', certificate, '-days', '30', '-sha256', '-extfile', ext], { stdio: 'ignore' });
chmodSync(privateKey, 0o600);

const verifier = resolve('scripts/verify-production-readiness.mjs');
const run = () => execFileSync(process.execPath, [verifier], {
  env: { ...process.env, GO_LIVE_CONFIG_DIR: root },
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

const passingOutput = run();
if (!passingOutput.includes('Production readiness PASS')) throw new Error('Expected production fixture to pass');

writeFileSync(files.backend, readFileSync(files.backend, 'utf8').replace('RUN_SEED=false', 'RUN_SEED=true'), { mode: 0o600 });
let blocked = false;
try { run(); } catch (error) {
  blocked = String(error.stderr || '').includes('backend.RUN_SEED must be false');
}
if (!blocked) throw new Error('Expected production seed fixture to be blocked');

console.log('Production readiness verifier PASS: valid fixture accepted and unsafe RUN_SEED rejected.');
