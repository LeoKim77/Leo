// 제갈량 금병법〈출사표〉 · approx
// 원문: 홀수 턴에 랜덤 적군 2명이 받는 피해가 12% 증가한다. 짝수 턴에 랜덤 아군 2명이 받는 피해가 12% 감소한다.
// 원문 절 구현: approx / approx
import { defineManual } from './types.ts';

export default defineManual({
  id: "m-zhuge-liang-1",
  generalId: "zhuge-liang",
  name: "출사표",
  status: "approx",
  note: "\"홀수/짝수 턴에\"를 턴 시작 시 1턴 지속으로 해석",
  revised: [
    {
      "date": "2026-10-05",
      "note": "절 상태 정리 — '홀수/짝수 턴에' = 턴 시작 1턴 해석"
    }
  ],
  clauses: [
    {
      "text": "홀수 턴에 랜덤 적군 2명이 받는 피해가 12% 증가한다",
      "status": "approx"
    },
    {
      "text": "짝수 턴에 랜덤 아군 2명이 받는 피해가 12% 감소한다",
      "status": "approx"
    }
  ],
  def: {
    "parts": [
      {
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는피해",
              "min": 0.12,
              "max": 0.12,
              "target": "random_enemy_n",
              "duration": 1,
              "maxStacks": 1,
              "turnCond": {
                "parity": "odd"
              }
            },
            {
              "stat": "받는피해",
              "min": -0.12,
              "max": -0.12,
              "target": "random_ally_n",
              "duration": 1,
              "maxStacks": 1,
              "turnCond": {
                "parity": "even"
              }
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        },
        "_timing": "turnStart"
      }
    ]
  },
  runs: [
    // parts[0] — 시점 turnStart
    (c) => {
      c.buff(0);   // 받는피해 +12%, 대상 random_enemy_n, 1턴, 최대 1중첩
      c.buff(1);   // 받는피해 -12%, 대상 random_ally_n, 1턴, 최대 1중첩
    },
  ],
});
