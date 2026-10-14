// 공개 서비스용 계산 요청 (OPS15 엔진 보호) — build:public 빌드에서 sim-client.ts 대신 쓰인다(vite alias).
//   브라우저에는 엔진이 없다. 편성만 서버(/api/compute)로 보내고 결과·인게임 전보만 받는다.
export function call<T = any>(msg: Record<string, unknown>, onProgress?: (d: number, t: number) => void): Promise<T> {
  onProgress?.(0, 1);
  return fetch('/api/compute', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(msg), credentials: 'same-origin' })
    .then(async r => {
      const body = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(body?.error || `요청 실패 (${r.status})`);
      onProgress?.(1, 1);
      return body as T;
    });
}
