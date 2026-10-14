// 옹량 지휘 · 고유 전법 · 패시브 100%
// 원문: 자신이 받는 피해가 14% 감소하며(통솔의 영향 받음), 자신이 병기 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 무력을 20포인트 감소시킨다, 2회 중첩될 수 있다. 자신이 책략 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 지력을 20포인트 감소시킨다, 2회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guo-huai",
  name: "옹량 지휘",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "자신이 받는 피해가 14% 감소하며(통솔의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "자신이 병기 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 무력을 20포인트 감소시킨다",
      "status": "ok"
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "ok"
    },
    {
      "text": "자신이 책략 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 지력을 20포인트 감소시킨다",
      "status": "ok"
    },
    {
      "text": "2회 중첩될 수 있다",
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
          "min": -0.14,
          "max": -0.14,
          "target": "self",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
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
          "chance": 1
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "무력",
              "min": -20,
              "max": -20,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 2
            },
            {
              "stat": "지력",
              "min": -20,
              "max": -20,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 2
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신이 받는 피해가 14% 감소하며(통솔의 영향 받음)」
    c.buff(0);
  },
  partRuns: [
    (c) => {
      const t = c.eventCtx && c.eventCtx.dmgType;
      // 「자신이 병기 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 무력을 20포인트 감소시킨다, 2회 중첩될 수 있다」
      if (t === '병기' && c.chance(0.6)) c.statMod(0);
      // 「자신이 책략 피해를 받은 후, 60% 확률로 2턴 동안 공격자의 지력을 20포인트 감소시킨다, 2회 중첩될 수 있다」
      else if (t === '책략' && c.chance(0.6)) c.statMod(1);
    },
  ],
});
