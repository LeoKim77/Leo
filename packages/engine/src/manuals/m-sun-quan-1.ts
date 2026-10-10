// 손권 금병법〈동관한기〉 · ok
// 원문: 자신의 액티브 전법 발동 후, 2턴 동안 전체 아군이 받는 피해가 5% 감소한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-sun-quan-1",
  generalId: "sun-quan",
  name: "동관한기",
  status: "ok",
  clauses: [
    {
      "text": "자신의 액티브 전법 발동 후, 2턴 동안 전체 아군이 받는 피해가 5% 감소한다",
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
              "stat": "받는피해",
              "min": -0.05,
              "max": -0.05,
              "target": "all_ally",
              "duration": 2,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "cast",
          "castType": "액티브",
          "role": "self",
          "chance": 1,
          "maxPerTurn": 9
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 cast
    (c) => {
      c.buff(0);   // 받는피해 -5%, 대상 all_ally, 2턴, 최대 1중첩
    },
  ],
});
