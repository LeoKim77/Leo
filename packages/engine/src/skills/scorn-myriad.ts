// 만군 멸시 · 전법 · 추격 40%
// 원문: 일반 공격 후, 적군 전체에게 140%의 병기 피해를 입힙니다. 짝수 턴에 발동할 경우, 추가로 적군 중 병력이 가장 낮은 단일 대상에게 100%의 병기 피해를 입힙니다. 만약 직전 턴에 이 전법이 발동하지 않았다면, 이번 전법의 피해가 50% 증가합니다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "scorn-myriad",
  name: "만군 멸시",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후, 적군 전체에게 140%의 병기 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "짝수 턴에 발동할 경우, 추가로 적군 중 병력이 가장 낮은 단일 대상에게 100%의 병기 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "만약 직전 턴에 이 전법이 발동하지 않았다면",
      "status": "ok"
    },
    {
      "text": "이번 전법의 피해가 50% 증가합니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.4,
          "max": 1.4,
          "target": "all_enemy",
          "idleBonus": 0.5
        },
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "lowest_hp_enemy",
          "turnCond": {
            "parity": "even"
          },
          "idleBonus": 0.5
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 140%, 대상 all_enemy
    c.damage(1);   // 병기 100%, 대상 lowest_hp_enemy
  },
});
