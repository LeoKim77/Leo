// 연환계 · 고유 전법 · 지휘 100%
// 원문: 자신의 간파가 20%증가한다(지력의 영향 받음). 홀수 턴에 전체에 1턴 동안 연환을 부여한다. 연환: 피해를 받으면 우군 2명이 25%(지력의 영향 받음)의 피해 전달을 받는다.
// 원문 절 구현: ok / missing / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-pang-tong",
  name: "연환계",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "「연환」(피해 분산) 미지원. 간파 +20%만 반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신의 간파가 20%증가한다(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "홀수 턴에 전체에 1턴 동안 연환을 부여한다",
      "status": "missing"
    },
    {
      "text": "연환: 피해를 받으면 우군 2명이 25%(지력의 영향 받음)의 피해 전달을 받는다",
      "status": "missing"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "간파",
          "min": 0.2,
          "max": 0.2,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "「연환」(피해 분산) 미지원. 간파 +20%만 반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 간파 +20%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
