// 전쟁 조달 · 전법 · 패시브 100%
// 원문: 무력이 20포인트 증가하며, 일반 공격 후, 자신의 병력을 회복한다(치유율 110%, 지력과 무력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "war-sustains-war",
  name: "전쟁 조달",
  kind: "패시브",
  isUnique: false,
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
      "status": "ok",
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
      "damage": [],
      "heal": [
        {
          "min": 0.55,
          "max": 1.1
        }
      ],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": 10,
          "max": 20,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "targets": [
        "self"
      ],
      "statusEffects": []
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
    ]
  },
  run(c) {
    // 「무력이 20포인트 증가하며」
    c.statMod(0);   // 무력 10→20, 2턴, 최대 1중첩
    // 「일반 공격 후, 자신의 병력을 회복한다(치유율 110%, 지력과 무력의 영향 받음)」
    c.heal(0);   // 치유율 55%→110%
  },
});
