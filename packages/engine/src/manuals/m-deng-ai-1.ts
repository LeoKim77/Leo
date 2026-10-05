// 등애 금병법〈제하론〉 · ok
// 원문: 매 턴 시작 시, 우군 2명의 방어 관통과 간파가 3% 증가하며, 전투 종료까지 지속되며, 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-deng-ai-1",
  generalId: "deng-ai",
  name: "제하론",
  status: "ok",
  clauses: [
    {
      "text": "매 턴 시작 시, 우군 2명의 방어 관통과 간파가 3% 증가하며",
      "status": "ok"
    },
    {
      "text": "전투 종료까지 지속되며",
      "status": "ok"
    },
    {
      "text": "중첩될 수 있다",
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
              "stat": "방어관통",
              "min": 0.03,
              "max": 0.03,
              "target": "random_ally_n",
              "duration": 999,
              "maxStacks": 8
            },
            {
              "stat": "간파",
              "min": 0.03,
              "max": 0.03,
              "target": "random_ally_n",
              "duration": 999,
              "maxStacks": 8
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.buff(0);   // 방어관통 +3%, 대상 random_ally_n, 전투 종료까지, 최대 8중첩
      c.buff(1);   // 간파 +3%, 대상 random_ally_n, 전투 종료까지, 최대 8중첩
    },
  ],
});
