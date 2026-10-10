// 초선차전 · 고유 전법 · 지휘 100%
// 원문: 자신의 심리 공격이(가) 24% 증가하며, 자신이 피해를 주거나 받으면 50% 확률로 랜덤 적군 단일 목표에게 80%의 책략 피해를 준다. 매 턴 5회 발동될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhuge-liang",
  name: "초선차전",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    },
    {
      "date": "2026-10-05",
      "note": "녹화 확인: 초선차전 피해가 초선차전을 다시 판정(피격 1번에 3~5연속, 턴 5회 상한) — 모든 트리거 공통 규칙(FEAT-027, R-050)"
    }
  ],
  clauses: [
    {
      "text": "자신의 심리 공격이(가) 24% 증가하며",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]"
      ]
    },
    {
      "text": "자신이 피해를 주거나 받으면 50% 확률로 랜덤 적군 단일 목표에게 80%의 책략 피해를 주고",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    },
    {
      "text": "매 턴 5회 발동될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_4",
    "legacyName": "초선차전",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "자신의 심리 공격이(가) 12%→24% 증가하며, 자신이 피해를 주거나 받으면 50% 확률로 랜덤 적군 단일 목표에게 40%→80%의 책략 피해를 주고, 매 턴 5회 발동될 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.8
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1",
        "self"
      ],
      "statusEffects": []
    },
    "trigger": {
      "event": "damage",
      "role": "either",
      "chance": 0.5,
      "maxPerTurn": 5
    },
    "triggerApplied": true,
    "alwaysOnBuffs": [
      {
        "stat": "심리공격",
        "min": 0.12,
        "max": 0.24,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 심리 공격이(가) 12%→24% 증가",
        "impl": [
          "alwaysOnBuffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 피해를 주거나 받으면 50% 확률로 랜덤 적군 단일 목표에게 40%→80%의 책략 피해를 주고",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 5회 발동될 수 있다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // 「자신이 피해를 주거나 받으면 50% 확률로 랜덤 적군 단일 목표에게 80%의 책략 피해를 주고」
    c.damage(0);   // 책략 40%→80%
  },
});
