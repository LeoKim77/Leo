// 청낭 치료 · 전법 · 액티브 55%
// 원문: 병력이 가장 낮은 우군 단일 목표의 디버프 상태 3가지를 제거하며, 병력을 회복시킨다(치유율 260%, 지력의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "qingnang",
  name: "청낭 치료",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "병력이 가장 낮은 우군 단일 목표의 디버프 상태 3가지를 제거하며",
      "status": "ok",
      "impl": [
        "dispel[0]"
      ]
    },
    {
      "text": "병력을 회복시킨다(치유율 260%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_44",
    "legacyName": "청낭 치료",
    "legacyType": "액티브",
    "legacyProcRate": "55%",
    "raw": "병력이 가장 낮은 아군 단일 목표의 디버프 상태 3가지를 제거하며, 병력을 회복시킨다(치유율 130%→260%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.3,
          "max": 2.6
        }
      ],
      "buffs": [],
      "statMods": [],
      "targets": [
        "lowest_hp_ally",
        "random_ally_n"
      ],
      "statusEffects": [],
      "dispel": [
        {
          "target": "lowest_hp_ally",
          "count": 3
        }
      ]
    },
    "clauses": [
      {
        "text": "병력이 가장 낮은 아군 단일 목표의 디버프 상태 3가지를 제거",
        "impl": [
          "dispel[0]"
        ],
        "status": "ok"
      },
      {
        "text": "병력을 회복시킨다(치유율 130%→260%",
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
    // 「병력을 회복시킨다(치유율 260%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 130%→260%
    // 「병력이 가장 낮은 우군 단일 목표의 디버프 상태 3가지를 제거하며」
    c.dispel(0);   // 디버프 3가지 제거, 대상 lowest_hp_ally
  },
});
