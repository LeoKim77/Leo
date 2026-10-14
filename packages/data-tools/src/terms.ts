// 해외(중국·대만)·deck-lab 표기 → 한국판 게임 용어
import type { TermMapping } from '../../engine/src/model.ts';

/** 마지막 글자에 받침이 있는가 (한글이 아니면 null) */
function hasBatchim(word: string): boolean | null {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return null;
  return (c - 0xac00) % 28 !== 0;
}
const JOSA: Array<[string, string]> = [['이', '가'], ['은', '는'], ['을', '를'], ['과', '와'], ['으로', '로']];

/** 바뀐 단어 뒤 조사를 받침에 맞춘다: 회피가 → 피신이 */
function fixJosa(text: string, word: string): string {
  const b = hasBatchim(word);
  if (b == null) return text;
  let out = text;
  for (const [withB, noB] of JOSA) {
    const want = b ? withB : noB;
    for (const cand of [withB, noB]) {
      if (cand === want) continue;
      // 바로 뒤 조사만 바꾼다 (뒤가 한글이 아닌 경계일 때)
      out = out.replace(new RegExp(`${word}${cand}(?![가-힣])`, 'g'), `${word}${want}`);
    }
  }
  return out;
}

export function normalizeKo(text: string, map: TermMapping[]): { text: string; replaced: Array<{ from: string; to: string }>; review: Array<{ term: string; note?: string }> } {
  const auto = map.filter(m => m.from !== m.to && (m as any).autoReplace !== false).sort((a, b) => b.from.length - a.from.length);
  const replaced: Array<{ from: string; to: string }> = [];
  let out = text;
  for (const m of auto) {
    if (!out.includes(m.from)) continue;
    out = fixJosa(out.split(m.from).join(m.to), m.to);
    replaced.push({ from: m.from, to: m.to });
  }
  const review = map.filter(m => (m as any).autoReplace === false && out.includes(m.from)).map(m => ({ term: m.from, note: m.note }));
  return { text: out, replaced, review };
}
