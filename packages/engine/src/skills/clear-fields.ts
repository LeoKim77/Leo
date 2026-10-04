// 청야 전술 · 전법 · 액티브 50%
// 원문: 적군 전체를 조롱하며, 2턴 동안 자신의 통솔이 36포인트 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "clear-fields",
  name: "청야 전술",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "적군 전체를 조롱하며",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "2턴 동안 자신의 통솔이 36포인트 증가한다",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_47",
    "legacyName": "청야 전술",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "적군 전체를 조롱하며, 2턴 동안 자신의 통솔이 18→36포인트 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 18,
          "max": 36,
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "targets": [
        "self"
      ],
      "statusEffects": [
        "조롱"
      ]
    },
    "clauses": [
      {
        "text": "적군 전체를 조롱",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2턴 동안 자신의 통솔이 18→36포인트 증가한다",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 자신의 통솔이 36포인트 증가한다」
    c.statMod(0);   // 통솔 18→36, 2턴, 최대 1중첩
    // 「적군 전체를 조롱하며」
    c.status(0);   // 조롱
  },
});
