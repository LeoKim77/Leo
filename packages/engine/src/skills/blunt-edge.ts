// 기선제압 · 전법 · 지휘 100%
// 원문(시즌3 미리보기 2026-10-07): 전투 시작 후 3턴 동안 무력이 가장 높은 적군 단일 목표가 주는 병기 피해가 25% 감소하며(통솔의 영향 받음), 지력이 가장 높은 적군 단일 목표가 주는 책략 피해가 25% 감소한다(통솔의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "blunt-edge",
  name: "기선제압",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "통솔 영향 반영",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 해외 번역 문구를 한국판 원문으로 교체"
    },
    {
      "date": "2026-10-05",
      "note": "통솔 영향 반영"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 후 3턴 동안 무력이 가장 높은 적군 단일 목표가 주는 병기 피해가 25% 감소하며(통솔의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "지력이 가장 높은 적군 단일 목표가 주는 책략 피해가 25% 감소한다(통솔의 영향 받음)",
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
          "stat": "주는병기피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_power_enemy",
          "duration": 3,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        },
        {
          "stat": "주는책략피해",
          "min": -0.25,
          "max": -0.25,
          "target": "highest_intel_enemy",
          "duration": 3,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "통솔"
            ],
            "who": "self"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "통솔 영향 반영 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는병기피해 -25%, 대상 highest_power_enemy, 3턴, 최대 1중첩
    c.buff(1);   // 주는책략피해 -25%, 대상 highest_intel_enemy, 3턴, 최대 1중첩
  },
});
