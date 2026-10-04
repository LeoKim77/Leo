// 경무장 · 전법 · 추격 27.5%~ 50%
// 원문: 일반 공격 후, 랜덤 아군 2명에게 1스택의 방어을(를) 부여하고, 2턴 동안 해당 아군의 받는 피해를 20% 감소시킨다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "light-support",
  name: "경무장",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 랜덤 아군 2명에게 1스택의 방어을(를) 부여하고",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "2턴 동안 해당 아군의 받는 피해를 20% 감소시킨다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_61",
    "legacyName": "경무장",
    "legacyType": "추격",
    "legacyProcRate": "27.5%~ 50%",
    "raw": "일반 공격 후, 랜덤 아군 2명에게 1스택의 방어을(를) 부여하고, 2턴 동안 해당 아군의 받는 피해를 10%→20% 감소시킨다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.1,
          "max": -0.2,
          "target": "random_ally_n",
          "duration": 2
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "random_ally_n"
        }
      ],
      "targets": []
    },
    "preciseApplied": true,
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "chance": 0.5
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 아군 2명에게 1스택의 방어을(를) 부여",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 해당 아군의 받는 피해를 10%→20% 감소시킨다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 해당 아군의 받는 피해를 20% 감소시킨다」
    c.buff(0);   // 받는피해 -10%→-20%, 대상 random_ally_n, 2턴
    // 「일반 공격 후, 랜덤 아군 2명에게 1스택의 방어을(를) 부여하고」
    c.status(0);   // 방어, 대상 random_ally_n
  },
});
