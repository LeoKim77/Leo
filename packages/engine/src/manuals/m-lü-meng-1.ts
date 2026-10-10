// 여몽 금병법〈권학〉 · ok
// 원문: 자신이 받는 책략 피해가 6% 감소한다. 3번째 턴 종료 후, 자신의 지력이 30포인트 증가한다.
// 원문 절 구현: ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-lü-meng-1",
  generalId: "lü-meng",
  name: "권학",
  status: "ok",
  clauses: [
    {
      "text": "자신이 받는 책략 피해가 6% 감소한다",
      "status": "ok"
    },
    {
      "text": "3번째 턴 종료 후, 자신의 지력이 30포인트 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "지력",
              "min": 30,
              "max": 30,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnEnd",
        "onlyTurns": [
          3
        ]
      }
    ],
    "static": {
      "mods": {
        "받는책략피해": -0.06
      }
    }
  },
  runs: [
    // parts[0] — 시점 turnEnd
    (c) => {
      c.statMod(0);   // 지력 30, 대상 self, 전투 종료까지, 최대 1중첩
    },
  ],
});
