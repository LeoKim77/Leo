// 공성계 · 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 3턴 동안, 적군과 아군 전체의 액티브 전법 발동률이 14% 감소합니다(지력의 영향을 받음). 4턴 시작 시, 아군 중 지력이 가장 높은 단일 무장이 가하는 책략 피해가 16% 증가하고(지력의 영향을 받음), 아군 중 지력이 가장 낮은 단일 무장이 받는 책략 피해가 16% 감소합니다(지력의 영향을 받음).
// 원문 절 구현: ok / approx / approx / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "empty-city",
  name: "공성계",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후 첫 3턴 동안",
      "status": "ok"
    },
    {
      "text": "적군과 아군 전체의 액티브 전법 발동률이 14% 감소합니다(지력의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "4턴 시작 시, 아군 중 지력이 가장 높은 단일 무장이 가하는 책략 피해가 16% 증가하고(지력의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "아군 중 지력이 가장 낮은 단일 무장이 받는 책략 피해가 16% 감소합니다(지력의 영향을 받음)",
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
          "stat": "액티브발동률",
          "min": -0.14,
          "max": -0.14,
          "target": "all_enemy",
          "duration": 3,
          "maxStacks": 1
        },
        {
          "stat": "액티브발동률",
          "min": -0.14,
          "max": -0.14,
          "target": "all_ally",
          "duration": 3,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnStart",
        "onlyTurns": [
          4
        ],
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "주는책략피해",
              "min": 0.16,
              "max": 0.16,
              "target": "highest_intel_ally",
              "duration": 999,
              "maxStacks": 1
            },
            {
              "stat": "받는책략피해",
              "min": -0.16,
              "max": -0.16,
              "target": "lowest_intel_ally",
              "duration": 999,
              "maxStacks": 1
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
    "authoredNote": "지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 액티브발동률 -14%, 대상 all_enemy, 3턴, 최대 1중첩
    c.buff(1);   // 액티브발동률 -14%, 대상 all_ally, 3턴, 최대 1중첩
  },
});
