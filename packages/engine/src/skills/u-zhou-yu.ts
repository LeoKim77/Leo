// 기지의 승리 · 고유 전법 · 지휘 100%
// 원문: 전투 중, 전체 적군과 우군이 이상 상태 효과를 받으면 자신이 70% 확률로 기지 발동: 랜덤 적군 2명에게 즉시 60%의 책략 피해를 준다. 매 턴 기지는 최대 4회 발동되며, 기지 총 4회 발동 후, 전체 우군의 병력을 회복한다(치유율 40%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhou-yu",
  name: "기지의 승리",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "전투 중, 전체 적군과 우군이 이상 상태 효과를 받으면 자신이 70% 확률로 기지 발동: 랜덤 적군 2명에게 즉시 60%의 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    },
    {
      "text": "매 턴 기지는 최대 4회 발동되며",
      "status": "ok"
    },
    {
      "text": "기지 총 4회 발동 후, 전체 우군의 병력을 회복한다(치유율 40%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_10",
    "legacyName": "기지의 승리",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 중, 전체 적군과 아군이 이상 상태 효과를 받으면 자신이 70% 확률로 기지 발동: 랜덤 적군 2명에게 즉시 30%→60%의 책략 피해를 준다. 매 턴 기지는 최대 4회 발동되며, 기지 총 4회 발동 후, 전체 아군의 병력을 회복한다(치유율 20%→40%, 지력의 영향 받음).",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.3,
          "max": 0.6
        }
      ],
      "targets": [
        "random_enemy_n"
      ],
      "heal": [
        {
          "min": 0.2,
          "max": 0.4,
          "target": "all_ally",
          "afterProcs": 4
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": []
    },
    "trigger": {
      "event": "debuff",
      "role": "any",
      "chance": 0.7,
      "maxPerTurn": 4,
      "abnormalOnly": true
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "전투 중",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "전체 적군과 아군이 이상 상태 효과를 받으면 자신이 70% 확률로 기지 발동: 랜덤 적군 2명에게 즉시 30%→60%의 책략 피해를 준다",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 기지는 최대 4회 발동",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "기지 총 4회 발동 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "전체 아군의 병력을 회복한다(치유율 20%→40%",
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
    // 「전투 중, 전체 적군과 우군이 이상 상태 효과를 받으면 자신이 70% 확률로 기지 발동: 랜덤 적군 2명에게 즉시 60%의 책략 피해를 준다」
    c.damage(0);   // 책략 30%→60%
    // 「기지 총 4회 발동 후, 전체 우군의 병력을 회복한다(치유율 40%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 20%→40%, 대상 all_ally
  },
});
