// 보보위영 · 전법 · 지휘 100%
// 원문: 매 턴 시작 시, 60% 확률로 자신과 무작위 아군 1명이 받는 피해가 24% 감소합니다(통솔의 영향을 받음). 지속시간은 1턴입니다. 이 효과의 발동 확률은 매 턴 10%씩 증가하며, 각 무장은 독립적으로 판정합니다.
// 원문 절 구현: approx / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "step-camp",
  name: "보보위영",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "통솔 영향 미반영. 확률 60%에서 매 턴 +10%p",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 시작 시, 60% 확률로 자신과 무작위 아군 1명이 받는 피해가 24% 감소합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "지속시간은 1턴입니다",
      "status": "ok"
    },
    {
      "text": "이 효과의 발동 확률은 매 턴 10%씩 증가하며",
      "status": "ok"
    },
    {
      "text": "각 무장은 독립적으로 판정합니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.6,
          "turnCond": {
            "turns": [
              1
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.6,
          "turnCond": {
            "turns": [
              1
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.7,
          "turnCond": {
            "turns": [
              2
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.7,
          "turnCond": {
            "turns": [
              2
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.8,
          "turnCond": {
            "turns": [
              3
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.8,
          "turnCond": {
            "turns": [
              3
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.9,
          "turnCond": {
            "turns": [
              4
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.9,
          "turnCond": {
            "turns": [
              4
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              5
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              5
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              6
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              6
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              7
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              7
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              8
            ]
          }
        },
        {
          "stat": "받는피해",
          "min": -0.24,
          "max": -0.24,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 1,
          "turnCond": {
            "turns": [
              8
            ]
          }
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "통솔 영향 미반영. 확률 60%에서 매 턴 +10%p",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -24%, 대상 self, 확률 60%, 1턴, 최대 1중첩
    c.buff(1);   // 받는피해 -24%, 대상 random_ally_1, 확률 60%, 1턴, 최대 1중첩
    c.buff(2);   // 받는피해 -24%, 대상 self, 확률 70%, 1턴, 최대 1중첩
    c.buff(3);   // 받는피해 -24%, 대상 random_ally_1, 확률 70%, 1턴, 최대 1중첩
    c.buff(4);   // 받는피해 -24%, 대상 self, 확률 80%, 1턴, 최대 1중첩
    c.buff(5);   // 받는피해 -24%, 대상 random_ally_1, 확률 80%, 1턴, 최대 1중첩
    c.buff(6);   // 받는피해 -24%, 대상 self, 확률 90%, 1턴, 최대 1중첩
    c.buff(7);   // 받는피해 -24%, 대상 random_ally_1, 확률 90%, 1턴, 최대 1중첩
    c.buff(8);   // 받는피해 -24%, 대상 self, 확률 100%, 1턴, 최대 1중첩
    c.buff(9);   // 받는피해 -24%, 대상 random_ally_1, 확률 100%, 1턴, 최대 1중첩
    c.buff(10);   // 받는피해 -24%, 대상 self, 확률 100%, 1턴, 최대 1중첩
    c.buff(11);   // 받는피해 -24%, 대상 random_ally_1, 확률 100%, 1턴, 최대 1중첩
    c.buff(12);   // 받는피해 -24%, 대상 self, 확률 100%, 1턴, 최대 1중첩
    c.buff(13);   // 받는피해 -24%, 대상 random_ally_1, 확률 100%, 1턴, 최대 1중첩
    c.buff(14);   // 받는피해 -24%, 대상 self, 확률 100%, 1턴, 최대 1중첩
    c.buff(15);   // 받는피해 -24%, 대상 random_ally_1, 확률 100%, 1턴, 최대 1중첩
  },
});
