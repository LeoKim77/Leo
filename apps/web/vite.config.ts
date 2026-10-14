import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// standalone 모드: JS·CSS·워커를 한 HTML 에 넣는다 (claude.ai 아티팩트 · 로컬 파일 실행용).
// 데이터 JSON 은 build-standalone.ts 가 <script type="application/json"> 으로 끼워 넣는다.
// server 모드(build:public, OPS15): 공개 서비스용 — 엔진·전법 정의는 빌드에 넣지 않는다.
//   sim-client.ts → sim-client-server.ts (서버 /api/compute 호출), 정적 파일은 public-server(공개 카탈로그)만, 소스맵 없음.
export default defineConfig(({ mode }) => ({
  base: mode === 'server' ? '/' : './',
  define: { __SERVER_ENGINE__: JSON.stringify(mode === 'server') },
  resolve: mode === 'server' ? { alias: [{ find: /^(.*)\/sim-client\.ts$/, replacement: '$1/sim-client-server.ts' }] } : {},
  publicDir: mode === 'server' ? 'public-server' : 'public',
  // 단일 파일은 일반(classic) 워커 — 로컬 파일(file://)에서도 뜬다
  worker: { format: mode === 'standalone' ? 'iife' : 'es' },
  server: { host: true, port: 5173 },
  plugins: mode === 'standalone' ? [viteSingleFile()] : [],
  build: mode === 'standalone' ? { outDir: 'dist-standalone', emptyOutDir: true, copyPublicDir: false }
    : mode === 'server' ? { outDir: 'dist-public', emptyOutDir: true, sourcemap: false, minify: 'esbuild' } : {},
}));
