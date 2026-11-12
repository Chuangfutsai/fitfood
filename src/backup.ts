import type { AppData } from './types';
import { CURRENT_SCHEMA_VERSION, normalizeAppData, UnsupportedDataVersionError } from './storage';

export interface BackupEnvelope {
  app: 'fitfood';
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  exportedAt: string;
  data: AppData;
}

export type BackupErrorCode = 'invalid-json' | 'wrong-app' | 'future-version' | 'invalid-data' | 'invalid-date';
export type BackupResult = { ok: true; backup: BackupEnvelope } | { ok: false; error: BackupErrorCode };

export function exportBackup(data: AppData, now: Date = new Date()): BackupEnvelope {
  return { app: 'fitfood', schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: now.toISOString(), data };
}

export function getBackupFilename(now: Date = new Date()): string {
  const date = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  return `fitfood-backup-${date}.json`;
}

export function parseBackup(text: string): BackupResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid-json' };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'invalid-data' };
  }
  const envelope = parsed as Record<string, unknown>;
  if (envelope.app !== 'fitfood') return { ok: false, error: 'wrong-app' };
  if (typeof envelope.schemaVersion !== 'number' || !Number.isInteger(envelope.schemaVersion) || envelope.schemaVersion < 1) {
    return { ok: false, error: 'invalid-data' };
  }
  if (envelope.schemaVersion > CURRENT_SCHEMA_VERSION) return { ok: false, error: 'future-version' };
  if (
    typeof envelope.exportedAt !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(envelope.exportedAt) ||
    !Number.isFinite(Date.parse(envelope.exportedAt))
  ) return { ok: false, error: 'invalid-date' };

  try {
    // Storage and import share the same migration and validation pipeline.
    const data = normalizeAppData(envelope.data);
    return {
      ok: true,
      backup: { app: 'fitfood', schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: envelope.exportedAt, data },
    };
  } catch (error) {
    return { ok: false, error: error instanceof UnsupportedDataVersionError ? 'future-version' : 'invalid-data' };
  }
}
