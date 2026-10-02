import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// standalone 모드: JS·CSS·워커를 한 HTML 에 넣는다 (claude.ai 아티팩트 · 로컬 파일 실행용).
// 데이터 JSON 은 build-standalone.ts 가 <script type="application/json"> 으로 끼워 넣는다.
export default defineConfig(({ mode }) => ({
  base: './',
  // 단일 파일은 일반(classic) 워커 — 로컬 파일(file://)에서도 뜬다
  worker: { format: mode === 'standalone' ? 'iife' : 'es' },
  server: { host: true, port: 5173 },
  plugins: mode === 'standalone' ? [viteSingleFile()] : [],
  build: mode === 'standalone' ? { outDir: 'dist-standalone', emptyOutDir: true, copyPublicDir: false } : {},
}));
