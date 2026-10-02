// Web Worker 진입점 — 계산은 compute.ts
import { handle } from './compute.ts';
self.onmessage = (ev: MessageEvent) => handle(ev.data, msg => (self as any).postMessage(msg));
