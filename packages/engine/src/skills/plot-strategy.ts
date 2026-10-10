// 지략운용 · 전법 · 패시브 100%
// 원문: 일반 공격 후, 책략 피해가 7% 증가합니다. 최대 5회 중첩됩니다. 책략 피해를 가한 후, 50% 확률로 적군 무작위 단일 대상에게 일반 공격을 1회 실시합니다. 이 효과는 매 턴 최대 1회 발동합니다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "plot-strategy",
  name: "지략운용",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 책략 피해가 7% 증가합니다",
      "status": "ok"
    },
    {
      "text": "최대 5회 중첩됩니다",
      "status": "ok"
    },
    {
      "text": "책략 피해를 가한 후, 50% 확률로 적군 무작위 단일 대상에게 일반 공격을 1회 실시합니다",
      "status": "ok"
    },
    {
      "text": "이 효과는 매 턴 최대 1회 발동합니다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "afterBasic": true,
      "chance": 1,
      "maxPerTurn": 99
    },
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는책략피해",
          "min": 0.07,
          "max": 0.07,
          "target": "self",
          "duration": 999,
          "maxStacks": 5
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "dealt",
          "filterDmgType": "책략",
          "chance": 0.5,
          "maxPerTurn": 1
        },
        "effects": {
          "damage": [
            {
              "dmgType": "병기",
              "min": 1,
              "max": 1,
              "target": "random_enemy_1",
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
    ],
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는책략피해 +7%, 대상 self, 전투 종료까지, 최대 5중첩
  },
});
