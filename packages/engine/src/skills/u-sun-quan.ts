// 강동 호거 · 고유 전법 · 지휘 100%
// 원문: 자신이 액티브 전법을 학습할 때마다 전체 우군의 액티브 전법 발동률이 7% 증가하고, 받는 병기 피해가 5% 감소한다. 자신이 액티브 전법이 아닌 전법을 학습할 때마다 전체 우군의 28% 연타 확률이 증가하고, 받는 책략 피해가 5%(모든 효과는 자신의 최고 속성 영향을 받음) 감소한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sun-quan",
  name: "강동 호거",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음) · 최고 속성/무력 영향 반영(FEAT-024)"
    }
  ],
  clauses: [
    {
      "text": "자신이 액티브 전법을 학습할 때마다 전체 우군의 액티브 전법 발동률이 7% 증가하고",
      "status": "ok",
      "impl": [
        "special:loadout_count_buff"
      ]
    },
    {
      "text": "받는 병기 피해가 5% 감소한다",
      "status": "ok",
      "impl": [
        "special:loadout_count_buff"
      ]
    },
    {
      "text": "자신이 액티브 전법이 아닌 전법을 학습할 때마다 전체 우군의 28% 연타 확률이 증가하고",
      "status": "ok",
      "impl": [
        "special:loadout_count_buff"
      ]
    },
    {
      "text": "받는 책략 피해가 5%(모든 효과는 자신의 최고 속성 영향을 받음) 감소한다",
      "status": "ok",
      "impl": [
        "special:loadout_count_buff"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_3",
    "legacyName": "강동 호거",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "자신이 액티브 전법을 학습할 때마다 전체 아군의 액티브 전법 발동률이 3.5%→7% 증가하고, 받는 병기 피해가 2.5%→5% 감소한다. 자신이 액티브 전법이 아닌 전법을 학습할 때마다 전체 아군의 14%→28% 연타 확률이 증가하고, 받는 책략 피해가 2.5%→5%(모든 효과는 자신의 최고 속성 영향을 받음) 감소한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "manualOverride": true,
    "special": "loadout_count_buff",
    "clauses": [
      {
        "text": "자신이 액티브 전법을 학습할 때마다 전체 아군의 액티브 전법 발동률이 3.5%→7% 증가",
        "impl": [
          "special:loadout_count_buff"
        ],
        "status": "special"
      },
      {
        "text": "받는 병기 피해가 2.5%→5% 감소한다",
        "impl": [
          "special:loadout_count_buff"
        ],
        "status": "special"
      },
      {
        "text": "자신이 액티브 전법이 아닌 전법을 학습할 때마다 전체 아군의 14%→28% 연타 확률이 증가",
        "impl": [
          "special:loadout_count_buff"
        ],
        "status": "special"
      },
      {
        "text": "받는 책략 피해가 2.5%→5%(모든 효과는 자신의 최고 속성 영향을 받음) 감소한다",
        "impl": [
          "special:loadout_count_buff"
        ],
        "status": "special"
      }
    ]
  },
  run(c) {
    // 실행할 효과 없음 (상시 효과·트리거·특수 처리만 있는 전법)
  },
});
