// 눈부신 자태 · 고유 전법 · 패시브 100%
// 원문: 전투 시작 시, 전체 아군이 눈짓을 획득한다. 눈짓: 받는 피해, 받는 추격 전법 피해, 받는 액티브 전법 피해가 16% 감소한다. 자신이 피해를 받은 후 전체 아군의 눈짓 효과가 2% 감소하며, 턴 종료 시까지 지속되고, 매 턴 최대 8회 감소한다. 4번째 턴부터 매 턴 행동 시, 랜덤 아군 2명의 병력을 회복한다(치유율 140%, 지력의 영향 받음).
// 원문 절 구현: ok / ok / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zou-shi",
  name: "눈부신 자태",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "고유 전법 녹화: 눈짓 감소는 자신이 피해를 받을 때마다(병기 한정·60% 아님) 2%, 턴 종료 시까지·매 턴 최대 8회. 회복은 4번째 턴부터 매 턴 행동 시"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 시, 전체 아군이 눈짓을 획득한다",
      "status": "ok"
    },
    {
      "text": "눈짓: 받는 피해",
      "status": "ok"
    },
    {
      "text": "받는 추격 전법 피해",
      "status": "ok"
    },
    {
      "text": "받는 액티브 전법 피해가 16% 감소한다",
      "status": "ok"
    },
    {
      "text": "자신이 피해를 받은 후 전체 아군의 눈짓 효과가 2% 감소하며",
      "status": "ok"
    },
    {
      "text": "턴 종료 시까지 지속되고",
      "status": "ok"
    },
    {
      "text": "매 턴 최대 8회 감소한다",
      "status": "ok"
    },
    {
      "text": "4번째 턴부터 매 턴 행동 시, 랜덤 아군 2명의 병력을 회복한다(치유율 140%, 지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.16,
          "max": -0.16,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "받는추격피해",
          "min": -0.16,
          "max": -0.16,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "받는액티브피해",
          "min": -0.16,
          "max": -0.16,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "maxPerTurn": 8
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는피해",
              "min": 0.02,
              "max": 0.02,
              "target": "all_ally",
              "duration": 1,
              "maxStacks": 8,
              "untilTurnEnd": true
            },
            {
              "stat": "받는추격피해",
              "min": 0.02,
              "max": 0.02,
              "target": "all_ally",
              "duration": 1,
              "maxStacks": 8,
              "untilTurnEnd": true
            },
            {
              "stat": "받는액티브피해",
              "min": 0.02,
              "max": 0.02,
              "target": "all_ally",
              "duration": 1,
              "maxStacks": 8,
              "untilTurnEnd": true
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      },
      {
        "_timing": "action",
        "onlyTurns": [
          4,
          5,
          6,
          7,
          8
        ],
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 1.4,
              "max": 1.4,
              "target": "random_ally_n"
            }
          ],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": true
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -16%, 대상 all_ally, 전투 종료까지, 최대 1중첩
    c.buff(1);   // 받는추격피해 -16%, 대상 all_ally, 전투 종료까지, 최대 1중첩
    c.buff(2);   // 받는액티브피해 -16%, 대상 all_ally, 전투 종료까지, 최대 1중첩
  },
});
