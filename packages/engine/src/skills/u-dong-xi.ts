// 도약일격 · 고유 전법 · 패시브 100%
// 원문: 자신이 정신 회복 상태를 획득하고, 매 턴 행동 시, 자신이 받는 회복 효과가 10% 증가한다.
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-dong-xi",
  name: "도약일격",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "받는 회복 효과 증가는 매 턴 누적(상한 없음)으로 처리",
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
      "text": "자신이 정신 회복 상태를 획득하고",
      "status": "ok"
    },
    {
      "text": "매 턴 행동 시, 자신이 받는 회복 효과가 10% 증가한다",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "정신 회복",
          "target": "self",
          "duration": 999
        }
      ],
      "targets": []
    },
    "parts": [
      {
        "_timing": "action",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는회복량",
              "min": 0.1,
              "max": 0.1,
              "target": "self",
              "duration": 999,
              "maxStacks": 99
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "받는 회복 효과 증가는 매 턴 누적(상한 없음)으로 처리",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신이 정신 회복 상태를 획득하고」
    c.status(0);
  },
  partRuns: [
    (c) => {
      // 「매 턴 행동 시, 자신이 받는 회복 효과가 10% 증가한다」
      c.buff(0);
    },
  ],
});
