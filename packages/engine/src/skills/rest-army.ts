// 평화의 기운 · 전법 · 패시브 100%
// 원문: 매 턴 종료 시, 전열 아군 전체의 병력을 회복한다(치유율 90%, 지력의 영향 받음).
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "rest-army",
  name: "평화의 기운",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "대상: 전열 아군 전체 (예전엔 병력 최저 아군 1명)"
    }
  ],
  clauses: [
    {
      "text": "매 턴 종료 시, 전열 아군 전체의 병력을 회복한다(치유율 90%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_73",
    "legacyName": "평화의 기운",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "매 턴 종료 시, 전열 아군 전체의 병력을 회복한다(치유율 45%→90%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.45,
          "max": 0.9,
          "target": "front_allies"
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "매 턴 종료 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전열 아군 전체의 병력을 회복한다(치유율 45%→90%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「매 턴 종료 시, 전열 아군 전체의 병력을 회복한다(치유율 90%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 45%→90%, 대상 front_allies
  },
});
