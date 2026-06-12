import { createHash, randomBytes } from 'node:crypto';

import { REFRESH_TOKEN_BYTES } from '../config/constants';

/** Generates a cryptographically random hex token (default 64 bytes → 128 hex chars). */
export function generateOpaqueToken(bytes = REFRESH_TOKEN_BYTES): string {
  return randomBytes(bytes).toString('hex');
}

/** SHA-256 hex digest — used to store refresh / reset tokens without the raw value. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
