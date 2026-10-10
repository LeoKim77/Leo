// 웅거서량 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안, 아군 2명의 추격 전법 피해가 20% 증가합니다(통솔의 영향을 받음). 또한 해당 무장들이 매 턴 행동 종료 시 50% 확률(통솔의 영향을 받음)로 일반 공격을 1회 추가로 실시합니다. 각 무장은 독립적으로 판정합니다.
// 원문 절 구현: ok / approx / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ma-teng",
  name: "웅거서량",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "추가 일반 공격을 행동 종료 시 처리. 통솔 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안",
      "status": "ok"
    },
    {
      "text": "아군 2명의 추격 전법 피해가 20% 증가합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "또한 해당 무장들이 매 턴 행동 종료 시 50% 확률(통솔의 영향을 받음)로 일반 공격을 1회 추가로 실시합니다",
      "status": "approx"
    },
    {
      "text": "각 무장은 독립적으로 판정합니다",
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
          "stat": "추격전법피해",
          "min": 0.2,
          "max": 0.2,
          "target": "random_ally_n",
          "duration": 3,
          "maxStacks": 1,
          "tag": "m"
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "grants": [
        {
          "key": "추가 일반 공격",
          "target": "tag:m",
          "duration": 3,
          "skill": {
            "type": "패시브",
            "_timing": "actionEnd",
            "effects": {
              "damage": [
                {
                  "dmgType": "병기",
                  "min": 1,
                  "max": 1,
                  "target": "random_enemy_1",
                  "chance": 0.5,
                  "asBasicAttack": true
                }
              ],
              "heal": [],
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
    "authoredNote": "추가 일반 공격을 행동 종료 시 처리. 통솔 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 추격전법피해 +20%, 대상 random_ally_n, 3턴, 최대 1중첩
    c.grant(0);   // 「추가 일반 공격」 부여, 대상 tag:m, 3턴
  },
});
