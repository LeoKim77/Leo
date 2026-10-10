// 화웅 금병법〈신무〉 · approx
// 원문: 자신의 추격 전법 발동 성공 후, 16% 확률로 2턴 동안 능력 소진 효과로부터 면역된다.
// 원문 절 구현: approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-hua-xiong-1",
  generalId: "hua-xiong",
  name: "신무",
  status: "approx",
  note: "추격 전법 발동 후 16% 확률로 2턴 동안 침묵 면역(능력 소진 = 침묵으로 잠정 — 장군의 무용 자신 침묵이 풀린다)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "능력 소진(상태 정의 미상) — 미지원 유지"
    },
    {
      "date": "2026-10-05",
      "note": "'능력 소진' = 침묵으로 잠정 — 장군의 무용의 자신 침묵. 추격 발동 성공 후 16%로 2턴 침묵 면역(FEAT-026)"
    }
  ],
  clauses: [
    {
      "text": "자신의 추격 전법 발동 성공 후, 16% 확률로 2턴 동안 능력 소진 효과로부터 면역된다",
      "status": "approx"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "cast",
          "castType": "추격",
          "role": "self",
          "chance": 0.16
        },
        "effects": {
          "statusEffects": [
            {
              "name": "침묵 면역",
              "target": "self",
              "duration": 2
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      // 「자신의 추격 전법 발동 성공 후, 16% 확률로 2턴 동안 능력 소진 효과로부터 면역된다」 — 능력 소진 = 침묵(잠정)
      c.status(0);
    },
  ],
});
