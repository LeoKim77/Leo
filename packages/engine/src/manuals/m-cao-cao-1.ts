// 조조 금병법〈맹덕신서 상권〉 · ok
// 원문: 전체 아군의 액티브 전법 피해가 5% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cao-cao-1",
  generalId: "cao-cao",
  name: "맹덕신서 상권",
  status: "ok",
  clauses: [
    {
      "text": "전체 아군의 액티브 전법 피해가 5% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "주는액티브피해",
              "min": 0.05,
              "max": 0.05,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "battleStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.buff(0);   // 주는액티브피해 +5%, 대상 all_ally, 전투 종료까지, 최대 1중첩
    },
  ],
});
