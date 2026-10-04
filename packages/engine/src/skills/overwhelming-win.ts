// 연전연승 · 전법 · 패시브 100%
// 원문: 병기 피해를 주면 자신의 무력이 16 상승하고, 책략 피해를 주면 지력이 16 상승합니다. 각각 최대 8회 중첩됩니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "overwhelming-win",
  name: "연전연승",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "병기 피해를 주면 자신의 무력이 16 상승하고",
      "status": "ok"
    },
    {
      "text": "책략 피해를 주면 지력이 16 상승합니다",
      "status": "ok"
    },
    {
      "text": "각각 최대 8회 중첩됩니다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "damage",
      "role": "dealt",
      "filterDmgType": "병기",
      "chance": 1,
      "maxPerTurn": 99
    },
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": 16,
          "max": 16,
          "target": "self",
          "duration": 999,
          "maxStacks": 8
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "dealt",
          "filterDmgType": "책략",
          "chance": 1,
          "maxPerTurn": 99
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "지력",
              "min": 16,
              "max": 16,
              "target": "self",
              "duration": 999,
              "maxStacks": 8
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 16, 대상 self, 전투 종료까지, 최대 8중첩
  },
});
