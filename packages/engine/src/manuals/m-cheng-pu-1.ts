// 정보 금병법〈호신〉 · approx
// 원문: 자신의 병력이 최초로 50% 미만이 되면 자신의 병력을 회복하며(치유율 200%, 지력과 통솔의 영향 받음), 받는 피해가 12% 감소한다.
// 원문 절 구현: approx / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-cheng-pu-1",
  generalId: "cheng-pu",
  name: "호신",
  status: "approx",
  note: "통솔 영향 미반영",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — 회복의 통솔 영향(두 스탯 가중치 미상)만 근사"
    }
  ],
  clauses: [
    {
      "text": "자신의 병력이 최초로 50% 미만이 되면 자신의 병력을 회복하며(치유율 200%, 지력과 통솔의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "받는 피해가 12% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 2,
              "max": 2,
              "target": "self"
            }
          ],
          "buffs": [
            {
              "stat": "받는피해",
              "min": -0.12,
              "max": -0.12,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "maxPerTurn": 1,
          "maxPerBattle": 1,
          "condition": {
            "type": "troopsBelow",
            "who": "self",
            "ratio": 0.5
          }
        }
      }
    ]
  },
  runs: [
    // parts[0] — 계기 damage
    (c) => {
      c.heal(0);   // 치유율 200%, 대상 self
      c.buff(0);   // 받는피해 -12%, 대상 self, 전투 종료까지, 최대 1중첩
    },
  ],
});
