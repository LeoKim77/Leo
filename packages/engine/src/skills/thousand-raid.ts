// 천리기습 · 전법 · 추격 40%
// 원문: 일반 공격 후, 선공이 가장 낮은 적군 단일 목표에게 280%의 병기 피해(추가로 양측 선공 차이의 영향 받음)를 주며, 목표가 후열이면 추가로 100%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "thousand-raid",
  name: "천리기습",
  kind: "추격",
  isUnique: false,
  clauses: [
    {
      "text": "일반 공격 후, 선공이 가장 낮은 적군 단일 목표에게 280%의 병기 피해(추가로 양측 선공 차이의 영향 받음)를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 후열이면 추가로 100%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_50",
    "legacyName": "천리기습",
    "legacyType": "추격",
    "legacyProcRate": "40%",
    "raw": "일반 공격 후, 선공이 가장 낮은 적군 단일 목표에게 140%→280%의 병기 피해(추가로 양측 선공 차이의 영향 받음)를 주며, 목표가 후열이면 추가로 50%→100%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 2.8
        },
        {
          "dmgType": "병기",
          "min": 0.5,
          "max": 1,
          "condition": {
            "type": "position",
            "who": "target",
            "pos": "back"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "lowest_speed_enemy"
      ],
      "statusEffects": []
    },
    "clauses": [
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "선공이 가장 낮은 적군 단일 목표에게 140%→280%의 병기 피해(추가로 양측 선공 차이의 영향 받음)를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 후열이면 추가로 50%→100%의 병기 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 D06-targets",
      "reason": "원문 '선공이 가장 낮은 적군 단일 목표에게 280% … 목표가 후열이면 추가로 100%'. 대상이 랜덤이었고 후열 조건 없이 추가 피해가 항상 들어갔다."
    }
  },
  run(c) {
    // 「일반 공격 후, 선공이 가장 낮은 적군 단일 목표에게 280%의 병기 피해(추가로 양측 선공 차이의 영향 받음)를 주며」
    c.damage(0);   // 병기 140%→280%
    // 「목표가 후열이면 추가로 100%의 병기 피해를 준다」
    c.damage(1);   // 병기 50%→100%, 조건 position
  },
});
