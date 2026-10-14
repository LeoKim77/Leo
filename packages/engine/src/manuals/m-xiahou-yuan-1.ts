// 하후연 금병법〈신속〉 · ok
// 원문: 회심 피해가 12% 증가(선공의 영향 받음)한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-xiahou-yuan-1",
  generalId: "xiahou-yuan",
  name: "신속",
  status: "ok",
  note: "회심 피해 +12%(선공 영향, 전투 시작 시 선공 기준)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "선공 영향 반영 — 고정 증감 → 전투 시작 버프(선공 영향)"
    }
  ],
  clauses: [
    {
      "text": "회심 피해가 12% 증가(선공의 영향 받음)한다",
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
              "stat": "회심피해",
              "min": 0.12,
              "max": 0.12,
              "target": "self",
              "duration": 999,
              "maxStacks": 1,
              "inf": {
                "stats": [
                  "선공"
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
      // 「회심 피해가 12% 증가(선공의 영향 받음)한다」
      c.buff(0);
    },
  ],
});
