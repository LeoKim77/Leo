// 기획 플랫폼(data/design) 무결성
import { describe, it, expect } from 'vitest';
import { designCategories, designSpec, designPosts, SPEC_STATUS, POST_TYPES, POST_STATUS } from '../packages/data-tools/src/design.ts';
import { renderRulesMarkdown } from '../packages/data-tools/src/build-design.ts';
import { readJson } from '../packages/data-tools/src/paths.ts';

const cats = new Set(designCategories().map(c => c.id));
const spec = designSpec();
const posts = designPosts();
const rules = new Set(readJson<any>('data/common/confirmed-rules.json').rules.map((r: any) => r.id));

describe('기획 플랫폼', () => {
  it('규정 id 는 겹치지 않고, 카테고리·상태·근거 규칙이 유효하다', () => {
    const ids = spec.map(s => s.id);
    expect(ids.length).toBe(new Set(ids).size);
    expect(spec.filter(s => !cats.has(s.cat)).map(s => s.id)).toEqual([]);
    expect(spec.filter(s => !(SPEC_STATUS as readonly string[]).includes(s.status)).map(s => s.id)).toEqual([]);
    expect(spec.flatMap(s => (s.basis || []).filter((r: string) => !rules.has(r)).map((r: string) => `${s.id}→${r}`))).toEqual([]);
  });
  it('게시글은 유효한 카테고리·종류·상태이고, 관련 규정·규칙이 실제로 있다', () => {
    const specIds = new Set(spec.map(s => s.id));
    const bad = posts.flatMap(p => [
      !cats.has(p.cat) && `${p.id} 카테고리 ${p.cat}`,
      !(POST_TYPES as readonly string[]).includes(p.type) && `${p.id} 종류 ${p.type}`,
      !(POST_STATUS as readonly string[]).includes(p.status) && `${p.id} 상태 ${p.status}`,
      ...(p.specIds || []).filter((i: string) => !specIds.has(i)).map((i: string) => `${p.id} 규정 ${i}`),
      ...(p.rules || []).filter((r: string) => !rules.has(r)).map((r: string) => `${p.id} 규칙 ${r}`),
    ].filter(Boolean));
    expect(bad).toEqual([]);
  });
  it('docs/COMMON_RULES.md 는 규정에서 만든 사본과 같다 (pnpm build:design)', async () => {
    const { readFileSync } = await import('node:fs');
    expect(readFileSync('docs/COMMON_RULES.md', 'utf8')).toBe(renderRulesMarkdown(designCategories(), spec) + '\n');
  });
});
