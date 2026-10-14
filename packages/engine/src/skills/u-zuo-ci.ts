// 운행우시 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 시, 자신이 운신 10중첩을 획득합니다. 피해를 받을 때 해당 피해가 20% 감소합니다(추가로 지력과 운신 중첩 수의 영향을 받음). 아군 2명이 확률 판정으로 인해 액티브 전법 발동에 실패했을 때, 50% 확률(지력의 영향을 받음)로 운신 1중첩을 소모하여 해당 액티브 전법의 발동 여부를 다시 판정합니다.
// 원문 절 구현: ok / approx / ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zuo-ci",
  name: "운행우시",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "운신 재판정(실패한 액티브 50% 재판정)을 아군 2명의 액티브 발동률 +22%(기대값)로 환산. 지력·운신 중첩 수 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 시, 자신이 운신 10중첩을 획득합니다",
      "status": "ok"
    },
    {
      "text": "피해를 받을 때 해당 피해가 20% 감소합니다(추가로 지력과 운신 중첩 수의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "아군 2명이 확률 판정으로 인해 액티브 전법 발동에 실패했을 때",
      "status": "ok"
    },
    {
      "text": "50% 확률(지력의 영향을 받음)로 운신 1중첩을 소모하여 해당 액티브 전법의 발동 여부를 다시 판정합니다",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.2,
          "max": -0.2,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        },
        {
          "stat": "액티브발동률",
          "min": 0.22,
          "max": 0.22,
          "target": "random_ally_n",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "운신 재판정(실패한 액티브 50% 재판정)을 아군 2명의 액티브 발동률 +22%(기대값)로 환산. 지력·운신 중첩 수 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -20%, 대상 self, 전투 종료까지, 최대 1중첩
    c.buff(1);   // 액티브발동률 +22%, 대상 random_ally_n, 전투 종료까지, 최대 1중첩
  },
});
