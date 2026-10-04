// 청룡 출격 · 고유 전법 · 패시브 100%
// 원문: 자신이 병기 피해를 준 후, 75% 확률로 용의 포효 발동: 목표에게 2턴 동안 지속되는 위협을(를) 부여하며, 목표가 위협 상태면 목표에게 100%의 병기 피해를 주는 것으로 변경된다. 매 턴 용의 포효가 4회 발동될 수 있다.
// 원문 절 구현: ok / ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guan-ping",
  name: "청룡 출격",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "자신이 병기 피해를 준 후, 75% 확률로 용의 포효 발동: 목표에게 2턴 동안 지속되는 위협을(를) 부여하며",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "trigger"
      ]
    },
    {
      "text": "목표가 위협 상태면 목표에게 100%의 병기 피해를 주는 것으로 변경된다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "statusEffects[0]",
        "trigger"
      ]
    },
    {
      "text": "매 턴 용의 포효가 4회 발동될 수 있다",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "uskill_46",
    "legacyName": "청룡 출격",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신이 병기 피해를 준 후, 37.5%→75% 확률로 용의 포효 발동: 목표에게 2턴 동안 지속되는 위협을(를) 부여하며, 목표가 위협 상태면 목표에게 50%→100%의 병기 피해를 주는 것으로 변경된다. 매 턴 용의 포효가 4회 발동될 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.5,
          "max": 1,
          "target": "trigger_defender"
        }
      ],
      "statusEffects": [
        "위협"
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": []
    },
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "filterDmgType": "병기",
      "chance": 0.75,
      "maxPerTurn": 4
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "자신이 병기 피해를 준 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "37.5%→75% 확률로 용의 포효 발동: 목표에게 2턴 동안 지속되는 위협을(를) 부여",
        "impl": [
          "statusEffects[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 위협 상태면 목표에게 50%→100%의 병기 피해를 주는 것으로 변경된다",
        "impl": [
          "damage[0]",
          "statusEffects[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 용의 포효가 4회 발동될 수 있다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「목표가 위협 상태면 목표에게 100%의 병기 피해를 주는 것으로 변경된다」
    c.damage(0);   // 병기 50%→100%, 대상 trigger_defender
    // 「자신이 병기 피해를 준 후, 75% 확률로 용의 포효 발동: 목표에게 2턴 동안 지속되는 위협을(를) 부여하며」
    c.status(0);   // 위협
  },
});
