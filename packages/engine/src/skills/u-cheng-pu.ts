// 흥왕의 위업 · 고유 전법 · 지휘 100%
// 원문: 전체 우군에게 병기 피해를 준 후, 60% 확률로 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음). 책략 피해를 준 후, 60% 확률로 2턴 동안 받는 피해가 14% 감소하며, 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cheng-pu",
  name: "흥왕의 위업",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "병기 피해 후 → 60% 회복, 책략 피해 후 → 60% 받는 피해 −14%(2중첩), 각각 피해를 준 그 우군에게 — 예전엔 60%를 두 번 굴리고(36%) 피해 유형 구분 없이 전원"
    }
  ],
  clauses: [
    {
      "text": "전체 우군에게 병기 피해를 준 후, 60% 확률로 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]"
      ]
    },
    {
      "text": "책략 피해를 준 후, 60% 확률로 2턴 동안 받는 피해가 14% 감소하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_47",
    "legacyName": "흥왕의 위업",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전체 아군에게 병기 피해를 준 후, 60% 확률로 병력을 회복한다(치유율 20%→40%, 지력과 통솔의 영향 받음). 책략 피해를 준 후, 60% 확률로 2턴 동안 받는 피해가 7%→14% 감소하며, 2회 중첩될 수 있다.",
    "effects": {
      "heal": [
        {
          "min": 0.2,
          "max": 0.4,
          "chance": null,
          "target": "tag:a"
        }
      ],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.07,
          "max": -0.14,
          "duration": 2,
          "maxStacks": 2,
          "chance": null,
          "target": "tag:a"
        }
      ],
      "targets": [
        "all_ally"
      ]
    },
    "chanceFixed": true,
    "clauses": [
      {
        "text": "전체 아군에게 병기 피해를 준 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "60% 확률로 병력을 회복한다(치유율 20%→40%",
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
        "text": "책략 피해를 준 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "60% 확률로 2턴 동안 받는 피해가 7%→14% 감소",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "2회 중첩될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "trigger": {
      "event": "damage",
      "role": "ally_dealt",
      "chance": 1
    }
  },
  run(c) {
    const e = c.eventCtx; if (!e || !e.attacker || !e.attacker.alive) return;
    c.tag('a', [e.attacker]);
    // 「전체 우군에게 병기 피해를 준 후, 60% 확률로 병력을 회복한다(치유율 40%, 지력과 통솔의 영향 받음)」
    if (e.dmgType === '병기' && c.chance(0.6)) c.heal(0);
    // 「책략 피해를 준 후, 60% 확률로 2턴 동안 받는 피해가 14% 감소하며」
    // 「2회 중첩될 수 있다」
    if (e.dmgType === '책략' && c.chance(0.6)) c.buff(0);
  },
});
