// 백성과 함께 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 전체 우군의 통솔이 18포인트 증가하며(지력의 영향 받음), 매 턴 종료 시, 전체 우군의 병력을 회복한다(치유율 100%, 지력의 영향 받음). 병력이 가장 낮은 우군 단일 목표의 디버프 상태 1가지를 제거하고, 1회 추가로 회복시킨다(치유율 90%, 지력이 영향 받음).
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-liu-bei",
  name: "백성과 함께",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "통솔 +18(지력 영향)은 전투 시작 1회, 회복·디버프 제거·추가 회복은 '매 턴 종료 시' (예전엔 매 행동 시작에 전부)"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 시, 전체 우군의 통솔이 18포인트 증가하며(지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "statMods[0]"
      ]
    },
    {
      "text": "매 턴 종료 시, 전체 우군의 병력을 회복한다(치유율 100%, 지력의 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    },
    {
      "text": "병력이 가장 낮은 우군 단일 목표의 디버프 상태 1가지를 제거하고",
      "status": "ok",
      "impl": [
        "dispel[0]"
      ]
    },
    {
      "text": "1회 추가로 회복시킨다(치유율 90%, 지력이 영향 받음)",
      "status": "ok",
      "impl": [
        "heal[0]",
        "heal[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_1",
    "legacyName": "백성과 함께",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 시, 전체 아군의 통솔이 9→18포인트 증가하며(지력의 영향 받음), 매 턴 종료 시, 전체 아군의 병력을 회복한다(치유율 50%→100%, 지력의 영향 받음). 병력이 가장 낮은 아군 단일 목표의 디버프 상태 1가지를 제거하고, 1회 추가로 회복시킨다(치유율 45%→90%, 지력이 영향 받음).",
    "effects": {
      "heal": [
        {
          "min": 0.5,
          "max": 1,
          "target": "all_ally"
        },
        {
          "min": 0.45,
          "max": 0.9,
          "target": "lowest_hp_ally"
        }
      ],
      "dispel": [
        {
          "target": "lowest_hp_ally",
          "count": 1
        }
      ],
      "targets": [
        "all_ally"
      ]
    },
    "clauses": [
      {
        "text": "전투 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군의 통솔이 9→18포인트 증가",
        "impl": [
          "statMods[0]"
        ],
        "status": "ok"
      },
      {
        "text": "(지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "매 턴 종료 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "전체 아군의 병력을 회복한다(치유율 50%→100%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력의 영향 받음)",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "병력이 가장 낮은 아군 단일 목표의 디버프 상태 1가지를 제거",
        "impl": [
          "dispel[0]"
        ],
        "status": "ok"
      },
      {
        "text": "1회 추가로 회복시킨다(치유율 45%→90%",
        "impl": [
          "heal[0]",
          "heal[1]"
        ],
        "status": "ok"
      },
      {
        "text": "지력이 영향 받음)",
        "impl": [],
        "status": "NOTE"
      }
    ],
    "_timing": "turnEnd",
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "statMods": [
            {
              "stat": "통솔",
              "min": 9,
              "max": 18,
              "duration": 999,
              "maxStacks": 1,
              "target": "all_ally",
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
    // 「매 턴 종료 시, 전체 우군의 병력을 회복한다(치유율 100%, 지력의 영향 받음)」
    c.heal(0);
    // 「병력이 가장 낮은 우군 단일 목표의 디버프 상태 1가지를 제거하고」
    c.tag('low', c.targets('lowest_hp_ally'));
    c.dispel({ target: 'tag:low', count: 1 });
    // 「1회 추가로 회복시킨다(치유율 90%, 지력이 영향 받음)」
    c.heal({ ...c.skill.effects.heal[1], target: 'tag:low' });
  },
});
