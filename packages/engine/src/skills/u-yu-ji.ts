// 풍급우회 · 고유 전법 · 액티브 55%
// 원문: 적군 전체에게 120%의 책략 피해를 입히고, 홍수 상태를 부여합니다. 지속시간은 2턴입니다. 동시에 자신과 무작위 아군 1명(같은 열 우선)이 아래 효과 중 1~2개를 획득합니다. 각 무장은 독립적으로 판정합니다. 자신의 병력을 회복합니다. 치료율 200%(지력의 영향을 받음). 기궁 상태에 면역됩니다. 지속시간 1턴. 액티브 전법 발동률이 10% 증가합니다. 지속시간 1턴.
// 원문 절 구현: ok / ok / ok / approx / ok / ok / ok / missing / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yu-ji",
  name: "풍급우회",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "\"효과 1~2개 획득\"을 효과마다 50% 판정으로, \"같은 열 우선\"은 무작위 아군 1명으로 처리. 지력 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 전체에게 120%의 책략 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "홍수 상태를 부여합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 2턴입니다",
      "status": "ok"
    },
    {
      "text": "동시에 자신과 무작위 아군 1명(같은 열 우선)이 아래 효과 중 1~2개를 획득합니다",
      "status": "approx"
    },
    {
      "text": "각 무장은 독립적으로 판정합니다",
      "status": "ok"
    },
    {
      "text": "자신의 병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율 200%(지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "기궁 상태에 면역됩니다",
      "status": "missing"
    },
    {
      "text": "지속시간 1턴",
      "status": "ok"
    },
    {
      "text": "액티브 전법 발동률이 10% 증가합니다",
      "status": "ok"
    },
    {
      "text": "지속시간 1턴",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.2,
          "max": 1.2,
          "target": "all_enemy"
        }
      ],
      "heal": [
        {
          "min": 2,
          "max": 2,
          "target": "self",
          "chance": 0.5
        },
        {
          "min": 2,
          "max": 2,
          "target": "random_ally_1",
          "chance": 0.5
        }
      ],
      "buffs": [
        {
          "stat": "액티브발동률",
          "min": 0.1,
          "max": 0.1,
          "target": "self",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.5
        },
        {
          "stat": "액티브발동률",
          "min": 0.1,
          "max": 0.1,
          "target": "random_ally_1",
          "duration": 1,
          "maxStacks": 1,
          "chance": 0.5
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "홍수",
          "target": "all_enemy",
          "duration": 2
        }
      ],
      "targets": [
        "all_enemy"
      ]
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"효과 1~2개 획득\"을 효과마다 50% 판정으로, \"같은 열 우선\"은 무작위 아군 1명으로 처리. 지력 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 120%, 대상 all_enemy
    c.heal(0);   // 치유율 200%, 대상 self, 확률 50%
    c.heal(1);   // 치유율 200%, 대상 random_ally_1, 확률 50%
    c.buff(0);   // 액티브발동률 +10%, 대상 self, 확률 50%, 1턴, 최대 1중첩
    c.buff(1);   // 액티브발동률 +10%, 대상 random_ally_1, 확률 50%, 1턴, 최대 1중첩
    c.status(0);   // 홍수, 대상 all_enemy, 2턴
  },
});
