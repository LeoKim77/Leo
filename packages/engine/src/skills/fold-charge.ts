// 침략방어 · 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안, 아군 무작위 2명이 받는 피해가 24% 감소합니다(지력의 영향을 받음). 또한 4턴 시작 시, 아군 전체의 병력을 회복합니다. 치료율: 360%(지력의 영향을 받음).
// 원문 절 구현: ok / approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "fold-charge",
  name: "침략방어",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "피해 감소의 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안",
      "status": "ok"
    },
    {
      "text": "아군 무작위 2명이 받는 피해가 24% 감소합니다(지력의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "또한 4턴 시작 시, 아군 전체의 병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율: 360%(지력의 영향을 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_n",
          "duration": 3,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnStart",
        "onlyTurns": [
          4
        ],
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 3.6,
              "max": 3.6,
              "target": "all_ally"
            }
          ],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "피해 감소의 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -24%, 대상 random_ally_n, 3턴, 최대 1중첩
  },
});
