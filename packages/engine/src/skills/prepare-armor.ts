// 병력 강화 · 전법 · 패시브 100%
// 원문(도감 2026-10-07): 자신의 반격 확률이 50% 증가한다(무력의 영향 받음). 일반 공격 성공 후 2턴 동안 자신이 받는 병기 피해가 5% 감소하며, 6회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "prepare-armor",
  name: "병력 강화",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 반격 확률에 무력 영향, 중첩 4회 → 6회"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준(수치 환산)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신의 반격 확률이 50% 증가한다(무력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "일반 공격 성공 후 2턴 동안 자신이 받는 병기 피해가 5% 감소하며",
      "status": "ok"
    },
    {
      "text": "6회 중첩될 수 있다",
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
          "maxStacks": 1,
          "inf": {
            "stats": [
              "무력"
            ],
            "who": "self"
          }
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
              "maxStacks": 6
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
    // 「자신의 반격 확률이 50% 증가한다(무력의 영향 받음)」 — 전투 시작 시 1회
    c.buff(0);
    // 「일반 공격 성공 후 2턴 동안 자신이 받는 병기 피해가 5% 감소하며, 6회 중첩될 수 있다」 — 트리거 효과(def.triggers)
  },
});
