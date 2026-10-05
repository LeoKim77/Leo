// 육손 금병법〈분영〉 · approx
// 원문: 자신의 심리 공격이 5% 증가한다. 연소 시전 시 1턴간 목표의 최고 속성이 5%(지력의 영향을 받음) 추가로 감소한다.
// 원문 절 구현: ok / missing
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lu-xun-2",
  generalId: "lu-xun",
  name: "분영",
  status: "approx",
  note: "심리 공격 +5%만 반영. 연소 상태가 엔진 미지원이라 \"연소 시 최고 속성 5% 추가 감소\"는 제외",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 연소 미지원 절만 근사"
    }
  ],
  clauses: [
    {
      "text": "자신의 심리 공격이 5% 증가한다",
      "status": "ok"
    },
    {
      "text": "연소 시전 시 1턴간 목표의 최고 속성이 5%(지력의 영향을 받음) 추가로 감소한다",
      "status": "missing"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "심리공격": 0.05
      }
    }
  },
});
