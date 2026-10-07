// 삼군 압도 · 전법 · 추격 55%
// 원문(도감 2026-10-07): 일반 공격 후, 3턴 동안 공격 목표의 무력, 지력, 통솔이 30포인트 감소하며, 최대 5회 중첩될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "drain-morale",
  name: "삼군 압도",
  kind: "추격",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 지속 2턴 → 3턴"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 3턴 동안 공격 목표의 무력",
      "status": "ok"
    },
    {
      "text": "지력",
      "status": "ok"
    },
    {
      "text": "통솔이 30포인트 감소하며",
      "status": "ok"
    },
    {
      "text": "최대 5회 중첩될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 3,
          "maxStacks": 5
        },
        {
          "stat": "지력",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 3,
          "maxStacks": 5
        },
        {
          "stat": "통솔",
          "min": -30,
          "max": -30,
          "target": "trigger_defender",
          "duration": 3,
          "maxStacks": 5
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 -30, 대상 trigger_defender, 3턴, 최대 5중첩
    c.statMod(1);   // 지력 -30, 대상 trigger_defender, 3턴, 최대 5중첩
    c.statMod(2);   // 통솔 -30, 대상 trigger_defender, 3턴, 최대 5중첩
  },
});
