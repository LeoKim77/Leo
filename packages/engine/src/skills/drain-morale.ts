// 삼군 압도 · 전법 · 추격 55%
// 원문: 일반 공격 후 현재 대상의 무력·지력·통솔을 각각 30 감소시킵니다. 2턴 지속되며 최대 5회 중첩됩니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "drain-morale",
  name: "삼군 압도",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후 현재 대상의 무력·지력·통솔을 각각 30 감소시킵니다",
      "status": "ok"
    },
    {
      "text": "2턴 지속되며 최대 5회 중첩됩니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 2,
          "maxStacks": 5
        },
        {
          "stat": "지력",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 2,
          "maxStacks": 5
        },
        {
          "stat": "통솔",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 2,
          "maxStacks": 5
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 -30, 대상 trigger_defender, 2턴, 최대 5중첩
    c.statMod(1);   // 지력 -30, 대상 trigger_defender, 2턴, 최대 5중첩
    c.statMod(2);   // 통솔 -30, 대상 trigger_defender, 2턴, 최대 5중첩
  },
});
