// 치열한 교전 · 고유 전법 · 추격 55%
// 원문: 일반 공격 후, 2턴 동안 백발백중 상태를 획득하며, 이후 병력이 가장 낮은 적군 단일 목표에게 280%의 병기 피해를 준다.
// 원문 절 구현: note / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-wen-chou",
  name: "치열한 교전",
  kind: "추격",
  isUnique: true,
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 백발백중 상태를 획득하며",
      "status": "note"
    },
    {
      "text": "이후 병력이 가장 낮은 적군 단일 목표에게 280%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_50",
    "legacyName": "치열한 교전",
    "legacyType": "추격",
    "legacyProcRate": "55%",
    "raw": "일반 공격 후, 2턴 동안 백발백중 상태를 획득하며, 이후 병력이 가장 낮은 적군 단일 목표에게 140%→280%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 2.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "lowest_hp_enemy"
      ],
      "statusEffects": [
        "백발백중"
      ]
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 백발백중 상태를 획득",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "병력이 가장 낮은 적군 단일 목표에게 140%→280%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「이후 병력이 가장 낮은 적군 단일 목표에게 280%의 병기 피해를 준다」
    c.damage(0);   // 병기 140%→280%
    c.status(0);   // 백발백중
  },
});
