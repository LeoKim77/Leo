// 진군 차단 · 고유 전법 · 패시브 100%
// 원문: 자신의 무력과 통솔이 10% 증가하며, 자신의 액티브 또는 추격 전법 발동 후, 60% 확률로 랜덤 적군 단일 목표에게 80%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-pan-zhang",
  name: "진군 차단",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "자신의 무력과 통솔이 10% 증가하며",
      "status": "ok"
    },
    {
      "text": "자신의 액티브 또는 추격 전법 발동 후, 60% 확률로 랜덤 적군 단일 목표에게 80%의 병기 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "static": {
      "statsPct": {
        "무력": 0.1,
        "통솔": 0.1
      }
    },
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "cast",
          "role": "self",
          "chance": 0.6
        },
        "effects": {
          "damage": [
            {
              "dmgType": "병기",
              "min": 0.8,
              "max": 0.8,
              "target": "random_enemy_1"
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「자신의 무력과 통솔이 10% 증가하며」 — def.static (포진 시 고정)
  },
  partRuns: [
    (c) => {
      // 「자신의 액티브 또는 추격 전법 발동 후, 60% 확률로 랜덤 적군 단일 목표에게 80%의 병기 피해를 준다」
      c.damage(0);
    },
  ],
});
