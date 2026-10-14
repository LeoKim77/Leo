/// <reference types="vite/client" />
// 계산 요청을 Promise 로 감싼다. 워커는 HTML 에 함께 넣는다(inline) — 단일 파일·아티팩트에서도 동작.
import { app } from './state.ts';
import InlineWorker from './worker.ts?worker&inline';

let worker: Worker | null = null;
let fallback = false;
let seq = 0;
const pending = new Map<number, { resolve: (v: any) => void; reject: (e: Error) => void; onProgress?: (d: number, t: number) => void; msg: Record<string, unknown> }>();

function onMessage(data: any) {
  const { id, type } = data;
  const p = pending.get(id);
  if (!p) return;
  if (type === 'progress') p.onProgress?.(data.done, data.total);
  else if (type === 'result') { pending.delete(id); p.resolve(data.result); }
  else if (type === 'error') { pending.delete(id); p.reject(new Error(data.error)); }
}

function ensure() {
  if (worker || fallback) return;
  try {
    const w = new InlineWorker();
    w.onmessage = ev => onMessage(ev.data);
    // 워커가 뜨지 못하면(로컬 파일·보안 정책) 메인 스레드로 바꿔 남은 요청을 다시 보낸다
    w.onerror = (ev) => {
      console.warn('계산 워커를 쓸 수 없어 메인 스레드에서 계산합니다.', (ev as ErrorEvent).message);
      ev.preventDefault?.();
      w.terminate(); worker = null; fallback = true;
      for (const [id, p] of pending) runMain(id, p.msg);
    };
    w.postMessage({ type: 'init', bundle: app.bundle });
    worker = w;
  } catch {
    fallback = true;   // 워커를 만들 수 없는 환경 → 메인 스레드에서 계산
  }
}

export function call<T = any>(msg: Record<string, unknown>, onProgress?: (d: number, t: number) => void): Promise<T> {
  ensure();
  const id = ++seq;
  return new Promise<T>((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress, msg });
    if (worker) { worker.postMessage({ ...msg, id }); return; }
    runMain(id, msg);
  });
}

let mainReady = false;
/** 메인 스레드 실행: 화면이 한 번 그려진 뒤 계산한다 */
function runMain(id: number, msg: Record<string, unknown>) {
  setTimeout(async () => {
    const { handle } = await import('./compute.ts');
    if (!mainReady) { handle({ type: 'init', bundle: app.bundle } as any, () => {}); mainReady = true; }
    handle({ ...msg, id } as any, onMessage);
  }, 30);
}
