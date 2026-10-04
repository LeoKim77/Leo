// 퇴로 매복 · 전법 · 액티브 50%
// 원문: 랜덤 적군 단일 목표에게 100%~140%의 병기 피해를 주며, 4회 발동된다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ambushes",
  name: "퇴로 매복",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'100%~140%' 는 타격마다 무작위 계수 (예전엔 항상 140%)"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 100%~140%의 병기 피해를 주며",
      "status": "ok",
      "reviewed": "4회 타격 구현. 100~140% 무작위 폭은 140% 고정"
    },
    {
      "text": "4회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_18",
    "legacyName": "퇴로 매복",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "랜덤 적군 단일 목표에게 50%→100%~70%→140%의 병기 피해를 주며, 4회 발동된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4,
          "target": "random_enemy_1",
          "randRange": [
            1,
            1.4
          ]
        },
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4,
          "target": "random_enemy_1",
          "randRange": [
            1,
            1.4
          ]
        },
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4,
          "target": "random_enemy_1",
          "randRange": [
            1,
            1.4
          ]
        },
        {
          "dmgType": "병기",
          "min": 0.7,
          "max": 1.4,
          "target": "random_enemy_1",
          "randRange": [
            1,
            1.4
          ]
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 50%→100%~70%→140%의 병기 피해를 주며",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "4회 발동된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「랜덤 적군 단일 목표에게 100%~140%의 병기 피해를 주며」
    // 「4회 발동된다」
    c.damage(0);   // 랜덤 적 1명, 100%~140%
    c.damage(1);   // 랜덤 적 1명, 100%~140%
    c.damage(2);   // 랜덤 적 1명, 100%~140%
    c.damage(3);   // 랜덤 적 1명, 100%~140%
  },
});
