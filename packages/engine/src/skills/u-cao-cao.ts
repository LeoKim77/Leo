// 난세의 간웅 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 전체 아군이 받는 피해가 14% 감소하며(지력의 영향 받음), 6%의 회유와(과) 심리 공격을(를) 획득한다(지력의 영향 받음). 통솔이 가장 높은 아군 단일 목표가 피해를 받을 때마다 30% 확률로 해당 아군의 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cao-cao",
  name: "난세의 간웅",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-10",
      "note": "녹화(2026-10-10): 받는 피해 14% → 24.38%, 회유·심리 공격 6% → 10.87% (조조 지력 288.80) — 지력 영향 가중치 0.39%·0.43% (J10 기본 0.21% 보다 큼, 잠정)"
    },
    {
      "date": "2026-10-10",
      "note": "녹화(2026-10-10 조조·소교·등애): 지력과 통솔의 영향 회복은 지력 가산항 없이 지력 × 1.123 × 치유율 (FIX-029)"
    },
    {
      "date": "2026-10-04",
      "note": "피해 받은 '통솔 최고 우군'이 자신을 회복 (예전엔 조조가 조조를 회복), 중복 버프 제거"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 시, 전체 우군이 받는 피해가 14% 감소하며(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]",
        "buffs[0]"
      ]
    },
    {
      "text": "6%의 회유와(과) 심리 공격을(를) 획득한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[1]",
        "alwaysOnBuffs[2]",
        "buffs[1]",
        "buffs[2]"
      ]
    },
    {
      "text": "통솔이 가장 높은 우군 단일 목표가 피해를 받을 때마다 30% 확률로 자신의 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "trigger"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_2",
    "legacyName": "난세의 간웅",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 시, 전체 아군이 받는 피해가 7%→14% 감소하며(지력의 영향 받음), 3%→6%의 회유와(과) 심리 공격을(를) 획득한다(지력의 영향 받음). 통솔이 가장 높은 아군 단일 목표가 피해를 받을 때마다 15%→30% 확률로 자신의 병력을 회복한다(치유율 20%→40%, 지력과 통솔의 영향 받음).",
    "effects": {
      "heal": [
        {
          "noStatTerm": true,
          "min": 0.2,
          "max": 0.4,
          "actor": "self",
          "target": "trigger_defender"
        }
      ],
      "targets": []
    },
    "trigger": {
      "event": "damage",
      "role": "ally_taken",
      "chance": 0.3,
      "requireDefenderIs": "highest_command_ally"
    },
    "triggerApplied": true,
    "preciseApplied": true,
    "alwaysOnBuffs": [
      {
        "stat": "받는피해",
        "min": -0.07,
        "max": -0.14,
        "target": "all_ally",
        "duration": 999,
        "maxStacks": 1,
        "inf": { "stats": ["지력"], "who": "self", "weight": 0.0039 }
      },
      {
        "stat": "회유",
        "min": 0.03,
        "max": 0.06,
        "target": "all_ally",
        "duration": 999,
        "maxStacks": 1,
        "inf": { "stats": ["지력"], "who": "self", "weight": 0.0043 }
      },
      {
        "stat": "심리공격",
        "min": 0.03,
        "max": 0.06,
        "target": "all_ally",
        "duration": 999,
        "maxStacks": 1,
        "inf": { "stats": ["지력"], "who": "self", "weight": 0.0043 }
      }
    ],
    "clauses": [
      {
        "text": "전투 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군이 받는 피해가 7%→14% 감소",
        "impl": [
          "alwaysOnBuffs[0]",
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "(지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "3%→6%의 회유와(과) 심리 공격을(를) 획득한다(지력의 영향 받음)",
        "impl": [
          "alwaysOnBuffs[1]",
          "alwaysOnBuffs[2]",
          "buffs[1]",
          "buffs[2]"
        ],
        "status": "ok"
      },
      {
        "text": "통솔이 가장 높은 아군 단일 목표가 피해를 받을 때마다 15%→30% 확률로 자신의 병력을 회복한다(치유율 20%→40%",
        "impl": [
          "heal[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "지력과 통솔의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「통솔이 가장 높은 우군 단일 목표가 피해를 받을 때마다 30% 확률로 자신의 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음)」
    c.heal(0);   // 치유율 20%→40%, 대상 trigger_defender, 공격자 self
  },
});
