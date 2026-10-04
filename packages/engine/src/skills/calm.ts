// 고요한 제압 · 전법 · 패시브 100%
// 원문: 홀수 턴에 자신이 일반 공격할 수 없으며, 받는 병기 피해, 받는 일반 공격 피해, 받는 추격 전법 피해가 35% 감소한다. 짝수 턴에 자신이 액티브 전법을 발동할 수 없으며, 받는 책략 피해, 받는 액티브 전법 피해가 35% 감소한다.
// 원문 절 구현: ok / ok / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "calm",
  name: "고요한 제압",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "홀수 턴에 자신이 일반 공격할 수 없으며",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 병기 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 일반 공격 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 추격 전법 피해가 35% 감소한다",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "짝수 턴에 자신이 액티브 전법을 발동할 수 없으며",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 책략 피해",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    },
    {
      "text": "받는 액티브 전법 피해가 35% 감소한다",
      "status": "ok",
      "reviewed": "자기 제약(selfRestrict) + 홀짝 턴 피해 감소 구현"
    }
  ],
  def: {
    "legacyId": "skill_77",
    "legacyName": "고요한 제압",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "홀수 턴에 자신이 일반 공격할 수 없으며, 받는 병기 피해, 받는 일반 공격 피해, 받는 추격 전법 피해가 17.5%→35% 감소한다. 짝수 턴에 자신이 액티브 전법을 발동할 수 없으며, 받는 책략 피해, 받는 액티브 전법 피해가 17.5%→35% 감소한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는병기피해",
          "min": -0.175,
          "max": -0.35,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          }
        },
        {
          "stat": "받는책략피해",
          "min": -0.175,
          "max": -0.35,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "even"
          }
        },
        {
          "stat": "받는일반공격피해",
          "min": -0.35,
          "max": -0.35,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          }
        },
        {
          "stat": "받는추격피해",
          "min": -0.35,
          "max": -0.35,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "odd"
          }
        },
        {
          "stat": "받는액티브피해",
          "min": -0.35,
          "max": -0.35,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "turnCond": {
            "parity": "even"
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
        "text": "받는 추격 전법 피해가 17.5%→35% 감소한다",
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
        "text": "받는 액티브 전법 피해가 17.5%→35% 감소한다",
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
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는병기피해 -17.5%→-35%, 대상 self, 1턴, 최대 1중첩
    c.buff(1);   // 받는책략피해 -17.5%→-35%, 대상 self, 1턴, 최대 1중첩
    c.buff(2);   // 받는일반공격피해 -35%, 대상 self, 1턴, 최대 1중첩
    c.buff(3);   // 받는추격피해 -35%, 대상 self, 1턴, 최대 1중첩
    c.buff(4);   // 받는액티브피해 -35%, 대상 self, 1턴, 최대 1중첩
  },
});
