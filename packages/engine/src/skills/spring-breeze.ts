// 지혜의 바람 · 전법 · 패시브 100%
// 원문: 매 턴 행동 시, 자신의 병력을 회복한다(치유율 140%, 지력과 통솔의 영향 받음).
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "spring-breeze",
  name: "지혜의 바람",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-10",
      "note": "녹화(2026-10-10 조조·소교·등애): 지력과 통솔의 영향 회복은 지력 가산항 없이 지력 × 1.123 × 치유율 (FIX-029)"
    }
  ],
  clauses: [
    {
      "text": "매 턴 행동 시, 자신의 병력을 회복한다(치유율 140%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_75",
    "legacyName": "지혜의 바람",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시, 자신의 병력을 회복한다(치유율 70%→140%, 지력과 통솔의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "noStatTerm": true,
          "min": 0.7,
          "max": 1.4
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "매 턴 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신의 병력을 회복한다(치유율 70%→140%",
        "impl": [
          "heal[0]"
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
    // 「매 턴 행동 시, 자신의 병력을 회복한다(치유율 140%, 지력과 통솔의 영향 받음)」
    c.heal(0);   // 치유율 70%→140%
  },
});
