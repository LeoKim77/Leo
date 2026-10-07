// 구름과 바람 · 전법 · 액티브 60%
// 원문(도감 2026-10-07): 랜덤 적군 2명에게 190%의 병기 피해를 주며, 목표가 폭풍 상태면 2턴 동안 자신이 주는 피해가 15% 증가한다(2회 중첩 가능). 자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "wind-cloud",
  name: "구름과 바람",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "사용자 확인(R-057, 2026-10-07): 지금 해석 확정"
    },
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S1 전설): 180%→190%, \"목표가 폭풍이면 이번 피해 +25%\" → \"목표가 폭풍이면 2턴 동안 자신이 주는 피해 +15%(2회 중첩)\""
    },
    {
      "date": "2026-10-04",
      "note": "'목표가 폭풍이면 피해 +25%', '자신이 폭풍이면 피신 +10%' 조건 구현, 원문에 없는 폭풍 부여 제거"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 2명에게 190%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 폭풍 상태면 2턴 동안 자신이 주는 피해가 15% 증가한다(2회 중첩 가능)",
      "status": "ok",
      "reviewed": "폭풍 목표 1명당 1스택(한 시전 최대 2) — 사용자 확인 R-057",
      "impl": [
        "statusEffects[0]"
      ]
    },
    {
      "text": "자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_20",
    "legacyName": "구름과 바람",
    "legacyType": "액티브",
    "legacyProcRate": "60%",
    "raw": "랜덤 적군 2명에게 95%→190%의 병기 피해를 주며, 목표가 폭풍 상태면 2턴 동안 자신이 주는 피해가 7.5%→15% 증가한다(2회 중첩 가능). 자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 5%→10% 증가한다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.95,
          "max": 1.9,
          "target": "random_enemy_n"
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.075,
          "max": 0.15,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "피신",
          "min": 0.05,
          "max": 0.1,
          "target": "self",
          "duration": 2,
          "maxStacks": 1,
          "condition": {
            "type": "hasStatus",
            "who": "self",
            "status": "폭풍"
          }
        }
      ],
      "targets": [
        "random_enemy_n"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 90%→180%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 폭풍 상태면 이번 피해가 25% 증가한다",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 5%→10% 증가한다",
        "impl": [
          "buffs[0]",
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 목표마다: 「랜덤 적군 2명에게 190%의 병기 피해를 주며」 → 「목표가 폭풍 상태면 2턴 동안 자신이 주는 피해가 15% 증가한다(2회 중첩 가능)」
    c.targets('random_enemy_n').forEach((u, i) => {
      const storm = c.has(u, '폭풍');
      c.tag('w' + i, [u]);
      c.damage({ ...c.skill.effects.damage[0], target: 'tag:w' + i });
      if (storm) c.buff(0);
    });
    // 「자신이 폭풍 상태면 2턴 동안 자신의 피신 확률이 10% 증가한다」
    c.buff(1);   // 피신 +5%→10%, 대상 self, 2턴, 조건 hasStatus
  },
});
