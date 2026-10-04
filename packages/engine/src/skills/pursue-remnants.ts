// 패잔병 척결 · 전법 · 패시브 100%
// 원문: 책략 피해를 준 후, 60% 확률로 랜덤 적군 단일 목표에게 일반 공격을 1회 부여하며, 매 턴 최대 1회 발동된다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "pursue-remnants",
  name: "패잔병 척결",
  kind: "패시브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-04",
      "note": "'일반 공격을 1회 부여' — 정식 일반 공격(추격 판정 포함)으로"
    }
  ],
  clauses: [
    {
      "text": "책략 피해를 준 후, 60% 확률로 랜덤 적군 단일 목표에게 일반 공격을 1회 부여하며",
      "status": "ok",
      "impl": [
        "trigger"
      ]
    },
    {
      "text": "매 턴 최대 1회 발동된다",
      "status": "ok"
    }
  ],
  def: {
    "legacyId": "skill_66",
    "legacyName": "패잔병 척결",
    "legacyType": "패시브",
    "legacyProcRate": "100%",
    "raw": "책략 피해를 준 후, 30%→60% 확률로 랜덤 적군 단일 목표에게 일반 공격을 1회 부여하며, 매 턴 최대 1회 발동된다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "asBasicAttack": true,
          "target": "random_enemy_1"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_1"
      ],
      "statusEffects": []
    },
    "manualOverride": true,
    "trigger": {
      "maxPerTurn": 1,
      "event": "damage",
      "role": "dealt",
      "filterDmgType": "책략",
      "chance": 0.6
    },
    "triggerApplied": true,
    "clauses": [
      {
        "text": "책략 피해를 준 후",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "30%→60% 확률로 랜덤 적군 단일 목표에게 일반 공격을 1회 부여",
        "impl": [
          "trigger"
        ],
        "status": "ok"
      },
      {
        "text": "매 턴 최대 1회 발동된다",
        "impl": [],
        "status": "NOTE"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 100%, 대상 random_enemy_1
  },
});
