// 기병 돌격 · 고유 전법 · 패시브 100%
// 원문: 자신의 회심 확률이 45% 증가하며, 회심 피해를 준 후, 목표에게 척살을 발동한다. 척살: 통솔을 무시하는 60%의 병기 피해(회심 발동 불가)를 1회 준다. 목표가 디버프 상태를 보유한 경우, 척살의 피해가 20% 증가하며, 척살은 매 턴 5회 발동될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ma-chao",
  name: "기병 돌격",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "추격 피해: 통솔 무시·회심 불가 구현, 중복 회심 버프 제거"
    }
  ],
  clauses: [
    {
      "text": "자신의 회심 확률이 45% 증가하며",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]",
        "buffs[0]"
      ]
    },
    {
      "text": "회심 피해를 준 후, 목표에게 추격 피해 발동: 통솔을 무시하는 60%의 병기 피해(회심 발동 불가)를 1회 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 디버프 상태를 보유한 경우, 추격 피해가 20% 증가하며",
      "status": "ok"
    },
    {
      "text": "추격 피해는 매 턴 5회 발동될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_7",
    "legacyName": "기병 돌격",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 회심 확률이 22.5%→45% 증가하며, 회심 피해를 준 후, 목표에게 추격 피해 발동: 통솔을 무시하는 30%→60%의 병기 피해(회심 발동 불가)를 1회 준다. 목표가 디버프 상태를 보유한 경우, 추격 피해가 20% 증가하며, 추격 피해는 매 턴 5회 발동될 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.3,
          "max": 0.6,
          "target": "trigger_defender",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasAnyDebuff",
              "who": "target"
            },
            "mult": 0.2
          },
          "ignoreDef": true,
          "noCrit": true
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "requireCrit": true,
      "chance": 1,
      "maxPerTurn": 5
    },
    "triggerApplied": true,
    "preciseApplied": true,
    "alwaysOnBuffs": [
      {
        "stat": "회심",
        "min": 0.225,
        "max": 0.45,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 회심 확률이 22.5%→45% 증가",
        "impl": [
          "alwaysOnBuffs[0]",
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "회심 피해를 준 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "목표에게 추격 피해 발동: 통솔을 무시하는 30%→60%의 병기 피해(회심 발동 불가)를 1회 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 디버프 상태를 보유한 경우",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "추격 피해가 20% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "추격 피해는 매 턴 5회 발동될 수 있다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「회심 피해를 준 후, 목표에게 추격 피해 발동: 통솔을 무시하는 60%의 병기 피해(회심 발동 불가)를 1회 준다」
    // 「목표가 디버프 상태를 보유한 경우, 추격 피해가 20% 증가하며」
    c.damage(0);   // 목표에게 병기 60%(통솔 무시·회심 불가), 디버프 보유 시 +20%, 매 턴 5회
  },
});
