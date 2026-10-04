// 강철의 의지 · 전법 · 액티브 38.5%~ 70%
// 원문: 2턴 동안 우군 2명의 연타 확률이 45%, 회유이(가) 20% 증가한다.
// 원문 절 구현: missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "no-hardship",
  name: "강철의 의지",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "2턴 동안 우군 2명의 연타 확률이 45%",
      "status": "missing"
    },
    {
      "text": "회유이(가) 20% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_41",
    "legacyName": "강철의 의지",
    "legacyType": "액티브",
    "legacyProcRate": "38.5%~ 70%",
    "raw": "2턴 동안 우군 2명의 연타 확률이 22.5%→45%, 회유이(가) 20% 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "연타확률",
          "min": 0.225,
          "max": 0.45
        },
        {
          "stat": "회유",
          "min": 0.2,
          "max": 0.2
        }
      ],
      "statMods": [],
      "targets": [
        "random_ally_n"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "2턴 동안 우군 2명의 연타 확률이 22.5%→45%",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "회유이(가) 20% 증가한다",
        "impl": [
          "buffs[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 연타확률 +22.5%→45%
    // 「회유이(가) 20% 증가한다」
    c.buff(1);   // 회유 +20%
  },
});
