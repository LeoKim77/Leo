// 기선제압 · 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안, 적군 중 무력이 가장 높은 단일 대상이 가하는 병기 피해가 25% 감소합니다(통솔의 영향을 받음). 또한 적군 중 지력이 가장 높은 단일 대상이 가하는 책략 피해가 25% 감소합니다(통솔의 영향을 받음).
// 원문 절 구현: ok / approx / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "blunt-edge",
  name: "기선제압",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "통솔 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안",
      "status": "ok"
    },
    {
      "text": "적군 중 무력이 가장 높은 단일 대상이 가하는 병기 피해가 25% 감소합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "또한 적군 중 지력이 가장 높은 단일 대상이 가하는 책략 피해가 25% 감소합니다(통솔의 영향을 받음)",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는병기피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_power_enemy",
          "duration": 3,
          "maxStacks": 1
        },
        {
          "stat": "주는책략피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_intel_enemy",
          "duration": 3,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "통솔 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는병기피해 -25%, 대상 highest_power_enemy, 3턴, 최대 1중첩
    c.buff(1);   // 주는책략피해 -25%, 대상 highest_intel_enemy, 3턴, 최대 1중첩
  },
});
