// 천군 소탕 · 전법 · 추격 45%
// 원문: 일반 공격 후, 전체 적군에게 120%의 병기 피해를 준다. 시전 성공 후, 추격 전법피해가 8%증가하고, 최대 5회 중첩되며, 전투종료까지 지속된다.
// 원문 절 구현: ok / ok / note / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "sweep-army",
  name: "천군 소탕",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 전체 적군에게 120%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "시전 성공 후, 추격 전법피해가 8%증가하고",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "최대 5회 중첩되며",
      "status": "note"
    },
    {
      "text": "전투종료까지 지속된다",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "skill_55",
    "legacyName": "천군 소탕",
    "legacyType": "추격",
    "legacyProcRate": "45%",
    "raw": "일반 공격 후, 전체 적군에게 60%→120%의 병기 피해를 준다. 시전 성공 후, 추격 전법피해가 8%증가하고, 최대 5회 중첩되며, 전투종료까지 지속된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.6,
          "max": 1.2
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "추격전법피해",
          "min": 0.08,
          "max": 0.08,
          "target": "self",
          "duration": 999,
          "maxStacks": 5
        }
      ],
      "statMods": [],
      "targets": [
        "all_enemy"
      ],
      "statusEffects": []
    },
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "chance": 0.45
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 적군에게 60%→120%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "시전 성공 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "추격 전법피해가 8%증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "최대 5회 중첩",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전투종료까지 지속된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 전체 적군에게 120%의 병기 피해를 준다」
    c.damage(0);   // 병기 60%→120%
    // 「시전 성공 후, 추격 전법피해가 8%증가하고」
    c.buff(0);   // 추격전법피해 +8%, 대상 self, 전투 종료까지, 최대 5중첩
  },
});
