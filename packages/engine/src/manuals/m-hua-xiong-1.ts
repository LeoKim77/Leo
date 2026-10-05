// 화웅 금병법〈신무〉 · unsupported
// 원문: 자신의 추격 전법 발동 성공 후, 16% 확률로 2턴 동안 능력 소진 효과로부터 면역된다.
// 원문 절 구현: missing
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-hua-xiong-1",
  generalId: "hua-xiong",
  name: "신무",
  status: "unsupported",
  note: "\"능력 소진 효과 면역\"은 미지원",
  revised: [
    {
      "date": "2026-10-05",
      "note": "능력 소진(상태 정의 미상) — 미지원 유지"
    }
  ],
  clauses: [
    {
      "text": "자신의 추격 전법 발동 성공 후, 16% 확률로 2턴 동안 능력 소진 효과로부터 면역된다",
      "status": "missing"
    }
  ],
  def: {
    "parts": []
  },
});
