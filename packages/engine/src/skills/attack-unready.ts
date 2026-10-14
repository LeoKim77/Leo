// 무방비 공격 · 전법 · 추격 40%
// 원문: 일반 공격 후, 공격 목표에게 280%의 병기 피해를 주고 1턴 동안 지속되는 침묵을(를) 부여한다. 목표가 침묵 상태면 50% 확률로 1턴 동안 지속되는 공포을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "attack-unready",
  name: "무방비 공격",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 공격 목표에게 280%의 병기 피해를 주고 1턴 동안 지속되는 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 침묵 상태면 50% 확률로 1턴 동안 지속되는 공포을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_54",
    "legacyName": "무방비 공격",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후, 공격 목표에게 140%→280%의 병기 피해를 주고 1턴 동안 지속되는 침묵을(를) 부여한다. 목표가 침묵 상태면 50% 확률로 1턴 동안 지속되는 공포을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 2.8,
          "target": "trigger_defender"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "침묵",
          "target": "trigger_defender"
        },
        {
          "name": "공포",
          "target": "trigger_defender",
          "chance": 0.5,
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "침묵"
          }
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "공격 목표에게 140%→280%의 병기 피해를 주고 1턴 동안 지속되는 침묵을(를) 부여한다",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 침묵 상태면 50% 확률로 1턴 동안 지속되는 공포을(를) 부여한다",
        "impl": [
          "statusEffects[0]",
          "statusEffects[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 공격 목표에게 280%의 병기 피해를 주고 1턴 동안 지속되는 침묵을(를) 부여한다」
    c.damage(0);   // 병기 140%→280%, 대상 trigger_defender
    c.status(0);   // 침묵, 대상 trigger_defender
    // 「목표가 침묵 상태면 50% 확률로 1턴 동안 지속되는 공포을(를) 부여한다」
    c.status(1);   // 공포, 대상 trigger_defender, 확률 50%, 조건 hasStatus
  },
});
