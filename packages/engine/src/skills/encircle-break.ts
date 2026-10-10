// 포위 돌파 · 전법 · 액티브 55%
// 원문: 1턴 동안 준비 후 2턴 동안 랜덤 적군 단일 목표가 받는 피해를 30% 증가시키며, 해당 목표에게 440%의 병기 피해를 준다. 해당 전법은 첫 턴 발동 시 준비할 필요 없다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "encircle-break",
  name: "포위 돌파",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "받는 피해 증가 2턴(예전 1턴), 받는 피해 증가 → 피해 순서, '첫 턴 발동 시 준비 불필요' 구현"
    }
  ],
  clauses: [
    {
      "text": "1턴 동안 준비 후 2턴 동안 랜덤 적군 단일 목표가 받는 피해를 30% 증가시키며",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "prepTurns"
      ]
    },
    {
      "text": "해당 목표에게 440%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "해당 전법은 첫 턴 발동 시 준비할 필요 없다",
      "status": "ok",
      "impl": [
        "prepTurns"
      ]
    }
  ],
  def: {
    "legacyId": "skill_19",
    "legacyName": "포위 돌파",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "1턴 동안 준비 후 2턴 동안 랜덤 적군 단일 목표가 받는 피해를 15%→30% 증가시키며, 해당 목표에게 220%→440%의 병기 피해를 준다. 해당 전법은 첫 턴 발동 시 준비할 필요 없다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.2,
          "max": 4.4
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": 0.15,
          "max": 0.3,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": []
    },
    "prepTurns": 1,
    "clauses": [
      {
        "text": "1턴 동안 준비 후 2턴 동안 랜덤 적군 단일 목표가 받는 피해를 15%→30% 증가시키며",
        "impl": [
          "buffs[0]",
          "prepTurns"
        ],
        "status": "ok"
      },
      {
        "text": "해당 목표에게 220%→440%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "해당 전법은 첫 턴 발동 시 준비할 필요 없다",
        "impl": [
          "prepTurns"
        ],
        "status": "ok"
      }
    ],
    "noPrepOnTurn1": true
  },
  run(c) {
    // 「1턴 동안 준비 후 2턴 동안 랜덤 적군 단일 목표가 받는 피해를 30% 증가시키며」
    c.buff(0);   // 랜덤 적 1명(피해와 같은 대상)
    c.damage(0);
    // 「해당 전법은 첫 턴 발동 시 준비할 필요 없다」
  },
});
