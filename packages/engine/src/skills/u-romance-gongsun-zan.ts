// 북강질봉 · 고유 전법 · 추격 60%
// 원문: 일반 공격 후 무작위 적군 2명의 무력과 지력을 각각 16 빼앗아 2턴 동안 유지하며 최대 2회 중첩합니다. 이어 두 대상에게 각각 140% 병기 피해와 책략 피해를 주며 양측의 선공 차이에 추가 영향을 받습니다. 대상이 방패병이면 이번 피해가 15% 증가합니다.
// 원문 절 구현: ok / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-romance-gongsun-zan",
  name: "북강질봉",
  kind: "추격",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "해외 번역문 기준. 탈취한 무력·지력은 자신에게 +32(대상 2명분). 선공 차이 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "일반 공격 후 무작위 적군 2명의 무력과 지력을 각각 16 빼앗아 2턴 동안 유지하며 최대 2회 중첩합니다",
      "status": "ok"
    },
    {
      "text": "이어 두 대상에게 각각 140% 병기 피해와 책략 피해를 주며 양측의 선공 차이에 추가 영향을 받습니다",
      "status": "approx"
    },
    {
      "text": "대상이 방패병이면 이번 피해가 15% 증가합니다",
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
          "target": "tag:e",
          "conditionalBonusMult": {
            "condition": {
              "type": "unitType",
              "who": "target",
              "value": "방패병"
            },
            "mult": 0.15
          }
        },
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "tag:e",
          "conditionalBonusMult": {
            "condition": {
              "type": "unitType",
              "who": "target",
              "value": "방패병"
            },
            "mult": 0.15
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": -16,
          "max": -16,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 2,
          "tag": "e"
        },
        {
          "stat": "지력",
          "min": -16,
          "max": -16,
          "target": "tag:e",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "무력",
          "min": 32,
          "max": 32,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "지력",
          "min": 32,
          "max": 32,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "해외 번역문 기준. 탈취한 무력·지력은 자신에게 +32(대상 2명분). 선공 차이 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 -16, 대상 random_enemy_n, 2턴, 최대 2중첩
    c.statMod(1);   // 지력 -16, 대상 tag:e, 2턴, 최대 2중첩
    c.statMod(2);   // 무력 32, 대상 self, 2턴, 최대 2중첩
    c.statMod(3);   // 지력 32, 대상 self, 2턴, 최대 2중첩
    c.damage(0);   // 병기 140%, 대상 tag:e
    c.damage(1);   // 책략 140%, 대상 tag:e
  },
});
