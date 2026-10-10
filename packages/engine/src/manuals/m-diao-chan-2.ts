// 초선 금병법〈화수〉 · ok
// 원문: 매 턴 종료 시, 1턴 동안 무력이 가장 높은 우군의 연타율이 30% 증가한다.
// 원문 절 구현: ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-diao-chan-2",
  generalId: "diao-chan",
  name: "화수",
  status: "ok",
  note: "턴 종료 시 부여, 보유자 다음 행동 1번 동안 유지(R-025)",
  revised: [
    {
      "date": "2026-10-05",
      "note": "턴 종료 시 1턴 = 보유자 다음 행동 1번(R-025 보유자 기준 지속) — 지속 2 → 1"
    }
  ],
  clauses: [
    {
      "text": "매 턴 종료 시, 1턴 동안 무력이 가장 높은 우군의 연타율이 30% 증가한다",
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
              "stat": "연타확률",
              "min": 0.3,
              "max": 0.3,
              "target": "highest_power_ally",
              "duration": 1,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnEnd"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnEnd
    (c) => {
      c.buff(0);   // 연타확률 +30%, 대상 highest_power_ally, 1턴, 최대 1중첩
    },
  ],
});
