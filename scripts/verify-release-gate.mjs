import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const approvalPath = resolve(process.env.RELEASE_APPROVAL_FILE || 'docs/phase-11-12/release-v1.0.0-approval.json');
const approval = JSON.parse(readFileSync(approvalPath, 'utf8'));
const failures = [];

if (approval.version !== '1.0.0') failures.push('version must be 1.0.0');
if (approval.decision !== 'GO') failures.push('decision must be GO');
if (approval.uatSigned !== true) failures.push('UAT must be signed');
if (approval.handoverSigned !== true) failures.push('handover must be signed');
if (approval.productionReadinessVerified !== true) failures.push('production readiness must be verified');
if (Number(approval.openP0 || 0) !== 0) failures.push('open P0 defects must be zero');
if (Number(approval.openP1 || 0) !== 0) failures.push('open P1 defects must be zero');
if (!approval.approvedBy?.owner || !approval.approvedBy?.operations || !approval.approvedBy?.qa) {
  failures.push('owner, operations and QA approvals are required');
}
if (!/^\d{4}-\d{2}-\d{2}T/.test(String(approval.approvedAt || ''))) {
  failures.push('approvedAt must be an ISO timestamp');
}

if (failures.length) {
  console.error('Release v1.0.0 is blocked:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Release v1.0.0 gate PASS. Signed UAT, handover and production readiness are present.');
