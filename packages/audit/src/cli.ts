// pnpm audit — 전체 감사를 돌리고 결과를 저장한다.
//   data/audit/latest.json            전체 결과 (Git 에 남겨 버전별 비교)
//   apps/web/public/data/audit.json   웹 화면용 사본
// 옵션: --quick (표본 축소), --skill <id> (단건)
import { join } from 'node:path';
import { buildBundle } from '../../data-tools/src/bundle.ts';
import { ROOT, DATA, writeJson } from '../../data-tools/src/paths.ts';
import { runAudit } from './index.ts';

const args = process.argv.slice(2);
const quick = args.includes('--quick');
const skillArg = args.includes('--skill') ? args[args.indexOf('--skill') + 1] : undefined;

const bundle = buildBundle();
const t0 = Date.now();
const report = runAudit(bundle, {
  tierSeeds: quick ? 4 : 16,
  extraSeeds: quick ? 8 : 30,
  onlySkillIds: skillArg ? [skillArg] : undefined,
  onProgress: (d, t) => { if (process.stdout.isTTY) process.stdout.write(`\r감사 전투 ${d}/${t}`); },
});
if (process.stdout.isTTY) process.stdout.write('\n');

if (!skillArg) {
  writeJson(join(DATA, 'audit', 'latest.json'), report);
  writeJson(join(ROOT, 'apps', 'web', 'public', 'data', 'audit.json'), report);
}

const s = report.summary;
console.log(`감사 완료 (${((Date.now() - t0) / 1000).toFixed(1)}초, 전투 ${report.battles}판)`);
console.log(`  통과 ${s.pass} · 경고 ${s.warn} · 실패 ${s.fail} · 생략 ${s.skip}`);
console.log('  규칙별:');
for (const r of report.ruleSummary) console.log(`    ${r.rule.padEnd(14)} ${r.title.padEnd(28)} 통과 ${r.pass} / 경고 ${r.warn} / 실패 ${r.fail} / 생략 ${r.skip}`);
console.log('  엔진 규칙:');
for (const r of report.engineRules) console.log(`    [${r.level}] ${r.title} — ${r.message}${r.evidence?.length ? '\n        ' + r.evidence.slice(0, 2).join('\n        ') : ''}`);
if (skillArg) for (const sk of report.skills) {
  console.log(`\n${sk.name} (${sk.kind})`);
  for (const c of sk.checks) console.log(`  [${c.level}] ${c.title}: ${c.message}${c.evidence?.length ? '\n      ' + c.evidence.join('\n      ') : ''}`);
}
