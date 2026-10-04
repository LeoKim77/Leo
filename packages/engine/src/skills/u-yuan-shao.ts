// 군웅 집결 · 고유 전법 · 지휘 100%
// 원문: 매 턴 행동 시, 무력/지력/선공이 가장 높은 우군 단일 목표가 무력/지력/선공이 가장 낮은 적군 단일 목표에게 각각 75%의 병기와 책략 피해를 준다.
// 원문 절 구현: ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yuan-shao",
  name: "군웅 집결",
  kind: "지휘",
  isUnique: true,
  clauses: [
    {
      "text": "매 턴 행동 시, 무력/지력/선공이 가장 높은 우군 단일 목표가 무력/지력/선공이 가장 낮은 적군 단일 목표에게 각각 75%의 병기와 책략 피해를 준다",
      "status": "ok",
      "impl": [
        "damage[1]"
      ]
    }
  ],
  def: {
    "legacyId": "uskill_39",
    "legacyName": "군웅 집결",
    "legacyType": "지휘",
    "legacyProcRate": "100%",
    "raw": "매 턴 행동 시, 무력/지력/선공이 가장 높은 아군 단일 목표가 무력/지력/선공이 가장 낮은 적군 단일 목표에게 각각 37.5%→75%의 병기와 책략 피해를 준다.",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.375,
          "max": 0.75,
          "actor": "highest_combined_ally",
          "target": "lowest_combined_enemy"
        },
        {
          "dmgType": "책략",
          "min": 0.375,
          "max": 0.75,
          "actor": "highest_combined_ally",
          "target": "lowest_combined_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "targets": [],
      "statusEffects": []
    },
    "manualOverride": true,
    "clauses": [
      {
        "text": "매 턴 행동 시",
        "impl": [],
        "status": "NOTE"
      },
      {
        "text": "무력/지력/선공이 가장 높은 아군 단일 목표가 무력/지력/선공이 가장 낮은 적군 단일 목표에게 각각 37.5%→75%의 병기와 책략 피해를 준다",
        "impl": [
          "damage[1]"
        ],
        "status": "ok"
      }
    ]
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 37.5%→75%, 대상 lowest_combined_enemy, 공격자 highest_combined_ally
    // 「매 턴 행동 시, 무력/지력/선공이 가장 높은 우군 단일 목표가 무력/지력/선공이 가장 낮은 적군 단일 목표에게 각각 75%의 병기와 책략 피해를 준다」
    c.damage(1);   // 책략 37.5%→75%, 대상 lowest_combined_enemy, 공격자 highest_combined_ally
  },
});
