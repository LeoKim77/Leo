// 팔호의 수장 · 고유 전법 · 액티브 40%
// 원문: 1턴 동안 준비 후 랜덤 적군 단일 목표에게 360%의 병기와 책략 피해를 준다. 목표가 홍수 상태면 이번 피해가 30% 증가한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cao-hong",
  name: "팔호의 수장",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "병기·책략 피해 2건을 같은 목표에, 홍수면 각각 +30%",
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
      "text": "1턴 동안 준비 후 랜덤 적군 단일 목표에게 360%의 병기와 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "목표가 홍수 상태면 이번 피해가 30% 증가한다",
      "status": "ok"
    }
  ],
  def: {
    "prepTurns": 1,
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 3.6,
          "max": 3.6,
          "target": "tag:one",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.3
          }
        },
        {
          "dmgType": "책략",
          "min": 3.6,
          "max": 3.6,
          "target": "tag:one",
          "conditionalBonusMult": {
            "condition": {
              "type": "hasStatus",
              "who": "target",
              "status": "홍수"
            },
            "mult": 0.3
          }
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
    "authoredNote": "병기·책략 피해 2건을 같은 목표에, 홍수면 각각 +30%",
    "replacedLegacy": false
  },
  run(c) {
    // 「1턴 동안 준비 후 랜덤 적군 단일 목표에게 360%의 병기와 책략 피해를 준다」「목표가 홍수 상태면 이번 피해가 30% 증가한다」
    c.tag('one', c.targets('random_enemy_1'));
    c.damage(0);
    c.damage(1);
  },
});
