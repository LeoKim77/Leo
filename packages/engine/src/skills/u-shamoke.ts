// 완력 · 고유 전법 · 패시브 100%
// 원문: 자신이 주는 피해가 60% 증가하며, 매 턴 피해를 3회 받은 후, 자신이 1턴 동안 공포 상태가 된다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-shamoke",
  name: "완력",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "매 턴 3번째 피격 직후 1턴 공포(턴마다 1회)",
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
      "text": "자신이 주는 피해가 60% 증가하며",
      "status": "ok"
    },
    {
      "text": "매 턴 피해를 3회 받은 후, 자신이 1턴 동안 공포 상태가 된다",
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
          "stat": "주는피해",
          "min": 0.6,
          "max": 0.6,
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
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [
            {
              "name": "공포",
              "target": "self",
              "duration": 1
            }
          ],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "매 턴 3번째 피격 직후 1턴 공포(턴마다 1회)",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신이 주는 피해가 60% 증가하며」
    c.buff(0);
  },
  partRuns: [
    (c) => {
      // 「매 턴 피해를 3회 받은 후, 자신이 1턴 동안 공포 상태가 된다」 — 그 턴 3번째 피격 직후 1번
      const u = c.unit;
      if (!u._wanryeok || u._wanryeok.turn !== c.turn) u._wanryeok = { turn: c.turn, n: 0 };
      u._wanryeok.n += 1;
      if (u._wanryeok.n === 3) c.status(0);
    },
  ],
});
