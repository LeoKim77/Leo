// 주태 금병법〈불굴〉 · ok
// 원문: 자신 및 같은 열의 랜덤 우군 단일 목표가 받는 병기 피해가 6% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhou-tai-1",
  generalId: "zhou-tai",
  name: "불굴",
  status: "ok",
  note: "자신 + 같은 열(전열/후열) 랜덤 우군 1명. 같은 열 우군이 없으면 자신만",
  clauses: [
    {
      "text": "자신 및 같은 열의 랜덤 우군 단일 목표가 받는 병기 피해가 6% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는병기피해",
              "min": -0.06,
              "max": -0.06,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            },
            {
              "stat": "받는병기피해",
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
        }
      }
    ]
  },
  runs: [
    // parts[0] — 시점 battleStart
    (c) => {
      c.buff(0);   // 받는병기피해 -6%, 대상 self, 전투 종료까지, 최대 1중첩
      c.buff(1);   // 받는병기피해 -6%, 대상 random_same_row_ally, 전투 종료까지, 최대 1중첩
    },
  ],
});
