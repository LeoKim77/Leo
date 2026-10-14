// 동탁 금병법〈왕신〉 · ok
// 원문: 통솔이 30포인트 증가하고, 고유 전법 압도적 권력의 탈취 수치가 60% 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-dong-zhuo-1",
  generalId: "dong-zhuo",
  name: "왕신",
  status: "ok",
  note: "압도적 권력 탈취량 20 → 32(+60%) — 적군·우군 탈취와 자신 통솔 증가 모두",
  revised: [
    {
      "date": "2026-10-05",
      "note": "탈취 +60%를 적군·우군 탈취 둘 다(20→32)와 자신 증가분에 반영 — 예전엔 적군 탈취만"
    }
  ],
  clauses: [
    {
      "text": "통솔이 30포인트 증가하고",
      "status": "ok"
    },
    {
      "text": "고유 전법 압도적 권력의 탈취 수치가 60% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "stats": {
        "통솔": 30
      }
    },
    "uniquePatch": {
      "effects.statMods.0.min": -32,
      "effects.statMods.0.max": -32,
      "effects.statMods.1.min": -32,
      "effects.statMods.1.max": -32
    }
  },
});
