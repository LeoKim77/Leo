// 반란 평정 · 고유 전법 · 지휘 100%
// 원문: 자신의 통솔이 60포인트 증가하며, 자신이 피해를 받은 후, 50% 확률로 2턴 동안 공격자가 주는 피해를 10% 감소시킨다, 4회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huangfu-song-hero",
  name: "반란 평정",
  kind: "지휘",
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
      "text": "자신의 통솔이 60포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "자신이 피해를 받은 후, 50% 확률로 2턴 동안 공격자가 주는 피해를 10% 감소시킨다",
      "status": "ok"
    },
    {
      "text": "4회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 60,
          "max": 60,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 0.5
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "주는피해",
              "min": -0.1,
              "max": -0.1,
              "target": "trigger_attacker",
              "duration": 2,
              "maxStacks": 4
            }
          ],
          "statMods": [],
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
    // 「자신의 통솔이 60포인트 증가하며」
    c.statMod(0);
  },
  partRuns: [
    (c) => {
      // 「자신이 피해를 받은 후, 50% 확률로 2턴 동안 공격자가 주는 피해를 10% 감소시킨다, 4회 중첩될 수 있다」
      c.buff(0);
    },
  ],
});
