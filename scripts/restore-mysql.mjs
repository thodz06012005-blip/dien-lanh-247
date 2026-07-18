import { spawn } from 'node:child_process';
import { createDecipheriv, createHash } from 'node:crypto';
import {
  closeSync,
  createReadStream,
  existsSync,
  openSync,
  readSync,
  readFileSync,
  realpathSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createGunzip } from 'node:zlib';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function backupEncryptionKey(requiredForRestore = false) {
  const value = process.env.BACKUP_ENCRYPTION_KEY?.trim();
  if (!value) {
    if (requiredForRestore) throw new Error('BACKUP_ENCRYPTION_KEY is required for encrypted restore.');
    return null;
  }
  const key = /^[a-f0-9]{64}$/i.test(value)
    ? Buffer.from(value, 'hex')
    : Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY must decode to exactly 32 bytes.');
  return key;
}

const databaseUrl = new URL(required('DATABASE_URL'));
if (!['mysql:', 'mariadb:'].includes(databaseUrl.protocol)) {
  throw new Error('DATABASE_URL must use mysql:// or mariadb://.');
}

const databaseName = safeDecode(databaseUrl.pathname.replace(/^\//, ''));
if (!databaseName) throw new Error('DATABASE_URL must include a database name.');
if (required('RESTORE_CONFIRM') !== databaseName) {
  throw new Error('RESTORE_CONFIRM must exactly match the target database name.');
}
if (
  process.env.NODE_ENV === 'production' &&
  process.env.ALLOW_PRODUCTION_RESTORE !== 'true'
) {
  throw new Error('Production restore requires ALLOW_PRODUCTION_RESTORE=true.');
}

const backupDirectory = realpathSync(
  path.resolve(process.env.BACKUP_DIRECTORY?.trim() || 'var/backups'),
);
const restoreFile = realpathSync(path.resolve(required('RESTORE_FILE')));
const relative = path.relative(backupDirectory, restoreFile);
if (relative.startsWith('..') || path.isAbsolute(relative)) {
  throw new Error('RESTORE_FILE must be inside BACKUP_DIRECTORY.');
}
if (!/\.sql\.gz(?:\.enc)?$/.test(restoreFile) || !statSync(restoreFile).isFile()) {
  throw new Error('RESTORE_FILE must be a readable .sql.gz or .sql.gz.enc backup.');
}
if (process.env.NODE_ENV === 'production' && !restoreFile.endsWith('.enc')) {
  throw new Error('Production restore requires an encrypted .sql.gz.enc backup.');
}

const checksumFile = `${restoreFile}.sha256`;
if (!existsSync(checksumFile)) throw new Error('Missing SHA-256 sidecar file.');
const expectedChecksum = readFileSync(checksumFile, 'utf8').trim().split(/\s+/)[0];
const actualChecksum = sha256(restoreFile);
if (!/^[a-f0-9]{64}$/i.test(expectedChecksum) || expectedChecksum !== actualChecksum) {
  throw new Error('Backup checksum verification failed.');
}

const mysql = spawn(
  process.env.MYSQL_BIN || 'mysql',
  [
    '--host',
    databaseUrl.hostname,
    '--port',
    databaseUrl.port || '3306',
    '--user',
    safeDecode(databaseUrl.username),
    '--default-character-set=utf8mb4',
    databaseName,
  ],
  {
    env: {
      ...process.env,
      MYSQL_PWD: safeDecode(databaseUrl.password),
    },
    stdio: ['pipe', 'inherit', 'pipe'],
  },
);

let stderr = '';
mysql.stderr.setEncoding('utf8');
mysql.stderr.on('data', (chunk) => {
  stderr += chunk;
  if (stderr.length > 4_000) stderr = stderr.slice(-4_000);
});

const exitPromise = new Promise((resolve, reject) => {
  mysql.once('error', reject);
  mysql.once('close', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`Database restore failed: ${stderr.trim().slice(0, 500)}`));
  });
});

const sourceStreams = [];
if (restoreFile.endsWith('.enc')) {
  const key = backupEncryptionKey(true);
  const magic = Buffer.alloc(9);
  const iv = Buffer.alloc(12);
  const fileSize = statSync(restoreFile).size;
  const authTag = Buffer.alloc(16);
  const descriptor = openSync(restoreFile, 'r');
  readSync(descriptor, magic, 0, magic.length, 0);
  readSync(descriptor, iv, 0, iv.length, magic.length);
  readSync(descriptor, authTag, 0, authTag.length, fileSize - authTag.length);
  closeSync(descriptor);
  if (magic.toString('ascii') !== 'DL247BKP1' || fileSize <= 37) {
    throw new Error('Encrypted backup header is invalid.');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  sourceStreams.push(
    createReadStream(restoreFile, { start: 21, end: fileSize - 17 }),
    decipher,
  );
} else {
  sourceStreams.push(createReadStream(restoreFile));
}

await Promise.all([pipeline(...sourceStreams, createGunzip(), mysql.stdin), exitPromise]);

console.log(`Restore completed and checksum verified for database: ${databaseName}`);
