// 장량 금병법〈태평도법〉 · approx
// 원문: 고유 전법 괴술, 회유 및 피신 확률 8% 증가, 1번째 턴에 괴술 발동 후 랜덤 적군 1명이 1턴 동안 능력 소진된다.
// 원문 절 구현: note / ok / missing
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-liang-1",
  generalId: "zhang-liang",
  name: "태평도법",
  status: "approx",
  note: "\"1번째 턴 괴술 발동 후 랜덤 적 1명 능력 소진\"은 미지원",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 능력 소진(상태 정의 미상) 미반영"
    }
  ],
  clauses: [
    {
      "text": "고유 전법 괴술",
      "status": "note"
    },
    {
      "text": "회유 및 피신 확률 8% 증가",
      "status": "ok"
    },
    {
      "text": "1번째 턴에 괴술 발동 후 랜덤 적군 1명이 1턴 동안 능력 소진된다",
      "status": "missing"
    }
  ],
  def: {
    "parts": [],
    "static": {
      "mods": {
        "회유": 0.08,
        "피신": 0.08
      }
    }
  },
});
