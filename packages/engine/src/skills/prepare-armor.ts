// 병력 강화 · 전법 · 패시브 100%
// 원문: 자신의 반격률이 50% 상승합니다. 일반 공격에 성공하면 자신이 받는 병기 피해가 5% 감소하며 2턴 지속, 최대 4회 중첩됩니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "prepare-armor",
  name: "병력 강화",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준(수치 환산)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신의 반격률이 50% 상승합니다",
      "status": "ok"
    },
    {
      "text": "일반 공격에 성공하면 자신이 받는 병기 피해가 5% 감소하며 2턴 지속",
      "status": "ok"
    },
    {
      "text": "최대 4회 중첩됩니다",
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
          "stat": "반격확률",
          "min": 0.5,
          "max": 0.5,
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
          "role": "dealt",
          "afterBasic": true,
          "chance": 1,
          "maxPerTurn": 99
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "받는병기피해",
              "min": -0.05,
              "max": -0.05,
              "target": "self",
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
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준(수치 환산)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 반격확률 +50%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
