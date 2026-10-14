// 장량 금병법〈태평도법〉 · approx
// 원문: 고유 전법 괴술, 회유 및 피신 확률 8% 증가, 1번째 턴에 괴술 발동 후 랜덤 적군 1명이 1턴 동안 능력 소진된다.
// 원문 절 구현: note / ok / approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhang-liang-1",
  generalId: "zhang-liang",
  name: "태평도법",
  status: "approx",
  note: "괴술 회유·피신 +8%. 1번째 턴 괴술 발동 후 랜덤 적군 1명 1턴 '능력 소진'(= 침묵으로 잠정, 설계서 질문)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 능력 소진(상태 정의 미상) 미반영"
    },
    {
      "date": "2026-10-05",
      "note": "'능력 소진' = 침묵으로 잠정(사용자 캡처: 괴술·장군의 무용) — 1번째 턴 괴술 발동 후 랜덤 적 1명 침묵 1턴"
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
      "status": "approx"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "castSkill": "unique",
          "role": "self",
          "chance": 1
        },
        "effects": {
          "statusEffects": [
            {
              "name": "침묵",
              "target": "random_enemy_1",
              "duration": 1
            }
          ]
        }
      }
    ],
    "static": {
      "mods": {
        "회유": 0.08,
        "피신": 0.08
      }
    }
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      // 「1번째 턴에 괴술 발동 후 랜덤 적군 1명이 1턴 동안 능력 소진된다」 — 능력 소진 = 침묵(잠정)
      if (c.turn !== 1) return;
      c.status(0);
    },
  ],
});
