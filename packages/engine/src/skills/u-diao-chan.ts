// 폐월 · 고유 전법 · 패시브 100%
// 원문: 자신이 이성에게 받는 피해가 30% 감소한다(최고 속성의 영향 받음). 매 턴 종료 시, 무력이 가장 높은 우군 단일 목표의 병기 피해가 15% 증가하며, 이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 60%의 병기 피해를 1회 준다(회심 발동 불가).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-diao-chan",
  name: "폐월",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'이성에게 받는 피해 30% 감소'(예전엔 모두에게서), 턴 종료 '병기 피해 +15%', '이번 턴에 초선을 때린 목표'에게 반격(예전엔 랜덤 적), 통솔 무시·회심 불가 구현"
    }
  ],
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
      "status": "ok"
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
      "buffs": [
        {
          "stat": "주는병기피해",
          "min": 0.075,
          "max": 0.15,
          "target": "highest_power_ally",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.3,
          "max": 0.6,
          "target": "damaged_me_this_turn",
          "ignoreDef": true,
          "noCrit": true
        }
      ],
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
    ],
    "_timing": "turnEnd",
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "buffs": [
            {
              "stat": "이성받는피해",
              "min": -0.15,
              "max": -0.3,
              "target": "self",
              "duration": 999,
              "maxStacks": 1,
              "inf": {
                "stats": [
                  "최고"
                ],
                "who": "self"
              }
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「매 턴 종료 시, 무력이 가장 높은 우군 단일 목표의 병기 피해가 15% 증가하며」
    c.buff(0);
    // 「이번 턴에 초선에게 피해를 준 목표에게 통솔을 무시하는 60%의 병기 피해를 1회 준다(회심 발동 불가)」
    c.damage(0);   // (이성 피해 감소는 parts — 전투 시작)
  },
});
