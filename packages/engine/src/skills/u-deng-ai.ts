// 둔전령 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안 전체 적군과 우군이 주는 피해가 35% 감소한다. 매 턴 시작 시, 전체 우군이 받는 회복 효과가 10% 증가하며, 해당 효과는 중첩될 수 있다. 이후 전체 우군의 병력이 회복된다(치유율 100%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-deng-ai",
  name: "둔전령",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "받는 회복 증가 중첩 상한 제거(원문 상한 없음)"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안 전체 적군과 우군이 주는 피해가 35% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "매 턴 시작 시, 전체 우군이 받는 회복 효과가 10% 증가하며",
      "status": "ok"
    },
    {
      "text": "해당 효과는 중첩될 수 있다",
      "status": "ok"
    },
    {
      "text": "이후 전체 우군의 병력이 회복된다(치유율 100%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_23",
    "legacyName": "둔전령",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 후 첫 3턴 동안 전체 적군과 아군이 주는 피해가 17.5%→35% 감소한다. 매 턴 시작 시, 전체 아군이 받는 회복 효과가 10% 증가하며, 해당 효과는 중첩될 수 있다. 이후 전체 아군의 병력이 회복된다(치유율 50%→100%, 지력의 영향 받음).",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.5,
          "max": 1,
          "target": "all_ally"
        }
      ],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.175,
          "max": -0.35,
          "target": "all_enemy",
          "duration": 3,
          "maxStacks": 1,
          "turnCond": {
            "maxTurn": 3
          }
        },
        {
          "stat": "주는피해",
          "min": -0.175,
          "max": -0.35,
          "target": "all_ally",
          "duration": 3,
          "maxStacks": 1,
          "turnCond": {
            "maxTurn": 3
          }
        },
        {
          "stat": "받는회복량",
          "min": 0.1,
          "max": 0.1,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 99
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "preciseApplied": true,
    "clauses": [
      {
        "text": "전투 시작 후 첫 3턴 동안 전체 적군과 아군이 주는 피해가 17.5%→35% 감소한다",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군이 받는 회복 효과가 10% 증가",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "해당 효과는 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군의 병력이 회복된다(치유율 50%→100%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「이후 전체 우군의 병력이 회복된다(치유율 100%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 50%→100%, 대상 all_ally
    // 「전투 시작 후 첫 3턴 동안 전체 적군과 우군이 주는 피해가 35% 감소한다」
    c.buff(0);   // 주는피해 -17.5%→-35%, 대상 all_enemy, 3턴, 최대 1중첩
    c.buff(1);   // 주는피해 -17.5%→-35%, 대상 all_ally, 3턴, 최대 1중첩
    c.buff(2);   // 받는회복량 +10%, 대상 all_ally, 전투 종료까지, 최대 99중첩
  },
});
