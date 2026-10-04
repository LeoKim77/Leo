// 주도면밀 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 자신과 지력이 가장 높은 우군의 액티브 전법 발동률이 6% 증가한다. 자신이 액티브 전법 발동 성공 후, 70% 확률로 1회 추가 발동한다(추가로 전법 준비할 필요 없음).
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guo-jia",
  name: "주도면밀",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "전투 시작 시, 자신과 지력이 가장 높은 우군의 액티브 전법 발동률이 6% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0]",
        "buffs[1]"
      ]
    },
    {
      "text": "자신이 액티브 전법 발동 성공 후, 70% 확률로 1회 추가 발동한다(추가로 전법 준비할 필요 없음)",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "uskill_8",
    "legacyName": "주도면밀",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "전투 시작 시, 자신과 지력이 가장 높은 우군의 액티브 전법 발동률이 3%→6% 증가한다. 자신이 액티브 전법 발동 성공 후, 35%→70% 확률로 1회 추가 발동한다(추가로 전법 준비할 필요 없음).",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.03,
          "max": 0.06,
          "target": "self",
          "duration": 999
        },
        {
          "stat": "액티브발동률",
          "min": 0.03,
          "max": 0.06,
          "target": "highest_intel_ally",
          "duration": 999
        },
        {
          "stat": "액티브재발동",
          "min": 0.35,
          "max": 0.7,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "manualOverride": true,
    "procRateFixed": true,
    "clauses": [
      {
        "text": "전투 시작 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "자신과 지력이 가장 높은 우군의 액티브 전법 발동률이 3%→6% 증가한다",
        "impl": [
          "buffs[0]",
          "buffs[1]"
        ],
        "status": "ok"
      },
      {
        "text": "자신이 액티브 전법 발동 성공 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "35%→70% 확률로 1회 추가 발동한다(추가로 전법 준비할 필요 없음)",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「전투 시작 시, 자신과 지력이 가장 높은 우군의 액티브 전법 발동률이 6% 증가한다」
    c.buff(0);   // 액티브발동률 +3%→6%, 대상 self, 전투 종료까지
    c.buff(1);   // 액티브발동률 +3%→6%, 대상 highest_intel_ally, 전투 종료까지
    c.buff(2);   // 액티브재발동 +35%→70%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
