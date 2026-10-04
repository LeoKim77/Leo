// 연환계 · 고유 전법 · 지휘 100%
// 원문: 자신의 간파가 20%증가한다(지력의 영향 받음). 홀수 턴에 전체에 1턴 동안 연환을 부여한다. 연환: 피해를 받으면 우군 2명이 25%(지력의 영향 받음)의 피해 전달을 받는다.
// 원문 절 구현: ok / ok / approx
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
  revised: [
    {
      "date": "2026-10-04",
      "note": "연환 구현(FEAT-024): 홀수 턴 시작 시 적군 전체 1턴 연환 — 피해를 받으면 그 무장의 우군 2명이 25%(지력 영향) 피해 전달. '전체'는 적군 전체로 해석"
    }
  ],
  clauses: [
    {
      "text": "자신의 간파가 20%증가한다(지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "홀수 턴에 전체에 1턴 동안 연환을 부여한다",
      "status": "ok"
    },
    {
      "text": "연환: 피해를 받으면 우군 2명이 25%(지력의 영향 받음)의 피해 전달을 받는다",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "statusEffects": [
        {
          "name": "연환",
          "target": "all_enemy",
          "duration": 1,
          "turnCond": {
            "parity": "odd"
          },
          "data": {
            "ratio": 0.25
          }
        }
      ],
      "targets": [
        "all_enemy"
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "「연환」(피해 분산) 미지원. 간파 +20%만 반영",
    "replacedLegacy": false,
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "buffs": [
            {
              "stat": "간파",
              "min": 0.2,
              "max": 0.2,
              "target": "self",
              "duration": 999,
              "maxStacks": 1,
              "inf": {
                "stats": [
                  "지력"
                ],
                "who": "self"
              }
            }
          ]
        }
      }
    ]
  },
  run(c) {
    // 「홀수 턴에 전체에 1턴 동안 연환을 부여한다」
    // 「연환: 피해를 받으면 우군 2명이 25%(지력의 영향 받음)의 피해 전달을 받는다」
    c.status(0);   // 홀수 턴 시작 시 적군 전체 연환 1턴 (간파 +20%는 parts — 전투 시작)
  },
});
