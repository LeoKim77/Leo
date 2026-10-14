// 계정·포인트·호출 제한 (OPS2·OPS3·OPS15)
//   Supabase 연결 전(계정 준비 전): 로그인 없음, 포인트 차감 없이 통과, 호출 제한은 메모리.
//   연결 뒤: SUPABASE_URL·SUPABASE_SERVICE_ROLE_KEY 환경 변수 → 로그인 토큰 확인, 포인트 원장 차감, DB 기반 호출 제한.

export interface Account { id: string; points: number }

/** 요청 헤더의 로그인 토큰 → 계정 (연결 전에는 항상 null) */
export async function getAccount(_headers: Record<string, string | undefined>): Promise<Account | null> {
  if (!process.env.SUPABASE_URL) return null;
  // TODO(OPS2): Authorization: Bearer <supabase access token> → auth.getUser → accounts 테이블
  return null;
}

/** 시뮬 실행 버튼 1번 = 100P (OPS3). 잔액이 모자라면 false */
export async function chargePoints(acct: Account | null, _what: 'sim'): Promise<boolean> {
  if (!acct) return true;   // 계정 연결 전·비로그인 베타: 차감 없음
  // TODO(OPS3): points_ledger 에 -100 기록(트랜잭션), 잔액 < 100 이면 false
  return acct.points >= 100;
}

// 호출 제한: 결과를 대량으로 뽑아 계수를 역산하는 것을 늦춘다 (분당 sim 20회, 추천 4회)
const LIMIT = { sim: 20, recommend: 4 } as const;
const hits = new Map<string, number[]>();
export function checkRate(who: string, kind: keyof typeof LIMIT): boolean {
  const now = Date.now(), key = `${kind}:${who}`;
  const list = (hits.get(key) || []).filter(t => now - t < 60_000);
  if (list.length >= LIMIT[kind]) { hits.set(key, list); return false; }
  list.push(now); hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < 60_000)) hits.delete(k);
  return true;
}
