// 나라의 기둥 · 고유 전법 · 지휘 100%
// 원문: 홀수 턴 종료 시, 자신과 랜덤 우군 단일 목표에게 1스택의 방어을(를) 부여하며, 자신의 병력을 회복한다(치유율 180%, 지력과 통솔의 영향 받음).
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lu-zhi",
  name: "나라의 기둥",
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
      "text": "홀수 턴 종료 시, 자신과 랜덤 우군 단일 목표에게 1스택의 방어을(를) 부여하며",
      "status": "ok"
    },
    {
      "text": "자신의 병력을 회복한다(치유율 180%, 지력과 통솔의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnEnd",
    "onlyTurns": [
      1,
      3,
      5,
      7
    ],
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.8,
          "max": 1.8,
          "target": "self",
          "noStatTerm": true
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "방어",
          "target": "self_and_random_ally_1"
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「홀수 턴 종료 시, 자신과 랜덤 우군 단일 목표에게 1스택의 방어을(를) 부여하며」
    c.status(0);
    // 「자신의 병력을 회복한다(치유율 180%, 지력과 통솔의 영향 받음)」 (FIX-029 가산항 없음)
    c.heal(0);
  },
});
