// 장군의 무용 · 고유 전법 · 액티브 100%
// 원문: 2턴 동안 자신이 주는 피해가 2.4% 증가한다. 2턴 동안 자신에게 침묵을(를) 부여한다. 랜덤 적군 단일 목표에게 255%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-hua-xiong",
  name: "장군의 무용",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "침묵은 자신에게 2턴(예전엔 적에게 무장 해제·침묵), 250% 피해 + 같은 목표에 일반 공격 1회"
    },
    {
      "date": "2026-10-05",
      "note": "게임 캡처(2026-10-05): '2턴 동안 자신이 주는 피해 2.4% 증가' 추가(엑셀 누락), 피해 250% → 255%(1레벨 127.5%×2)"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 자신이 주는 피해가 2.4% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "2턴 동안 자신에게 침묵을(를) 부여한다",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "랜덤 적군 단일 목표에게 255%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)",
      "status": "ok",
      "impl": [
        "damage[0]",
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_53",
    "legacyName": "장군의 무용",
    "legacyType": "액티브",
    "legacyProcRate": "100%",
    "raw": "2턴 동안 자신에게 침묵을(를) 부여한다. 랜덤 적군 단일 목표에게 125%→250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시).",
    "effects": {
      "statusEffects": [
        {
          "name": "침묵",
          "target": "self",
          "duration": 2
        }
      ],
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.275,
          "max": 2.55,
          "target": "random_enemy_1",
          "tag": "m"
        },
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "tag:m",
          "asBasicAttack": true
        }
      ],
      "targets": [
        "random_enemy_1"
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.024,
          "max": 0.024,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ]
    },
    "clauses": [
      {
        "text": "2턴 동안 자신에게 침묵을(를) 부여한다",
        "impl": [
          "statusEffects[1]"
        ],
        "status": "ok"
      },
      {
        "text": "랜덤 적군 단일 목표에게 125%→250%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)",
        "impl": [
          "damage[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「2턴 동안 자신이 주는 피해가 2.4% 증가한다」
    c.buff(0);
    // 「2턴 동안 자신에게 침묵을(를) 부여한다」
    c.status(0);
    // 「랜덤 적군 단일 목표에게 255%의 병기 피해와 일반 공격을 1회 시전한다(무장 해제 상태 무시)」
    c.damage(0); c.damage(1);
  },
});
