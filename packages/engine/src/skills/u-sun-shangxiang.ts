// 궁희 · 고유 전법 · 추격 65%
// 원문: 일반 공격 후, 랜덤 적군 단일 목표에게 320%의 병기 피해를 주며, 적에 이성이 1명 있을 때마다 해당 피해 계수가 50% 증가하고, 75% 확률로 후열 목표를 우선적으로 선택한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sun-shangxiang",
  name: "궁희",
  kind: "추격",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "발동률을 원문 65%로(예전 75%), '75% 확률로 후열 목표 우선' 구현"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 랜덤 적군 단일 목표에게 320%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    },
    {
      "text": "적에 이성이 1명 있을 때마다 해당 피해 계수가 50% 증가하고",
      "status": "ok"
    },
    {
      "text": "75% 확률로 후열 목표를 우선적으로 선택한다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_11",
    "legacyName": "궁희",
    "legacyType": "추격",
    "legacyProcRate": "65%",
    "raw": "일반 공격 후, 랜덤 적군 단일 목표에게 160%→320%의 병기 피해를 주며, 적에 이성이 1명 있을 때마다 해당 피해 계수가 25%→50% 증가하고, 75% 확률로 후열 목표를 우선적으로 선택한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.6,
          "max": 3.2,
          "target": "tag:t",
          "scaleBy": {
            "kind": "oppositeGender",
            "per": 0.5,
            "cap": 3
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "preciseApplied": true,
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "chance": 0.65
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "랜덤 적군 단일 목표에게 160%→320%의 병기 피해를 주며",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "적에 이성이 1명 있을 때마다 해당 피해 계수가 25%→50% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "75% 확률로 후열 목표를 우선적으로 선택한다",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「75% 확률로 후열 목표를 우선적으로 선택한다」
    c.tag('t', c.targets(c.chance(0.75) ? 'random_enemy_back_first' : 'random_enemy_1'));
    // 「일반 공격 후, 랜덤 적군 단일 목표에게 320%의 병기 피해를 주며」
    // 「적에 이성이 1명 있을 때마다 해당 피해 계수가 50% 증가하고」
    c.damage(0);
  },
});
