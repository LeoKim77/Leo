// 지피지기 · 고유 전법 · 액티브 35%
// 원문: 1턴 동안 준비 후 랜덤 적군 2명에게 2턴 동안 지속되는 침묵 상태를 부여하며, 160%의 책략 피해를 준다. 목표가 침묵 상태를 보유 중이면, 추가로 160%의 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-liu-ye",
  name: "지피지기",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "원문 순서대로 침묵 부여 → 160% → 침묵 보유 목표에 추가 160%(저항으로 침묵이 안 걸린 목표는 추가 피해 없음)",
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
      "text": "1턴 동안 준비 후 랜덤 적군 2명에게 2턴 동안 지속되는 침묵 상태를 부여하며",
      "status": "ok"
    },
    {
      "text": "160%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "목표가 침묵 상태를 보유 중이면",
      "status": "ok"
    },
    {
      "text": "추가로 160%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "prepTurns": 1,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "tag:two"
        },
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "tag:two",
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "침묵"
          }
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "침묵",
          "target": "tag:two",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "원문 순서대로 침묵 부여 → 160% → 침묵 보유 목표에 추가 160%(저항으로 침묵이 안 걸린 목표는 추가 피해 없음)",
    "replacedLegacy": false
  },
  run(c) {
    // 「1턴 동안 준비 후 랜덤 적군 2명에게 2턴 동안 지속되는 침묵 상태를 부여하며」
    c.tag('two', c.targets('random_enemy_n'));
    c.status(0);
    // 「160%의 책략 피해를 준다」
    c.damage(0);
    // 「목표가 침묵 상태를 보유 중이면, 추가로 160%의 책략 피해를 준다」 (damage[1] 조건 hasStatus 침묵)
    c.damage(1);
  },
});
