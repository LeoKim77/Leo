// 겸손한 자세 · 고유 전법 · 액티브 65%
// 원문: 랜덤 적군 단일 목표에게 220%의 책략과 병기 피해를 준다. 목표의 무력이 지력보다 높으면 무장 해제을(를) 부여하며, 반대일 경우 침묵을(를) 부여한다. 1턴 지속.
// 원문 절 구현: ok / ok / ok / note
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xu-shu",
  name: "겸손한 자세",
  kind: "액티브",
  isUnique: true,
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 220%의 책략과 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    },
    {
      "text": "목표의 무력이 지력보다 높으면 무장 해제을(를) 부여하며",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "반대일 경우 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[1]"
      ]
    },
    {
      "text": "1턴 지속",
      "status": "note"
    }
  ],
  def: {
    "legacyId": "uskill_31",
    "legacyName": "겸손한 자세",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "랜덤 적군 단일 목표에게 110%→220%의 책략과 병기 피해를 준다. 목표의 무력이 지력보다 높으면 무장 해제을(를) 부여하며, 반대일 경우 침묵을(를) 부여한다. 1턴 지속.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.1,
          "max": 2.2,
          "target": "random_enemy_1",
          "tag": "main"
        },
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 2.2,
          "target": "tag:main"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:main",
          "condition": {
            "type": "statCompareSelf",
            "who": "target",
            "stat1": "무력",
            "stat2": "지력",
            "op": ">"
          }
        },
        {
          "name": "침묵",
          "target": "tag:main",
          "condition": {
            "type": "statCompareSelf",
            "who": "target",
            "stat1": "무력",
            "stat2": "지력",
            "op": "<"
          }
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표에게 110%→220%의 책략과 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      },
      {
        "text": "목표의 무력이 지력보다 높으면 무장 해제을(를) 부여",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "반대일 경우 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "1턴 지속",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 110%→220%, 대상 random_enemy_1
    // 「랜덤 적군 단일 목표에게 220%의 책략과 병기 피해를 준다」
    c.damage(1);   // 병기 110%→220%, 대상 tag:main
    // 「목표의 무력이 지력보다 높으면 무장 해제을(를) 부여하며」
    c.status(0);   // 무장 해제, 대상 tag:main, 조건 statCompareSelf
    // 「반대일 경우 침묵을(를) 부여한다」
    c.status(1);   // 침묵, 대상 tag:main, 조건 statCompareSelf
  },
});
