/**
 * Offline progress backup as JSON file & compact copy-paste short code (OYNA2.<b64url>.<crc32>).
 * Uses pure Web APIs (TextEncoder / btoa / atob) so it works in browser, Worker, and Node.
 */

import { migrateProgress } from './migrations';
import { ProgressV2Schema, type ProgressV2 } from './schema';

const BACKUP_PREFIX = 'OYNA2';

function crc32Hex(bytes: Uint8Array): string {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i] ?? 0;
    crc ^= byte;
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

export function exportBackupJson(progress: ProgressV2): string {
  const validated = ProgressV2Schema.parse(progress);
  return JSON.stringify(validated, null, 2);
}

export function importBackupJson(jsonText: string, nowMs: number): ProgressV2 {
  const parsed: unknown = JSON.parse(jsonText);
  return migrateProgress(parsed, nowMs);
}

export function encodeShortCode(progress: ProgressV2): string {
  const validated = ProgressV2Schema.parse(progress);
  const bytes = new TextEncoder().encode(JSON.stringify(validated));
  const payload = toBase64Url(bytes);
  const checksum = crc32Hex(bytes);
  return `${BACKUP_PREFIX}.${payload}.${checksum}`;
}

export function decodeShortCode(code: string, nowMs: number): ProgressV2 {
  const parts = code.trim().split('.');
  if (parts.length !== 3 || parts[0] !== BACKUP_PREFIX) {
    throw new Error('Notoʻgʻri nusxa kodi formati.');
  }
  const payload = parts[1];
  const expectedCrc = parts[2];
  if (!payload || !expectedCrc) {
    throw new Error('Nusxa kodi toʻliq emas.');
  }

  const bytes = fromBase64Url(payload);
  const actualCrc = crc32Hex(bytes);
  if (actualCrc !== expectedCrc.toLowerCase()) {
    throw new Error('Nusxa kodi shikastlangan yoki oʻzgartirilgan.');
  }

  const json = new TextDecoder().decode(bytes);
  return importBackupJson(json, nowMs);
}
