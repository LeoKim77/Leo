// 철기병 돌격 · 전법 · 추격 40%
// 원문: 일반 공격 후, 2턴 동안 자신의 회심 확률이 20% 증가하며, 이후 해당 목표에게 400%의 병기 피해를 준다. 발동 여부와 상관없이 해당 피해 계수가 매 턴 25% 감소한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "iron-cavalry",
  name: "철기병 돌격",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'해당 목표' = 일반 공격 목표 (예전엔 랜덤 적), 회심 +20% → 피해 순서"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 자신의 회심 확률이 20% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "이후 해당 목표에게 400%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "발동 여부와 상관없이 해당 피해 계수가 매 턴 25% 감소한다",
      "status": "ok",
      "impl": [
        "damage[0].turnScale"
      ]
    }
  ],
  def: {
    "legacyId": "skill_51",
    "legacyName": "철기병 돌격",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후, 2턴 동안 자신의 회심 확률이 10%→20% 증가하며, 이후 해당 목표에게 200%→400%의 병기 피해를 준다. 발동 여부와 상관없이 해당 피해 계수가 매 턴 25% 감소한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2,
          "max": 4,
          "turnScale": {
            "perTurn": -0.25,
            "mode": "mult"
          },
          "target": "trigger_defender"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "회심",
          "min": 0.1,
          "max": 0.2,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 자신의 회심 확률이 10%→20% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "해당 목표에게 200%→400%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "발동 여부와 상관없이 해당 피해 계수가 매 턴 25% 감소한다",
        "impl": [
          "damage[0].turnScale"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 2턴 동안 자신의 회심 확률이 20% 증가하며」
    c.buff(0);
    // 「이후 해당 목표에게 400%의 병기 피해를 준다」
    // 「발동 여부와 상관없이 해당 피해 계수가 매 턴 25% 감소한다」
    c.damage(0);
  },
});
