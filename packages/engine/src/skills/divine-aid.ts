// 신의 가호 · 전법 · 패시브 100%
// 원문: 액티브 전법 발동률이 8% 증가하며, 액티브 전법 피해가 15% 증가한다.
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "divine-aid",
  name: "신의 가호",
  kind: "패시브",
  isUnique: false,
  clauses: [
    {
      "text": "액티브 전법 발동률이 8% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "액티브 전법 피해가 15% 증가한다",
      "status": "missing"
    }
  ],
  def: {
    "legacyId": "skill_70",
    "legacyName": "신의 가호",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "액티브 전법 발동률이 4%→8% 증가하며, 액티브 전법 피해가 7.5%→15% 증가한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.04,
          "max": 0.08,
          "target": "self",
          "duration": 999
        },
        {
          "stat": "주는액티브피해",
          "min": 0.075,
          "max": 0.15,
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
        "text": "액티브 전법 발동률이 4%→8% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "액티브 전법 피해가 7.5%→15% 증가한다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「액티브 전법 발동률이 8% 증가하며」
    c.buff(0);   // 액티브발동률 +4%→8%, 대상 self, 전투 종료까지
    c.buff(1);   // 주는액티브피해 +7.5%→15%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
