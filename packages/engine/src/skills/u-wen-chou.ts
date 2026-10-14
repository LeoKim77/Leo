// 치열한 교전 · 고유 전법 · 추격 55%
// 원문: 일반 공격 후, 2턴 동안 백발백중 상태를 획득하며, 이후 병력이 가장 낮은 적군 단일 목표에게 280%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-wen-chou",
  name: "치열한 교전",
  kind: "추격",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "백발백중을 자신에게 2턴(예전엔 적에게), 그다음 병력 최저 적에게 280%"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 2턴 동안 백발백중 상태를 획득하며",
      "status": "ok"
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
          "max": 2.8,
          "target": "lowest_hp_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "lowest_hp_enemy"
      ],
      "statusEffects": [
        {
          "name": "백발백중",
          "target": "self",
          "duration": 2
        }
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
    // 「일반 공격 후, 2턴 동안 백발백중 상태를 획득하며」
    c.status(0);
    // 「이후 병력이 가장 낮은 적군 단일 목표에게 280%의 병기 피해를 준다」
    c.damage(0);
  },
});
