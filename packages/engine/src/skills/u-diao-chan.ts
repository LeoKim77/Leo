// 폐월 · 고유 전법 · 패시브 100%
// 원문: 자신이 이성에게 받는 피해가 30% 감소한다(최고 속성의 영향 받음). 매 턴 종료 시, 무력이 가장 높은 우군 단일 목표의 병기 피해가 15% 증가하며, 이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 60%의 병기 피해를 1회 준다(회심 발동 불가).
// 원문 절 구현: ok / missing / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-diao-chan",
  name: "폐월",
  kind: "패시브",
  isUnique: true,
  clauses: [
    {
      "text": "자신이 이성에게 받는 피해가 30% 감소한다(최고 속성의 영향 받음)",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "매 턴 종료 시, 무력이 가장 높은 우군 단일 목표의 병기 피해가 15% 증가하며",
      "status": "missing"
    },
    {
      "text": "이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 60%의 병기 피해를 1회 준다(회심 발동 불가)",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_17",
    "legacyName": "폐월",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신이 이성에게 받는 피해가 15%→30% 감소한다(최고 속성의 영향 받음). 매 턴 종료 시, 무력이 가장 높은 우군 단일 목표의 병기 피해가 7.5%→15% 증가하며, 이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 30%→60%의 병기 피해를 1회 준다(회심 발동 불가).",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.3,
          "max": 0.6,
          "target": "trigger_attacker",
          "ignoreDef": true,
          "noCrit": true
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.15,
          "max": -0.3,
          "target": "self",
          "duration": 999
        },
        {
          "stat": "주는피해",
          "min": 0.075,
          "max": 0.15,
          "target": "highest_power_ally",
          "duration": 2
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "자신이 이성에게 받는 피해가 15%→30% 감소한다(최고 속성의 영향 받음)",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 종료 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "무력이 가장 높은 우군 단일 목표의 병기 피해가 7.5%→15% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 30%→60%의 병기 피해를 1회 준다(회심 발동 불가)",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 60%의 병기 피해를 1회 준다(회심 발동 불가)」
    c.damage(0);   // 병기 30%→60%, 대상 trigger_attacker
    // 「자신이 이성에게 받는 피해가 30% 감소한다(최고 속성의 영향 받음)」
    c.buff(0);   // 받는피해 -15%→-30%, 대상 self, 전투 종료까지
    c.buff(1);   // 주는피해 +7.5%→15%, 대상 highest_power_ally, 2턴
  },
});
