// 황심의 가호 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 60% 확률로(지력의 영향 받음) 2턴 동안 랜덤 아군 2~3명의 피신율이 18% 증가한다(지력의 영향 받음). 매 턴 종료 시, 랜덤 아군 2명의 병력을 회복시킨다(치유율 120%).
// 원문 절 구현: approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-gan-furen",
  name: "황심의 가호",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "랜덤 아군 2~3명(원문 그대로), 60% 확률은 효과 전체 1회 판정. 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 시작 시, 60% 확률(지력의 영향 받음)로 2턴 동안 랜덤 아군 2~3명의 피신율이 18%증가 한다(지력의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "매 턴 종료 시, 랜덤 아군 2명의 병력을 회복시킨다",
      "status": "ok"
    },
    {
      "text": "(치유율 120%)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "피신",
          "min": 0.18,
          "max": 0.18,
          "target": "random_ally_2to3",
          "duration": 2,
          "maxStacks": 1,
          "chanceAll": 0.6
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 1.2,
              "max": 1.2,
              "target": "random_ally_n"
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
    "authoredNote": "랜덤 아군 2~3명(원문 그대로), 60% 확률은 효과 전체 1회 판정. 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 피신 +18%, 대상 random_ally_2to3, 2턴, 최대 1중첩
  },
});
