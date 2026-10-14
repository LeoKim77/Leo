import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { normalizeKo } from '../packages/data-tools/src/terms.ts';
const map = JSON.parse(readFileSync('data/common/term-map.json', 'utf8')).mappings;

describe('한국판 용어 변환', () => {
  it('해외 표기를 바꾸고 조사를 받침에 맞춘다', () => {
    expect(normalizeKo('회피가 5% 증가', map).text).toBe('피신이 5% 증가');
    expect(normalizeKo('모략 피해를 준다', map).text).toBe('책략 피해를 준다');
    expect(normalizeKo('병인·모략 흡혈이 6% 증가', map).text).toBe('회유와 심리 공격이 6% 증가');
    expect(normalizeKo('능동 전법은', map).text).toBe('액티브 전법은');
  });
  it('자동 변환하지 않는 표현은 검토 목록으로', () => {
    const r = normalizeKo('아군 전체가 받는 피해 감소', map);
    expect(r.text).toContain('아군 전체');
    expect(r.review.map(x => x.term)).toContain('아군 전체');
  });
});
