// 일인천군 · 전법 · 패시브 100%
// 원문: 일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 100%의 피해 전달을(를) 준다. 자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "ten-thousand",
  name: "일인천군",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "추가 피해를 '일반 공격 후, 무력이 목표보다 높으면 그 목표에게 30%'로 (예전엔 매 행동 60% 확률로 랜덤 적 2명)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 100%의 피해 전달을(를) 준다",
      "status": "ok"
    },
    {
      "text": "자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_63",
    "legacyName": "일인천군",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 50%→100%의 피해 전달을(를) 준다. 자신의 무력이 목표보다 높으면 추가로 15%→30%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.15,
          "max": 0.3,
          "target": "trigger_defender",
          "condition": {
            "type": "statCompareUnits",
            "who1": "attacker",
            "who2": "target",
            "stat": "무력",
            "op": ">"
          }
        }
      ],
      "targets": []
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 50%→100%의 피해 전달을(를) 준다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신의 무력이 목표보다 높으면 추가로 15%→30%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ],
    "transfer": {
      "chance": 0.6,
      "ratio": 1,
      "target": "target_allies",
      "count": 2
    },
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "afterBasic": true,
      "chance": 1
    }
  },
  run(c) {
    // 「일반 공격 후, 60% 확률로 공격 목표의 우군 2명에게 이번 일반 공격의 100%의 피해 전달을(를) 준다」
    // (피해 전달 60%·우군 2명은 엔진 일반 공격 처리 — def.transfer)
    // 「자신의 무력이 목표보다 높으면 추가로 30%의 병기 피해를 준다」
    c.damage(0);
  },
});
