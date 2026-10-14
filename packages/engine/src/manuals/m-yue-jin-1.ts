// 악진 금병법〈동등〉 · ok
// 원문: 자신 및 같은 열의 랜덤 우군 단일 목표가 받는 책략 피해가 6%감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-yue-jin-1",
  generalId: "yue-jin",
  name: "동등",
  status: "ok",
  note: "자신 + 같은 열(전열/후열) 랜덤 우군 1명 (FEAT-011 대상)",
  clauses: [
    {
      "text": "자신 및 같은 열의 랜덤 우군 단일 목표가 받는 책략 피해가 6%감소한다",
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
              "stat": "받는책략피해",
              "min": -0.06,
              "max": -0.06,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            },
            {
              "stat": "받는책략피해",
              "min": -0.06,
              "max": -0.06,
              "target": "random_same_row_ally",
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
      c.buff(0);   // 받는책략피해 -6%, 대상 self, 전투 종료까지, 최대 1중첩
      c.buff(1);   // 받는책략피해 -6%, 대상 random_same_row_ally, 전투 종료까지, 최대 1중첩
    },
  ],
});
