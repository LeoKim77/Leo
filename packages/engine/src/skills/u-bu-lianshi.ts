// 보연사 고유 전법 · 고유 전법 · 액티브 60%
// 원문: 아군 2명에게 2턴 동안 안정 효과를 부여합니다. 안정 효과: 책략 피해 20% 증가(지력의 영향을 받음). 매 턴 행동 전에 병력을 회복합니다. 치료율 300%(지력의 영향을 받음).
// 원문 절 구현: ok / ok / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-bu-lianshi",
  name: "보연사 고유 전법",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "안정의 회복은 받은 무장의 지력으로 계산(보연사 지력 아님)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "아군 2명에게 2턴 동안 안정 효과를 부여합니다",
      "status": "ok"
    },
    {
      "text": "안정 효과: 책략 피해 20% 증가(지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "매 턴 행동 전에 병력을 회복합니다",
      "status": "approx"
    },
    {
      "text": "치료율 300%(지력의 영향을 받음)",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는책략피해",
          "min": 0.2,
          "max": 0.2,
          "target": "random_ally_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "s"
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "grants": [
        {
          "key": "안정",
          "target": "tag:s",
          "duration": 1,
          "skill": {
            "type": "패시브",
            "_timing": "action",
            "effects": {
              "damage": [],
              "heal": [
                {
                  "min": 3,
                  "max": 3,
                  "target": "self"
                }
              ],
              "buffs": [],
              "statMods": [],
              "statusEffects": [],
              "targets": []
            }
          }
        }
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "안정의 회복은 받은 무장의 지력으로 계산(보연사 지력 아님)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는책략피해 +20%, 대상 random_ally_n, 2턴, 최대 1중첩
    c.grant(0);   // 「안정」 부여, 대상 tag:s, 1턴
  },
});
