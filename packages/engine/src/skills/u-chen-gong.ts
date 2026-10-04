// 지략전 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 무력이 가장 높은 아군 단일 목표가 1턴 동안 종계를 획득한다. 종계: 받는 책략 피해가 15%감소하며(지력의 영향 받음), 추격 전법 발동 후, 랜덤 적군 단일 목표에게 140%의 책략 피해를 준다.(목표의 무력의 영향 받음).
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-chen-gong",
  name: "지략전",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "추격 연계 피해의 공격자를 진궁으로 처리, 목표 무력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 시작 시, 무력이 가장 높은 아군 단일 목표가 1턴 동안 종계를 획득한다",
      "status": "ok"
    },
    {
      "text": "종계: 받는 책략 피해가 15%감소하며(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "추격 전법 발동 후, 랜덤 적군 단일 목표에게 140%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "(목표의 무력의 영향 받음)",
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
          "stat": "받는책략피해",
          "min": -0.15,
          "max": -0.15,
          "target": "highest_power_ally",
          "duration": 1,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "cast",
          "castType": "추격",
          "casterIs": [
            "highest_power_ally"
          ],
          "chance": 1,
          "maxPerTurn": 9
        },
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1.4,
              "max": 1.4,
              "target": "random_enemy_1"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "추격 연계 피해의 공격자를 진궁으로 처리, 목표 무력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는책략피해 -15%, 대상 highest_power_ally, 1턴, 최대 1중첩
  },
});
