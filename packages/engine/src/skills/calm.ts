// 고요한 제압 · 전법 · 패시브 100%
// 원문(도감 2026-10-07): 홀수 턴에 자신이 일반 공격할 수 없으며, 자신과 랜덤 우군 단일 목표가 자신과 랜덤 우군 단일 목표가 받는 병기 피해, 받는 일반 공격 피해, 받는 추격 전법 피해가 20% 감소한다(통솔의 영향을 받음). 짝수 턴에 자신이 액티브 전법을 발동할 수 없으며, 자신과 랜덤 우군 단일 목표가 받는 책략 피해, 받는 액티브 전법 피해가 20% 감소한다(통솔의 영향을 받음).
// 원문 절 구현: ok / ok / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "calm",
  name: "고요한 제압",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S1 전설): 35% 자신 → 20%(통솔 영향) 자신과 랜덤 우군 단일 목표. 매 턴 같은 우군 1명에게 그 턴의 감소를 함께 건다. 버그 수정: 시점을 매 턴 시작으로(예전엔 0턴에 한 번만 걸려 짝수 턴 감소가 영구, 홀수 턴 감소는 없었음)"
    }
  ],
  clauses: [
    {
      "text": "홀수 턴에 자신이 일반 공격할 수 없으며",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "자신과 랜덤 우군 단일 목표가 받는 병기 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 일반 공격 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 추격 전법 피해가 20% 감소한다(통솔의 영향을 받음)",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "짝수 턴에 자신이 액티브 전법을 발동할 수 없으며",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "자신과 랜덤 우군 단일 목표가 받는 책략 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 액티브 전법 피해가 20% 감소한다(통솔의 영향을 받음)",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    }
  ],
  def: {
    "_timing": "turnStart",
    "legacyId": "skill_77",
    "legacyName": "고요한 제압",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "홀수 턴에 자신이 일반 공격할 수 없으며, 자신과 랜덤 우군 단일 목표가 받는 병기 피해, 받는 일반 공격 피해, 받는 추격 전법 피해가 10%→20% 감소한다(통솔의 영향을 받음). 짝수 턴에 자신이 액티브 전법을 발동할 수 없으며, 자신과 랜덤 우군 단일 목표가 받는 책략 피해, 받는 액티브 전법 피해가 10%→20% 감소한다(통솔의 영향을 받음).",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는병기피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:calm",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는책략피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:calm",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "even"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는일반공격피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:calm",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는추격피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:calm",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는액티브피해",
          "min": -0.1,
          "max": -0.2,
          "target": "tag:calm",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "even"
          },
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        }
      ],
      "statMods": [],
      "targets": [
        "self"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "홀수 턴에 자신이 일반 공격할 수 없",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "받는 병기 피해",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "받는 일반 공격 피해",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "받는 추격 전법 피해가 10%→20% 감소한다(통솔의 영향을 받음)",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "짝수 턴에 자신이 액티브 전법을 발동할 수 없",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "받는 책략 피해",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "받는 액티브 전법 피해가 10%→20% 감소한다(통솔의 영향을 받음)",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "selfRestrict": {
      "oddNoBasic": true,
      "evenNoActive": true
    },
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 S09 / 절 검토",
      "reason": "원문의 감소 항목 중 받는 일반 공격·추격 피해(홀수 턴), 받는 액티브 피해(짝수 턴)가 빠져 있었다."
    }
  },
  run(c) {
    // 「자신과 랜덤 우군 단일 목표가」 — 매 턴 우군 1명을 뽑아 그 턴의 감소를 자신과 함께 건다
    const f = c.pick(c.friendsOf(c.unit));
    c.tag('calm', f ? [c.unit, f] : [c.unit]);
    // 홀수 턴 「받는 병기 피해, 받는 일반 공격 피해, 받는 추격 전법 피해가 20% 감소한다(통솔의 영향을 받음)」
    // 짝수 턴 「받는 책략 피해, 받는 액티브 전법 피해가 20% 감소한다(통솔의 영향을 받음)」 (turnCond 로 홀짝 구분)
    c.buff(0);   // 받는병기피해 -17.5%→-35%, 대상 self, 1턴, 최대 1중첩
    c.buff(1);   // 받는책략피해 -17.5%→-35%, 대상 self, 1턴, 최대 1중첩
    c.buff(2);   // 받는일반공격피해 -35%, 대상 self, 1턴, 최대 1중첩
    c.buff(3);   // 받는추격피해 -35%, 대상 self, 1턴, 최대 1중첩
    c.buff(4);   // 받는액티브피해 -35%, 대상 self, 1턴, 최대 1중첩
  },
});
