// 연전연승 · 전법 · 패시브 100%
// 원문(도감 2026-10-07): 병기 피해를 준 후, 자신의 무력이 16포인트 증가하며, 최대 8회 중첩된다. 책략 피해를 준 후, 자신의 지력이 16포인트 증가하며, 최대 8회 중첩된다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "overwhelming-win",
  name: "연전연승",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 해외 번역 문구를 한국판 원문으로 교체(동작 같음)"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "병기 피해를 준 후, 자신의 무력이 16포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "최대 8회 중첩된다",
      "status": "ok"
    },
    {
      "text": "책략 피해를 준 후, 자신의 지력이 16포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "최대 8회 중첩된다",
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
