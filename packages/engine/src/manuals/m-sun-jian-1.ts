// 손견 금병법〈무열〉 · ok
// 원문: 자신이 받는 병기 피해가 8% 감소(통솔의 영향 받음)한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-jian-1",
  generalId: "sun-jian",
  name: "무열",
  status: "ok",
  note: "받는 병기 피해 −8%(통솔 영향, 전투 시작 시 통솔 기준)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "통솔 영향 반영 — 고정 증감 → 전투 시작 버프(통솔 영향)"
    }
  ],
  clauses: [
    {
      "text": "자신이 받는 병기 피해가 8% 감소(통솔의 영향 받음)한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "buffs": [
            {
              "stat": "받는병기피해",
              "min": -0.08,
              "max": -0.08,
              "target": "self",
              "duration": 999,
              "maxStacks": 1,
              "inf": {
                "stats": [
                  "통솔"
                ],
                "who": "self"
              }
            }
          ]
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      // 「자신이 받는 병기 피해가 8% 감소(통솔의 영향 받음)한다」
      c.buff(0);
    },
  ],
});
