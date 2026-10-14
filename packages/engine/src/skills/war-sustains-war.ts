// 전쟁 조달 · 전법 · 패시브 100%
// 원문: 무력이 20포인트 증가하며, 일반 공격 후, 자신의 병력을 회복한다(치유율 110%, 지력과 무력의 영향 받음).
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "war-sustains-war",
  name: "전쟁 조달",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "무력 +20은 상시, 회복은 '일반 공격 후'에만 자신 (예전엔 매 행동 시작, 무력은 2턴)"
    }
  ],
  clauses: [
    {
      "text": "무력이 20포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "일반 공격 후, 자신의 병력을 회복한다(치유율 110%, 지력과 무력의 영향 받음)",
      "status": "approx",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_74",
    "legacyName": "전쟁 조달",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "무력이 10→20포인트 증가하며, 일반 공격 후, 자신의 병력을 회복한다(치유율 55%→110%, 지력과 무력의 영향 받음).",
    "effects": {
      "heal": [
        {
          "min": 0.55,
          "max": 1.1,
          "target": "self"
        }
      ],
      "targets": [
        "self"
      ]
    },
    "clauses": [
      {
        "text": "무력이 10→20포인트 증가",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신의 병력을 회복한다(치유율 55%→110%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력과 무력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "afterBasic": true,
      "chance": 1
    },
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "statMods": [
            {
              "stat": "무력",
              "min": 10,
              "max": 20,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 자신의 병력을 회복한다(치유율 110%, 지력과 무력의 영향 받음)」
    c.heal(0);   // 치유율 55%→110%, 대상 self
  },
});
