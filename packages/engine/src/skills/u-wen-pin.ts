// 형강 사수 · 고유 전법 · 액티브 60%
// 원문: 자신의 통솔이 40포인트 증가하며, 2턴 지속되는 정신 회복을(를) 획득한다.
// 원문 절 구현: approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-wen-pin",
  name: "형강 사수",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "통솔 40 증가의 지속·중첩이 원문에 없어 전투 끝까지·중첩 제한 없음으로 처리(검증 대기)",
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
      "text": "자신의 통솔이 40포인트 증가하며",
      "status": "approx"
    },
    {
      "text": "2턴 지속되는 정신 회복을(를) 획득한다",
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
          "stat": "통솔",
          "min": 40,
          "max": 40,
          "target": "self",
          "duration": 999,
          "maxStacks": 99
        }
      ],
      "statusEffects": [
        {
          "name": "정신 회복",
          "target": "self",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "통솔 40 증가의 지속·중첩이 원문에 없어 전투 끝까지·중첩 제한 없음으로 처리(검증 대기)",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신의 통솔이 40포인트 증가하며」
    c.statMod(0);
    // 「2턴 지속되는 정신 회복을(를) 획득한다」
    c.status(0);
  },
});
