// 용맹의 화신 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표가 탈주병을(를) 생성하게 한다(지력의 영향 받음). 이후 해당 적군에게 360%의 책략 피해를 주며, 목표가 전열이면 피해 계수가 80% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cheng-yu",
  name: "용맹의 화신",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    },
    {
      "date": "2026-10-06",
      "note": "탈주병 기본식 1.49×스탯으로(녹화 2026-10-06 관우 표본) — 지력 기준은 확인 대기"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표가 탈주병을(를) 생성하게 한다(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "이후 해당 적군에게 360%의 책략 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 전열이면 피해 계수가 80% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_43",
    "legacyName": "용맹의 화신",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 단일 목표가 탈주병을(를) 생성하게 한다(지력의 영향 받음). 이후 해당 적군에게 180%→360%의 책략 피해를 주며, 목표가 전열이면 피해 계수가 80% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.8,
          "max": 3.6,
          "target": "tag:main",
          "conditionalBonusMult": {
            "condition": {
              "type": "isFront",
              "who": "target"
            },
            "mult": 0.8
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [],
      "statusEffects": [
        {
          "name": "탈주병",
          "target": "random_enemy_1",
          "tag": "main"
        }
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 단일 목표가 탈주병을(를) 생성하게 한다(지력의 영향 받음)",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "해당 적군에게 180%→360%의 책략 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 전열이면 피해 계수가 80% 증가한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "desertionStat": "지력",
    "desertionCoef": 1.49,
    "desertionBase": 0
  },
  run(c) {
    // 「이후 해당 적군에게 360%의 책략 피해를 주며」
    c.damage(0);   // 책략 180%→360%, 대상 tag:main
    // 「랜덤 적군 단일 목표가 탈주병을(를) 생성하게 한다(지력의 영향 받음)」
    c.status(0);   // 탈주병, 대상 random_enemy_1
  },
});
