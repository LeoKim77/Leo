// 만인의 적 · 고유 전법 · 액티브 55%
// 원문: 전체 적군에게 140%의 병기 피해를 주며, 2턴 동안 지속되는 위협을(를) 부여한다. 목표가 이미 위협 상태를 보유한 경우, 60% 확률로 1턴 동안 지속되는 공포을(를) 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-fei",
  name: "만인의 적",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "전체 적군에게 140%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 위협을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "목표가 이미 위협 상태를 보유한 경우, 60% 확률로 1턴 동안 지속되는 공포을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_26",
    "legacyName": "만인의 적",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "전체 적군에게 70%→140%의 병기 피해를 주며, 2턴 동안 지속되는 공포을(를) 부여한다. 목표가 이미 위협 상태를 보유한 경우, 30%→60% 확률로 1턴 동안 지속되는 위협을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4,
          "target": "all_enemy",
          "tag": "main"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "위협",
          "target": "tag:main",
          "duration": 2
        },
        {
          "name": "공포",
          "target": "tag:main",
          "chance": 0.6,
          "duration": 1,
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "위협"
          }
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "전체 적군에게 70%→140%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 공포을(를) 부여한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 이미 위협 상태를 보유한 경우",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "30%→60% 확률로 1턴 동안 지속되는 위협을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「전체 적군에게 140%의 병기 피해를 주며」
    c.damage(0);   // 병기 70%→140%, 대상 all_enemy
    // 「2턴 동안 지속되는 위협을(를) 부여한다」
    c.status(0);   // 위협, 대상 tag:main, 2턴
    // 「목표가 이미 위협 상태를 보유한 경우, 60% 확률로 1턴 동안 지속되는 공포을(를) 부여한다」
    c.status(1);   // 공포, 대상 tag:main, 확률 60%, 1턴, 조건 hasStatus
  },
});
