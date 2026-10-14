import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const DATA = join(ROOT, 'data');
export const SOURCES = join(DATA, 'sources');
export const KR = join(DATA, 'kr');

export function ensureDir(p: string) {
  mkdirSync(p, { recursive: true });
}

/** 사람이 diff 로 읽기 좋게 2칸 들여쓰기 + 마지막 줄바꿈 */
export function writeJson(path: string, value: unknown) {
  ensureDir(dirname(path));
  writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
}

export function readJson<T = any>(path: string, fallback?: T): T {
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`파일 없음: ${path}`);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}
