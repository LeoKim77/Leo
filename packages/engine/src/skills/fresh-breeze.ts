// 청풍 질주 · 전법 · 액티브 60%
// 원문: 랜덤 아군 2명의 디버프 상태 1가지를 제거하며, 병력을 회복시킨다(치유율 180%, 지력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "fresh-breeze",
  name: "청풍 질주",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "랜덤 아군 2명의 디버프 상태 1가지를 제거하며",
      "status": "ok",
      "impl": [
        "dispel[0]",
        "dispel[1]"
      ]
    },
    {
      "text": "병력을 회복시킨다(치유율 180%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_42",
    "legacyName": "청풍 질주",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 아군 2명의 디버프 상태 1가지를 제거하며, 병력을 회복시킨다(치유율 90%→180%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.9,
          "max": 1.8
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_ally_n",
        "random_ally_n"
      ],
      "statusEffects": [],
      "dispel": [
        {
          "target": "random_ally_n",
          "count": 1
        },
        {
          "target": "random_ally_n",
          "count": 1
        }
      ]
    },
    "clauses": [
      {
        "text": "랜덤 아군 2명의 디버프 상태 1가지를 제거",
        "impl": [
          "dispel[0]",
          "dispel[1]"
        ],
        "status": "ok"
      },
      {
        "text": "병력을 회복시킨다(치유율 90%→180%",
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
    // 「병력을 회복시킨다(치유율 180%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 90%→180%
    // 「랜덤 아군 2명의 디버프 상태 1가지를 제거하며」
    c.dispel(0);   // 디버프 1가지 제거, 대상 random_ally_n
    c.dispel(1);   // 디버프 1가지 제거, 대상 random_ally_n
  },
});
