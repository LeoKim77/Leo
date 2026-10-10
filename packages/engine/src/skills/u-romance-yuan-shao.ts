// 사세삼공 · 고유 전법 · 액티브 60%
// 원문: 아군 중 무력·지력·선공이 각각 가장 높은 장수가 적군 중 해당 능력치가 가장 낮은 대상에게 각각 100% 병기 피해와 책략 피해를 줍니다. 해당 피해가 회심 또는 묘책을 발동하면 대상에게 통솔의 영향을 받는 도망병을 추가합니다.
// 원문 절 구현: ok / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-romance-yuan-shao",
  name: "사세삼공",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준: 무력·지력·선공 최고 아군이 각각 해당 능력치 최저 적에게 100% 병기+100% 책략. 회심·묘책 시 도망병 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "아군 중 무력·지력·선공이 각각 가장 높은 장수가 적군 중 해당 능력치가 가장 낮은 대상에게 각각 100% 병기 피해와 책략 피해를 줍니다",
      "status": "ok"
    },
    {
      "text": "해당 피해가 회심 또는 묘책을 발동하면 대상에게 통솔의 영향을 받는 도망병을 추가합니다",
      "status": "missing"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "lowest_power_enemy",
          "actor": "highest_power_ally"
        },
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "lowest_power_enemy",
          "actor": "highest_power_ally"
        },
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "lowest_intel_enemy",
          "actor": "highest_intel_ally"
        },
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "lowest_intel_enemy",
          "actor": "highest_intel_ally"
        },
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "lowest_speed_enemy",
          "actor": "highest_speed_ally"
        },
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "lowest_speed_enemy",
          "actor": "highest_speed_ally"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준: 무력·지력·선공 최고 아군이 각각 해당 능력치 최저 적에게 100% 병기+100% 책략. 회심·묘책 시 도망병 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 100%, 대상 lowest_power_enemy, 공격자 highest_power_ally
    c.damage(1);   // 책략 100%, 대상 lowest_power_enemy, 공격자 highest_power_ally
    c.damage(2);   // 병기 100%, 대상 lowest_intel_enemy, 공격자 highest_intel_ally
    c.damage(3);   // 책략 100%, 대상 lowest_intel_enemy, 공격자 highest_intel_ally
    c.damage(4);   // 병기 100%, 대상 lowest_speed_enemy, 공격자 highest_speed_ally
    c.damage(5);   // 책략 100%, 대상 lowest_speed_enemy, 공격자 highest_speed_ally
  },
});
