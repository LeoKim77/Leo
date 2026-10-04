// 압도적 권력 · 고유 전법 · 지휘 100%
// 원문: 매 턴 행동 시, 전체 적군과 우군의 통솔을 20포인트 탈취하고, 전체 적군에게 60%의 병기와 책략 피해(추가로 통솔의 영향 받음)를 준다. 탈취한 통솔은 턴 종료 시 반환되며, 탈취 효과는 매 턴 10% 감소한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-dong-zhuo",
  name: "압도적 권력",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'전체 적군과 우군의 통솔 20 탈취'(자신에게 더함, 턴 종료 시 반환, 매 턴 10% 감소) 구현 — 예전엔 적군만 감소"
    }
  ],
  clauses: [
    {
      "text": "매 턴 행동 시, 전체 적군과 우군의 통솔을 20포인트 탈취하고",
      "status": "ok",
      "reviewed": "적군 통솔 감소만 구현. 우군 통솔 탈취·자신 가산은 미지원"
    },
    {
      "text": "전체 적군에게 60%의 병기와 책략 피해(추가로 통솔의 영향 받음)를 준다",
      "status": "ok",
      "impl": [
        "damage[0].statScale",
        "damage[1]",
        "damage[1].statScale"
      ]
    },
    {
      "text": "탈취한 통솔은 턴 종료 시 반환되며",
      "status": "ok",
      "reviewed": "1턴 지속"
    },
    {
      "text": "탈취 효과는 매 턴 10% 감소한다",
      "status": "ok",
      "reviewed": "turnScale"
    }
  ],
  def: {
    "legacyId": "uskill_13",
    "legacyName": "압도적 권력",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시, 전체 적군과 아군의 통솔을 10→20포인트 탈취하고, 전체 적군에게 30%→60%의 병기와 책략 피해(추가로 통솔의 영향 받음)를 준다. 탈취한 통솔은 턴 종료 시 반환되며, 탈취 효과는 매 턴 10% 감소한다.",
    "effects": {
      "statMods": [
        {
          "stat": "통솔",
          "min": -20,
          "max": -20,
          "target": "all_enemy",
          "untilTurnEnd": true,
          "maxStacks": 1,
          "turnScale": {
            "perTurn": -0.1,
            "mode": "mult"
          }
        },
        {
          "stat": "통솔",
          "min": -20,
          "max": -20,
          "target": "all_friend",
          "untilTurnEnd": true,
          "maxStacks": 1,
          "turnScale": {
            "perTurn": -0.1,
            "mode": "mult"
          }
        }
      ],
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.3,
          "max": 0.6,
          "statScale": {
            "stat": "통솔"
          }
        },
        {
          "dmgType": "책략",
          "min": 0.3,
          "max": 0.6,
          "statScale": {
            "stat": "통솔"
          }
        }
      ],
      "targets": [
        "all_enemy"
      ]
    },
    "clauses": [
      {
        "text": "매 턴 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 적군과 아군의 통솔을 10→20포인트 탈취",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "전체 적군에게 30%→60%의 병기와 책략 피해(추가로 통솔의 영향 받음)를 준다",
        "impl": [
          "damage[0].statScale",
          "damage[1]",
          "damage[1].statScale"
        ],
        "status": "ok"
      },
      {
        "text": "탈취한 통솔은 턴 종료 시 반환",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "탈취 효과는 매 턴 10% 감소한다",
        "impl": [],
        "status": "MISSING"
      }
    ],
    "overrideNote": {
      "date": "2026-10-02",
      "found": "감사 S09 / 절 검토",
      "reason": "레벨 보간이 뒤집혀 10레벨에서 통솔 10만 탈취했다. 원문 20 탈취."
    }
  },
  run(c) {
    // 「매 턴 행동 시, 전체 적군과 우군의 통솔을 20포인트 탈취하고」
    const n = c.enemiesOf(c.unit).length + c.friendsOf(c.unit).length;
    c.statMod(0); c.statMod(1);
    c.statMod({ stat: '통솔', min: 20 * n, max: 20 * n, target: 'self', untilTurnEnd: true, maxStacks: 1, turnScale: { perTurn: -0.1, mode: 'mult' } });   // 탈취분
    // 「전체 적군에게 60%의 병기와 책략 피해(추가로 통솔의 영향 받음)를 준다」
    c.damage(0); c.damage(1);
  },
});
