// 전장의 노래 · 전법 · 액티브 65%
// 원문: 랜덤 아군 2명의 병력을 회복시키며(치유율 130%, 지력의 영향 받음) 2턴 동안 통솔을 16포인트 증가시킨다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "sing-wine",
  name: "전장의 노래",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "회복과 통솔 +16이 같은 랜덤 아군 2명에게"
    }
  ],
  clauses: [
    {
      "text": "랜덤 아군 2명의 병력을 회복시키며(치유율 130%, 지력의 영향 받음) 2턴 동안 통솔을 16포인트 증가시킨다",
      "status": "ok",
      "impl": [
        "statMods[0]",
        "heal[0]"
      ]
    }
  ],
  def: {
    "legacyId": "skill_45",
    "legacyName": "전장의 노래",
    "legacyType": "액티브",
    "legacyProcRate": "65%",
    "raw": "랜덤 아군 2명의 병력을 회복시키며(치유율 65%→130%, 지력의 영향 받음) 2턴 동안 통솔을 8→16포인트 증가시킨다.",
    "effects": {
      "heal": [
        {
          "min": 0.65,
          "max": 1.3,
          "target": "tag:two"
        }
      ],
      "statMods": [
        {
          "stat": "통솔",
          "min": 8,
          "max": 16,
          "target": "tag:two",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "targets": [
        "random_ally_n"
      ]
    },
    "clauses": [
      {
        "text": "랜덤 아군 2명의 병력을 회복시키며(치유율 65%→130%",
        "impl": [
          "heal[0]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음) 2턴 동안 통솔을 8→16포인트 증가시킨다",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    c.tag('two', c.targets('random_ally_n'));
    // 「랜덤 아군 2명의 병력을 회복시키며(치유율 130%, 지력의 영향 받음) 2턴 동안 통솔을 16포인트 증가시킨다」
    c.heal(0); c.statMod(0);
  },
});
