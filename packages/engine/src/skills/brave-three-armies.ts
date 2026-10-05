// 용맹한 삼군 · 전법 · 패시브 100%
// 원문: 자신의 회유이(가) 30% 증가하며, 일반 공격 후, 자신이 주는 병기 피해가 6% 증가한다. 6회 중첩될 수 있다. 일반 공격을 3회 누적 시전한 후 랜덤 적군 단일 목표에게 200%의 병기 피해를 준다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "brave-three-armies",
  name: "용맹한 삼군",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-05",
      "note": "'일반 공격 후' 병기 피해 +6%(6중첩), '일반 공격 3회 누적마다' 200% — 예전엔 모든 피해 때마다 둘 다(200%가 매번)"
    }
  ],
  clauses: [
    {
      "text": "자신의 회유이(가) 30% 증가하며",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]"
      ]
    },
    {
      "text": "일반 공격 후, 자신이 주는 병기 피해가 6% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "6회 중첩될 수 있다",
      "status": "ok"
    },
    {
      "text": "일반 공격을 3회 누적 시전한 후 랜덤 적군 단일 목표에게 200%의 병기 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_62",
    "legacyName": "용맹한 삼군",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 회유이(가) 15%→30% 증가하며, 일반 공격 후, 자신이 주는 병기 피해가 3%→6% 증가한다. 6회 중첩될 수 있다. 일반 공격을 3회 누적 시전한 후 랜덤 적군 단일 목표에게 100%→200%의 병기 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 2,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "주는병기피해",
          "min": 0.03,
          "max": 0.06,
          "target": "self",
          "duration": 999,
          "maxStacks": 6
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "preciseApplied": true,
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "afterBasic": true,
      "chance": 1
    },
    "alwaysOnBuffs": [
      {
        "stat": "회유",
        "min": 0.15,
        "max": 0.3,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 회유이(가) 15%→30% 증가",
        "impl": [
          "alwaysOnBuffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "일반 공격 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신이 주는 병기 피해가 3%→6% 증가한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "6회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "일반 공격을 3회 누적 시전한 후 랜덤 적군 단일 목표에게 100%→200%의 병기 피해를 준다",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // 「일반 공격 후, 자신이 주는 병기 피해가 6% 증가한다」
    // 「6회 중첩될 수 있다」
    c.buff(0);
    // 「일반 공격을 3회 누적 시전한 후 랜덤 적군 단일 목표에게 200%의 병기 피해를 준다」
    c.unit._braveBasics = (c.unit._braveBasics || 0) + 1;
    if (c.unit._braveBasics % 3 === 0) c.damage(0);
  },
});
