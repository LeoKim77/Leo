// 백병 혈전 · 고유 전법 · 패시브 100%
// 원문: 전투 시작 시, 자신의 선공과 무력이 20포인트 증가하며, 연타 확률이 100% 증가하고, 통솔이 15 포인트 감소한다. 아군 전체가 일반 공격을 4회 시전할 때마다, 아군 전체의 관통이(가) 2% 증가한다(무력의 영향을 받음), 중첩이 가능하며 전투 종료까지 지속된다.
// 원문 절 구현: ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xu-chu",
  name: "백병 혈전",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음) · 최고 속성/무력 영향 반영(FEAT-024)"
    }
  ],
  clauses: [
    {
      "text": "전투 시작 시, 자신의 선공과 무력이 20포인트 증가하며",
      "status": "ok",
      "impl": [
        "statMods[0]",
        "statMods[1]"
      ]
    },
    {
      "text": "연타 확률이 100% 증가하고",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "통솔이 15포인트 감소한다",
      "status": "ok",
      "impl": [
        "statMods[2]"
      ]
    },
    {
      "text": "우군 전체가 일반 공격을 4회 누적 시전할 때마다",
      "status": "ok",
      "impl": [
        "special:team_basic_attack_stack"
      ]
    },
    {
      "text": "우군 전체의 방어 관통이(가) 2% 증가한다(무력의 영향 받음)",
      "status": "ok",
      "impl": [
        "special:team_basic_attack_stack"
      ]
    },
    {
      "text": "중첩이 가능하며 전투 종료까지 지속된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_22",
    "legacyName": "백병 혈전",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "전투 시작 시, 자신의 선공과 무력이 10→20포인트 증가하며, 연타 확률이 50%→100% 증가하고, 통솔이 15포인트 감소한다. 아군 전체가 일반 공격을 4회 누적 시전할 때마다, 아군 전체의 방어 관통이(가) 1%→2% 증가한다(무력의 영향 받음).",
    "effects": {
      "statMods": [
        {
          "stat": "선공",
          "min": 10,
          "max": 20,
          "target": "self"
        },
        {
          "stat": "무력",
          "min": 10,
          "max": 20,
          "target": "self"
        },
        {
          "stat": "통솔",
          "min": -15,
          "max": -15,
          "target": "self"
        }
      ],
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "연타확률",
          "min": 0.5,
          "max": 1,
          "target": "self"
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "specialApplied": true,
    "special": "team_basic_attack_stack",
    "clauses": [
      {
        "text": "전투 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신의 선공과 무력이 10→20포인트 증가",
        "impl": [
          "statMods[0]",
          "statMods[1]"
        ],
        "status": "ok"
      },
      {
        "text": "연타 확률이 50%→100% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "통솔이 15포인트 감소한다",
        "impl": [
          "statMods[2]"
        ],
        "status": "ok"
      },
      {
        "text": "아군 전체가 일반 공격을 4회 누적 시전할 때마다",
        "impl": [
          "special:team_basic_attack_stack"
        ],
        "status": "special"
      },
      {
        "text": "아군 전체의 방어 관통이(가) 1%→2% 증가한다(무력의 영향 받음)",
        "impl": [
          "special:team_basic_attack_stack"
        ],
        "status": "special"
      }
    ]
  },
  run(c) {
    // 「전투 시작 시, 자신의 선공과 무력이 20포인트 증가하며」
    c.statMod(0);   // 선공 10→20, 대상 self
    c.statMod(1);   // 무력 10→20, 대상 self
    // 「통솔이 15포인트 감소한다」
    c.statMod(2);   // 통솔 -15, 대상 self
    // 「연타 확률이 100% 증가하고」
    c.buff(0);   // 연타확률 +50%→100%, 대상 self
  },
});
