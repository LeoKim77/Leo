// 재해 이용 · 전법 · 액티브 50%
// 원문: 자신을 제외한 전체 적군과 아군에게 140%의 책략 피해를 준다. 적군 목표가 화공 상태면 40% 확률로 1턴 동안 지속되는 혼란을(를) 부여한다. 적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다. 적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "calamity",
  name: "재해 이용",
  kind: "액티브",
  isUnique: false,
  clauses: [
    {
      "text": "자신을 제외한 전체 적군과 아군에게 140%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "적군 목표가 화공 상태면 40% 확률로 1턴 동안 지속되는 혼란을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[3]",
        "statusEffects[4]"
      ]
    },
    {
      "text": "적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[1]",
        "statusEffects[5]"
      ]
    },
    {
      "text": "적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]",
        "statusEffects[2]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_32",
    "legacyName": "재해 이용",
    "legacyType": "액티브",
    "legacyProcRate": "50%",
    "raw": "자신을 제외한 전체 적군과 아군에게 70%→140%의 책략 피해를 준다. 적군 목표가 화공 상태면 40% 확률로 1턴 동안 지속되는 혼란을(를) 부여한다. 적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다. 적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.7,
          "max": 1.4,
          "target": "all_except_self"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "all_enemy",
        "self"
      ],
      "statusEffects": [
        "폭풍",
        "무장 해제",
        "침묵",
        "혼란",
        "화공",
        "홍수"
      ]
    },
    "clauses": [
      {
        "text": "자신을 제외한 전체 적군과 아군에게 70%→140%의 책략 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "적군 목표가 화공 상태면 40% 확률로 1턴 동안 지속되는 혼란을(를) 부여한다",
        "impl": [
          "statusEffects[3]",
          "statusEffects[4]"
        ],
        "status": "ok"
      },
      {
        "text": "적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다",
        "impl": [
          "statusEffects[1]",
          "statusEffects[5]"
        ],
        "status": "ok"
      },
      {
        "text": "적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[0]",
          "statusEffects[2]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-04",
      "found": "공용 규칙 R-028 대상 정리 (자신과 우군 혼합 대상 점검)",
      "reason": "'자신을 제외한 전체 적군과 우군에게 140% 책략 피해' — 적군에게만 주던 피해를 자신 뺀 전장 전원으로"
    }
  },
  run(c) {
    // 「자신을 제외한 전체 적군과 아군에게 140%의 책략 피해를 준다」
    c.damage(0);   // 책략 70%→140%, 대상 all_except_self
    // 「적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다」
    c.status(0);   // 폭풍
    // 「적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다」
    c.status(1);   // 무장 해제
    // 「적군 목표가 폭풍 상태면 40% 확률로 1턴 동안 지속되는 침묵을(를) 부여한다」
    c.status(2);   // 침묵
    // 「적군 목표가 화공 상태면 40% 확률로 1턴 동안 지속되는 혼란을(를) 부여한다」
    c.status(3);   // 혼란
    c.status(4);   // 화공
    // 「적군 목표가 홍수 상태면 40% 확률로 1턴 동안 지속되는 무장 해제를(를) 부여한다」
    c.status(5);   // 홍수
  },
});
