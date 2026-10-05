// 칠진칠출 · 고유 전법 · 패시브 100%
// 원문: 자신의 피신 확률이 35% 증가하며, 피신 성공 후, 용담이 발동된다. 용담: 랜덤 적군 2명에게 즉시 90%의 병기 피해를 주며, 현재 턴 내 다음 용담의 피해 계수가 10% 감소한다. 용담은 매 턴 7회 발동될 수 있다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhao-yun",
  name: "칠진칠출",
  kind: "패시브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "자신의 피신 확률이 35% 증가하며",
      "status": "ok",
      "impl": [
        "alwaysOnBuffs[0]"
      ]
    },
    {
      "text": "피신 성공 후, 용담 발동: 랜덤 적군 2명에게 즉시 90%의 병기 피해를 주며",
      "status": "ok",
      "impl": [
        "damage[0]",
        "trigger"
      ]
    },
    {
      "text": "현재 턴에서 다음 용담의 피해 계수가 10% 감소한다",
      "status": "ok"
    },
    {
      "text": "용담은 매 턴 7회 발동될 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "uskill_6",
    "legacyName": "칠진칠출",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "자신의 피신 확률이 17.5%→35% 증가하며, 피신 성공 후, 용담 발동: 랜덤 적군 2명에게 즉시 45%→90%의 병기 피해를 주며, 현재 턴에서 다음 용담의 피해 계수가 5%→10% 감소한다. 용담은 매 턴 7회 발동될 수 있다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.45,
          "max": 0.9,
          "target": "random_enemy_n",
          "turnDecay": 0.1
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [],
      "statusEffects": []
    },
    "trigger": {
      "event": "evade",
      "role": "self",
      "chance": 1,
      "maxPerTurn": 7
    },
    "alwaysOnBuffs": [
      {
        "stat": "피신",
        "min": 0.175,
        "max": 0.35,
        "target": "self",
        "duration": 999,
        "maxStacks": 1
      }
    ],
    "clauses": [
      {
        "text": "자신의 피신 확률이 17.5%→35% 증가",
        "impl": [
          "alwaysOnBuffs[0]"
        ],
        "status": "ok"
      },
      {
        "text": "피신 성공 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "용담 발동: 랜덤 적군 2명에게 즉시 45%→90%의 병기 피해를 주며",
        "impl": [
          "damage[0]",
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "현재 턴에서 다음 용담의 피해 계수가 5%→10% 감소한다",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "용담은 매 턴 7회 발동될 수 있다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // 「피신 성공 후, 용담 발동: 랜덤 적군 2명에게 즉시 90%의 병기 피해를 주며」
    c.damage(0);   // 병기 45%→90%, 대상 random_enemy_n
  },
});
