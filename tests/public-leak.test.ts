// OPS15 엔진 보호 — 공개 서비스로 나가는 것(브라우저 JS·공개 카탈로그·검증 요청·API 응답)에 엔진 값이 없는지
//   사용자 지정 2026-10-14: "우리 시뮬 서버는 절대 전투 엔진 값이 외부 유출되지 않도록. 개발자 모드로 봐도 없도록"
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { publicCatalog } from '../packages/data-tools/src/public-bundle.ts';
import { buildPublicRequests, REQUEST_FORBIDDEN } from '../packages/data-tools/src/missions-public.ts';

/** 엔진 코드·정의·계수에만 있는 표식 */
const ENGINE_MARKERS = ['ENGINE_FIXES', 'statScaleWeight', 'infMult', 'attachInfluences', 'applyInfluenceWeights', 'createLegacyEngine', 'calcDamage', 'DEFAULT_COEFFS',
  'kDefIntel', 'legacyId', 'partRuns', 'influenceWeights', 'engineGenerals', 'authoredNote', 'uniqueProcAddDelta', 'monteCarlo', 'defineSkill', 'Recommender'];
const ENGINE_KEYS = ['"engine":', '"effects":', '"impl":', '"note":', '"parts":', '"run":', '"coeffs":'];

const WEB = join(import.meta.dirname, '..', 'apps', 'web');
let built = '';
beforeAll(() => {
  execSync('pnpm --filter @cheonha/web build:public', { cwd: join(import.meta.dirname, '..'), stdio: 'ignore' });
  const dir = join(WEB, 'dist-public', 'assets');
  built = readdirSync(dir).map(f => readFileSync(join(dir, f), 'utf8')).join('\n');
}, 120_000);

describe('엔진 보호 (OPS15)', () => {
  it('공개 빌드 JS 에 엔진 코드가 없다 (개발자 도구로 받아 봐도)', () => {
    for (const m of ENGINE_MARKERS) expect(built.includes(m), m).toBe(false);
    expect(built.length).toBeLessThan(200_000);   // 엔진이 들어가면 수 MB
  });
  it('공개 빌드에 소스맵·전체 번들(bundle.json)·감사 결과가 없다', () => {
    const files = readdirSync(join(WEB, 'dist-public', 'assets')).concat(readdirSync(join(WEB, 'dist-public', 'data')));
    expect(files.some(f => f.endsWith('.map'))).toBe(false);
    expect(files).not.toContain('bundle.json');
    expect(files).not.toContain('audit.json');
    expect(existsSync(join(WEB, 'dist-public', 'data', 'catalog.json'))).toBe(true);
  });
  it('공개 카탈로그에는 표시용 게임 정보만 — 엔진 정의·계수·해석 메모 없음', () => {
    const s = JSON.stringify(publicCatalog());
    for (const m of [...ENGINE_MARKERS, ...ENGINE_KEYS]) expect(s.includes(m), m).toBe(false);
  });
  it('시뮬서 검증 요청(공개본)에는 공식·가중치·계수·규정 번호가 없다', () => {
    const s = JSON.stringify(buildPublicRequests());
    for (const re of REQUEST_FORBIDDEN) expect(re.test(s), String(re)).toBe(false);
  });
  it('API 응답: 인게임 전보 문구·툴팁 값만, 감사·계산 줄과 내부 필드 없음', async () => {
    const { compute } = await import('../apps/web/server/core.ts');
    const deck = (ids: string[]) => ({ formation: '기형진', units: ids.map(id => ({ generalId: id, skillIds: [] })) });
    const a = deck(['cao-cao', 'xun-yu', 'guo-jia']), b = deck(['liu-bei', 'guan-yu', 'zhang-fei']);
    const battle = await compute({ type: 'battle', a, b, seed: 'leak#1' }, 'test', {});
    const mc = await compute({ type: 'mc', a, b, runs: 5, seed: 'leak' }, 'test', {});
    expect(battle.status).toBe(200); expect(mc.status).toBe(200);
    const s = JSON.stringify([battle.body, mc.body]);
    for (const m of [...ENGINE_MARKERS, '"trace"', '"audit"', '[계산]', '[상태]', '[스택]', '치유율 ', '시전자 지력', '"dmgDealt"']) expect(s.includes(m), m).toBe(false);
    expect(Object.keys(battle.body).sort()).toEqual(['approx', 'lineSnaps', 'log', 'rounds', 'troopHistory', 'turns', 'units', 'winner']);
    expect(battle.body.log.length).toBe(battle.body.lineSnaps.length);
  });
  it('잘못된 요청·내부 오류에는 일반 문구만', async () => {
    const { compute } = await import('../apps/web/server/core.ts');
    const r = await compute({ type: 'mc', a: { units: [{ generalId: '../../etc' }] }, b: {} }, 'test2', {});
    expect(r.status).toBe(400);
    expect((await compute({ type: 'audit' }, 'test2', {})).status).toBe(400);   // 감사·검증 계획은 공개 API 에 없다
  });
});
