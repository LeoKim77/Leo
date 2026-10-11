// 예측 불가 · 고유 전법 · 지휘 100%
// 원문: 받는 피해가 병기 피해면 자신이 받는 병기 피해가 10% 감소한다. 그렇지 않으면 자신이 받는 책략 피해가 10% 감소하며, 최대 5회 발동된다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cao-zhen",
  name: "예측 불가",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "피해를 받을 때마다 그 피해 종류에 따라 감소 1중첩, 전투 중 최대 5회",
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
      "text": "받는 피해가 병기 피해면 자신이 받는 병기 피해가 10% 감소한다",
      "status": "ok"
    },
    {
      "text": "그렇지 않으면 자신이 받는 책략 피해가 10% 감소하며",
      "status": "ok"
    },
    {
      "text": "최대 5회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "maxPerBattle": 5
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는병기피해",
              "min": -0.1,
              "max": -0.1,
              "target": "self",
              "duration": 999,
              "maxStacks": 5
            },
            {
              "stat": "받는책략피해",
              "min": -0.1,
              "max": -0.1,
              "target": "self",
              "duration": 999,
              "maxStacks": 5
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
    "authoredNote": "피해를 받을 때마다 그 피해 종류에 따라 감소 1중첩, 전투 중 최대 5회",
    "replacedLegacy": false
  },
  run(c) {
    // 상시 효과 없음 — 피격 반응은 partRuns[0]
  },
  partRuns: [
    (c) => {
      // 「받는 피해가 병기 피해면 자신이 받는 병기 피해가 10% 감소한다」「그렇지 않으면 자신이 받는 책략 피해가 10% 감소하며」「최대 5회 발동된다」(maxPerBattle 5)
      if (c.eventCtx && c.eventCtx.dmgType === '병기') c.buff(0); else c.buff(1);
    },
  ],
});
