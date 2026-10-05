// 괴술 · 고유 전법 · 액티브 65%
// 원문: 2턴 동안 자신의 회유와(과) 피신 확률이 25% 증가하며, 이후 랜덤 적군 2명에게 220%의 병기 피해를 주고, 2턴 동안 지속되는 요술을(를) 부여한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-liang",
  name: "괴술",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "원문 순서: 회유·피신 +25% 먼저, 이후 피해 → 요술"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 자신의 회유와(과) 피신 확률이 25% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "이후 랜덤 적군 2명에게 220%의 병기 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "2턴 동안 지속되는 요술을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_51",
    "legacyName": "괴술",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "2턴 동안 자신의 회유와(과) 피신 확률이 12.5%→25% 증가하며, 이후 랜덤 적군 2명에게 110%→220%의 병기 피해를 주고, 2턴 동안 지속되는 요술을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "피신",
          "min": 0.125,
          "max": 0.25,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "회유",
          "min": 0.125,
          "max": 0.25,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "targets": [
        "random_enemy_n",
        "self"
      ],
      "statusEffects": [
        "요술"
      ]
    },
    "clauses": [
      {
        "text": "2턴 동안 자신의 회유와(과) 피신 확률이 12.5%→25% 증가",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 2명에게 110%→220%의 병기 피해를 주고",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 지속되는 요술을(를) 부여한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 자신의 회유와(과) 피신 확률이 25% 증가하며」
    c.buff(0); c.buff(1);
    // 「이후 랜덤 적군 2명에게 220%의 병기 피해를 주고」
    c.damage(0);
    // 「2턴 동안 지속되는 요술을(를) 부여한다」
    c.status({ name: '요술', duration: 2 });
  },
});
