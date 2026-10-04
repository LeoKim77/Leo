// 인재 등용 · 고유 전법 · 지휘 100%
// 원문: 전체 우군의 묘책와(과) 간파이(가) 25% 증가한다(지력의 영향 받음). 자신이 주는 회복 효과에 30% 확률로(묘책의 영향 받음) 2배 회복 효과가 발동된다.
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xun-yu",
  name: "인재 등용",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "전체 우군의 묘책와(과) 간파이(가) 25% 증가한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "자신이 주는 회복 효과에 30% 확률로(묘책의 영향 받음) 2배 회복 효과가 발동된다",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "uskill_28",
    "legacyName": "인재 등용",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전체 아군의 묘책와(과) 간파이(가) 12.5%→25% 증가한다(지력의 영향 받음). 자신이 주는 회복 효과에 15%→30% 확률로(묘책의 영향 받음) 2배 회복 효과가 발동된다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "묘책",
          "min": 0.125,
          "max": 0.25,
          "target": "all_ally"
        },
        {
          "stat": "간파",
          "min": 0.125,
          "max": 0.25,
          "target": "all_ally"
        },
        {
          "stat": "회복2배확률",
          "min": 0.15,
          "max": 0.3,
          "target": "self"
        }
      ],
      "statMods": [],
      "targets": [
        "all_ally"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "전체 아군의 묘책와(과) 간파이(가) 12.5%→25% 증가한다(지력의 영향 받음)",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 주는 회복 효과에 15%→30% 확률로(묘책의 영향 받음) 2배 회복 효과가 발동된다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「전체 우군의 묘책와(과) 간파이(가) 25% 증가한다(지력의 영향 받음)」
    c.buff(0);   // 묘책 +12.5%→25%, 대상 all_ally
    c.buff(1);   // 간파 +12.5%→25%, 대상 all_ally
    c.buff(2);   // 회복2배확률 +15%→30%, 대상 self
  },
});
