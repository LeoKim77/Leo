// Web Worker 호출을 Promise 로 감싼다
import { app } from './state.ts';

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void; onProgress?: (d: number, t: number) => void }>();

function ensure() {
  if (worker) return worker;
  worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (ev) => {
    const { id, type } = ev.data;
    const p = pending.get(id);
    if (!p) return;
    if (type === 'progress') p.onProgress?.(ev.data.done, ev.data.total);
    else if (type === 'result') { pending.delete(id); p.resolve(ev.data.result); }
    else if (type === 'error') { pending.delete(id); p.reject(new Error(ev.data.error)); }
  };
  worker.postMessage({ type: 'init', bundle: app.bundle });
  return worker;
}

export function call<T = any>(msg: Record<string, unknown>, onProgress?: (d: number, t: number) => void): Promise<T> {
  const w = ensure();
  const id = ++seq;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress });
    w.postMessage({ ...msg, id });
  });
}
