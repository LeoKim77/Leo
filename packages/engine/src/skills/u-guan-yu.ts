// 화하 진압 · 고유 전법 · 액티브 45%
// 원문: 2턴 동안 자신의 액티브 전법 발동률이 8% 증가하며, 위협 상태를 보유한 적군 1명당 추가로 3% 증가한다. 이후 전체 적군에게 180%의 병기 피해를 주며, 목표가 제어 상태을(를) 보유하면 목표가 탈주병을(를) 생성하게 한다(무력의 영향 받음).
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-guan-yu",
  name: "화하 진압",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-06",
      "note": "녹화(2026-10-06): 액티브 발동률 증가(재시전 시 갱신) → 목표마다 [180% → 제어 상태면 탈주병] 순서. 탈주병 = 1.49×무력"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 자신의 액티브 전법 발동률이 8% 증가하며",
      "status": "ok",
      "impl": [
        "buffs[0]"
      ]
    },
    {
      "text": "위협 상태를 보유한 적군 1명마다 추가로 3% 증가한다",
      "status": "ok",
      "impl": [
        "buffs[0].countScale"
      ]
    },
    {
      "text": "이후 전체 적군에게 180%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]"
      ]
    },
    {
      "text": "목표가 제어 상태을(를) 보유하면 목표가 탈주병을(를) 생성하게 한다(무력의 영향 받음)",
      "status": "ok",
      "impl": [
        "statusEffects[0]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_5",
    "legacyName": "화하 진압",
    "legacyType": "액티브",
    "legacyProcRate": "45%",
    "raw": "2턴 동안 자신의 액티브 전법 발동률이 4%→8% 증가하며, 위협 상태를 보유한 적군 1명마다 추가로 3% 증가한다. 이후 전체 적군에게 90%→180%의 병기 피해를 주며, 목표가 제어 상태을(를) 보유하면 목표가 탈주병을(를) 생성하게 한다(무력의 영향 받음).",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.9,
          "max": 1.8,
          "target": "all_enemy",
          "tag": "main"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.04,
          "max": 0.08,
          "target": "self",
          "duration": 2,
          "countScale": {
            "status": "위협",
            "side": "enemy",
            "perCount": 0.03
          }
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "탈주병",
          "target": "tag:main",
          "condition": {
            "type": "hasAnyStatus",
            "who": "target",
            "statuses": [
              "공포",
              "무장 해제",
              "침묵",
              "혼란",
              "조롱",
              "허약",
              "군량 고갈"
            ]
          }
        }
      ],
      "targets": []
    },
    "specialApplied": true,
    "clauses": [
      {
        "text": "2턴 동안 자신의 액티브 전법 발동률이 4%→8% 증가",
        "impl": [
          "buffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "위협 상태를 보유한 적군 1명마다 추가로 3% 증가한다",
        "impl": [
          "buffs[0].countScale"
        ],
        "status": "ok"
      },
      {
        "text": "전체 적군에게 90%→180%의 병기 피해를 주며",
        "impl": [
          "damage[0]"
        ],
        "status": "ok"
      },
      {
        "text": "목표가 제어 상태을(를) 보유하면 목표가 탈주병을(를) 생성하게 한다(무력의 영향 받음)",
        "impl": [
          "statusEffects[0]"
        ],
        "status": "ok"
      }
    ],
    "desertionStat": "무력",
    "desertionCoef": 1.49,
    "desertionBase": 0
  },
  run(c) {
    // 「2턴 동안 자신의 액티브 전법 발동률이 8% 증가하며, 위협 상태를 보유한 적군 1명당 추가로 3% 증가한다」 — 녹화: 먼저 발동, 재시전 시 갱신
    c.buff(0);
    // 「이후 전체 적군에게 180%의 병기 피해를 주며, 목표가 제어 상태을(를) 보유하면 목표가 탈주병을(를) 생성하게 한다(무력의 영향 받음)」 — 목표마다 피해 → 탈주병
    const E = c.skill.effects;
    c.targets('all_enemy').forEach((u, i) => {
      if (!u.alive) return;
      c.tag('g' + i, [u]);
      c.damage({ ...E.damage[0], target: 'tag:g' + i, tag: undefined });
      if (u.alive) c.status({ ...E.statusEffects[0], target: 'tag:g' + i });
    });
  },
});
