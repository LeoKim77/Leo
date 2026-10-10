// 황개 금병법〈견결〉 · ok
// 원문: 자신이 우군의 피해를 받은 후, 2턴 동안 자신이 받는 피해가 12% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-huang-gai-1",
  generalId: "huang-gai",
  name: "견결",
  status: "ok",
  note: "우군에게 피해를 받은 뒤(고육지계 자해 등) 2턴 동안 받는 피해 −12%",
  revised: [
    {
      "date": "2026-10-05",
      "note": "미지원 → 구현: '우군의 피해를 받은 후' = 우군이 준 피해(고육지계: 지력 최고 우군이 황개에게 60% 병기 피해)를 받은 뒤 (trigger.fromAlly)"
    }
  ],
  clauses: [
    {
      "text": "자신이 우군의 피해를 받은 후, 2턴 동안 자신이 받는 피해가 12% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "fromAlly": true
        },
        "effects": {
          "buffs": [
            {
              "stat": "받는피해",
              "min": -0.12,
              "max": -0.12,
              "target": "self",
              "duration": 2,
              "maxStacks": 1
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 damage
    (c) => {
      // 「자신이 우군의 피해를 받은 후」 (trigger.fromAlly — 고육지계: 지력 최고 우군이 황개에게 60% 병기 피해)
      // 「2턴 동안 자신이 받는 피해가 12% 감소한다」
      c.buff(0);
    },
  ],
});
