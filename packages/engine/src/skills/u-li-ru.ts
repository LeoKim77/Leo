// 군주 시해 · 고유 전법 · 액티브 37%~ 55%
// 원문: 랜덤 적군 2명에게 2턴 동안 지속되는 짐독 상태를 1스택 부여하며, 전체 아군이 2턴 동안 시해 상태를 획득한다. 시해: 짐독 상태인 목표에게 병기 또는 책략 피해를 준 후, 50% 확률로 목표에게 1스택의 짐독 상태를 부여한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-li-ru",
  name: "군주 시해",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-05",
      "note": "고유 전법 녹화: 시해는 \"전체 아군\"(자신 포함)이 획득 — 예전 랜덤 2명"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 2명에게 2턴 동안 지속되는 짐독 상태를 1스택 부여하며",
      "status": "ok",
      "reviewed": "짐독·시해 상태 구현(calcDamage 시해 50%)"
    },
    {
      "text": "우군 2명이 2턴 동안 시해 상태를 획득한다",
      "status": "ok",
      "reviewed": "시해 상태 구현"
    },
    {
      "text": "시해: 짐독 상태인 목표에게 병기 또는 책략 피해를 준 후",
      "status": "ok",
      "reviewed": "시해 상태 구현"
    },
    {
      "text": "50% 확률로 목표에게 1스택의 짐독 상태를 부여한다",
      "status": "ok",
      "reviewed": "짐독·시해 상태 구현(calcDamage 시해 50%)"
    }
  ],
  def: {
    "legacyId": "uskill_35",
    "legacyName": "군주 시해",
    "legacyType": "액티브",
    "legacyProcRate": "37%~ 55%",
    "raw": "랜덤 적군 2명에게 2턴 동안 지속되는 짐독 상태를 1스택 부여하며, 우군 2명이 2턴 동안 시해 상태를 획득한다: 짐독 상태인 목표에게 병기 또는 책략 피해를 준 후, 25%→50% 확률로 목표에게 1스택의 짐독 상태를 부여한다.",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [
        "random_enemy_n"
      ],
      "statusEffects": [
        {
          "name": "짐독",
          "target": "random_enemy_n",
          "duration": 2
        },
        {
          "name": "시해",
          "target": "all_ally",
          "duration": 2
        }
      ]
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "랜덤 적군 2명에게 2턴 동안 지속되는 짐독 상태를 1스택 부여",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "우군 2명이 2턴 동안 시해 상태를 획득한다: 짐독 상태인 목표에게 병기 또는 책략 피해를 준 후",
        "impl": [],
        "status": "MISSING"
      },
      {
        "text": "25%→50% 확률로 목표에게 1스택의 짐독 상태를 부여한다",
        "impl": [],
        "status": "MISSING"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 짐독, 대상 random_enemy_n, 2턴
    c.status(1);   // 시해, 대상 all_ally(전체 아군), 2턴
  },
});
