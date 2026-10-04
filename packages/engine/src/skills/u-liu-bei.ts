// 백성과 함께 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 전체 우군의 통솔이 18포인트 증가하며(지력의 영향 받음), 매 턴 종료 시, 전체 우군의 병력을 회복한다(치유율 100%, 지력의 영향 받음). 병력이 가장 낮은 우군 단일 목표의 디버프 상태 1가지를 제거하고, 1회 추가로 회복시킨다(치유율 90%, 지력이 영향 받음).
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-liu-bei",
  name: "백성과 함께",
  kind: "지휘",
  isUnique: true,
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
      "damage": [],
      "heal": [
        {
          "min": 0.5,
          "max": 1
        },
        {
          "min": 0.45,
          "max": 0.9
        }
      ],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 9,
          "max": 18,
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "targets": [
        "all_ally",
        "lowest_hp_ally",
        "random_ally_n"
      ],
      "statusEffects": [],
      "dispel": [
        {
          "target": "lowest_hp_ally",
          "count": 1
        }
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
    ]
  },
  run(c) {
    // 「전투 시작 시, 전체 우군의 통솔이 18포인트 증가하며(지력의 영향 받음)」
    c.statMod(0);   // 통솔 9→18, 전투 종료까지, 최대 1중첩
    // 「매 턴 종료 시, 전체 우군의 병력을 회복한다(치유율 100%, 지력의 영향 받음)」
    c.heal(0);   // 치유율 50%→100%
    c.heal(1);   // 치유율 45%→90%
    // 「병력이 가장 낮은 우군 단일 목표의 디버프 상태 1가지를 제거하고」
    c.dispel(0);   // 디버프 1가지 제거, 대상 lowest_hp_ally
  },
});
