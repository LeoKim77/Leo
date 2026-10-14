// 뛰어난 인재 · 고유 전법 · 패시브 100%
// 원문: 자신의 묘책 확률이 12% 증가하며, 짝수 턴에 적군 전체에게 100%의 책략 피해를 준다.
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ma-su",
  name: "뛰어난 인재",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "짝수 턴 피해를 그 턴 행동 시점에 처리(시점 검증 대기)",
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
      "text": "자신의 묘책 확률이 12% 증가하며",
      "status": "ok"
    },
    {
      "text": "짝수 턴에 적군 전체에게 100%의 책략 피해를 준다",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "묘책",
          "min": 0.12,
          "max": 0.12,
          "target": "self",
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
        "_timing": "action",
        "onlyTurns": [
          2,
          4,
          6,
          8
        ],
        "effects": {
          "damage": [
            {
              "dmgType": "책략",
              "min": 1,
              "max": 1,
              "target": "all_enemy"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "짝수 턴 피해를 그 턴 행동 시점에 처리(시점 검증 대기)",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신의 묘책 확률이 12% 증가하며」
    c.buff(0);
  },
  partRuns: [
    (c) => {
      // 「짝수 턴에 적군 전체에게 100%의 책략 피해를 준다」 (onlyTurns 2·4·6·8, 행동 시점)
      c.damage(0);
    },
  ],
});
