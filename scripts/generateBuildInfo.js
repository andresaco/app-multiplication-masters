#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get git commit hash (short) or generate a hash from timestamp
let commitHash = 'unknown';
try {
  commitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
  console.warn('Could not get git commit hash, using timestamp');
}

// Get timestamp
const timestamp = new Date().toISOString();
const buildDate = new Date().toLocaleDateString('es-ES', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

// Generate build ID (combination of commit hash and timestamp)
const buildId = `${commitHash}-${Date.now()}`.substring(0, 16);

// Create buildInfo.ts file
const buildInfoContent = `// Auto-generated build information - DO NOT EDIT MANUALLY
export const BUILD_INFO = {
  hash: '${commitHash}',
  buildId: '${buildId}',
  timestamp: '${timestamp}',
  buildDate: '${buildDate}'
} as const;
`;

const outputPath = path.join(__dirname, '..', 'buildInfo.ts');
fs.writeFileSync(outputPath, buildInfoContent, 'utf-8');
console.log(`✓ Build info generated: ${commitHash}`);
