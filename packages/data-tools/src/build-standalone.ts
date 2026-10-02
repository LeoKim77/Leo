// 단일 HTML 만들기 — 앱(JS·CSS·워커)에 데이터 JSON 을 끼워 넣는다.
//   dist-standalone/cheonha-lab.html           로컬에서 더블클릭으로 여는 파일
//   dist-standalone/cheonha-lab.artifact.html  claude.ai 아티팩트용 (문서 뼈대 태그 없이 내용만)
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './paths.ts';

const web = join(ROOT, 'apps', 'web');
const html = readFileSync(join(web, 'dist-standalone', 'index.html'), 'utf8');
const data = (f: string) => JSON.stringify(JSON.parse(readFileSync(join(web, 'public', 'data', f), 'utf8')));   // 공백 제거
// JSON 안의 "</script" 가 태그를 닫지 않게 한다
const tag = (id: string, json: string) => `<script type="application/json" id="${id}">${json.replace(/<\//g, '<\\/')}</script>`;
const blobs = [tag('cheonha-bundle', data('bundle.json')), tag('cheonha-audit', data('audit.json')), tag('cheonha-decklab', data('reference-decklab.json'))].join('\n');

// 데이터는 앱 스크립트보다 앞에 둔다
const full = html.replace(/<script type="module"/, `${blobs}\n<script type="module"`);
writeFileSync(join(web, 'dist-standalone', 'cheonha-lab.html'), full);

// 아티팩트: <!doctype>/<html>/<head>/<body> 를 벗기고 title·meta·link·style·script·본문만
const head = full.match(/<head>([\s\S]*?)<\/head>/)![1].replace(/<meta charset[^>]*>|<meta name="viewport"[^>]*>/g, '');
const body = full.match(/<body>([\s\S]*?)<\/body>/)![1];
writeFileSync(join(web, 'dist-standalone', 'cheonha-lab.artifact.html'), `${head.trim()}\n${body.trim()}\n`);

const mb = (s: string) => (Buffer.byteLength(s) / 1024 / 1024).toFixed(2);
console.log(`단일 파일: ${mb(full)}MB (아티팩트용 동일 내용)`);
