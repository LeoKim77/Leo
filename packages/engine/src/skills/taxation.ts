// 세금 과징수 · 전법 · 패시브 100%
// 원문: 전투 중 디버프 효과 부여 후, 자신의 병력을 회복하며(치유율 40%, 지력과 통솔의 영향 받음), 2턴 동안 자신이 받는 피해가 10% 감소한다. 4회 중첩될 수 있다. 턴마다 최대 10회 발동된다.
// 원문 절 구현: ok / ok / note / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "taxation",
  name: "세금 과징수",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "전투 중 디버프 효과 부여 후, 자신의 병력을 회복하며(치유율 40%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "reviewed": "자신이 디버프 부여 시 회복 트리거 구현"
    },
    {
      "text": "2턴 동안 자신이 받는 피해가 10% 감소한다",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "4회 중첩될 수 있다",
      "status": "note"
    },
    {
      "text": "턴마다 최대 10회 발동된다",
      "status": "ok",
      "reviewed": "maxPerTurn 10"
    }
  ],
  def: {
    "legacyId": "skill_76",
    "legacyName": "세금 과징수",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "전투 중 디버프 효과 부여 후, 자신의 병력을 회복하며(치유율 20%→40%, 지력과 통솔의 영향 받음), 2턴 동안 자신이 받는 피해가 5%→10% 감소한다. 4회 중첩될 수 있다. 턴마다 최대 10회 발동된다.",
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 0.2,
          "max": 0.4
        }
      ],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.05,
          "max": -0.1,
          "duration": 2,
          "maxStacks": 4
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "trigger": {
      "maxPerTurn": 10,
      "event": "debuff",
      "role": "self_cast",
      "chance": 1
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "전투 중 디버프 효과 부여 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "자신의 병력을 회복",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "(치유율 20%→40%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력과 통솔의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "2턴 동안 자신이 받는 피해가 5%→10% 감소한다",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "4회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "턴마다 최대 10회 발동된다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.heal(0);   // 치유율 20%→40%
    // 「2턴 동안 자신이 받는 피해가 10% 감소한다」
    c.buff(0);   // 받는피해 -5%→-10%, 2턴, 최대 4중첩
  },
});
