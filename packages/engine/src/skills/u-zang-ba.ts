// 강가 격파 · 고유 전법 · 액티브 40%
// 원문: 1턴 동안 준비 후 2턴 동안 랜덤 적군 2명의 통솔을 35포인트 감소시키고, 이후 280%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zang-ba",
  name: "강가 격파",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "통솔 감소 대상과 피해 대상은 같은 2명",
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
      "text": "1턴 동안 준비 후 2턴 동안 랜덤 적군 2명의 통솔을 35포인트 감소시키고",
      "status": "ok"
    },
    {
      "text": "이후 280%의 병기 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "prepTurns": 1,
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.8,
          "max": 2.8,
          "target": "tag:two"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": -35,
          "max": -35,
          "target": "random_enemy_n",
          "duration": 2,
          "maxStacks": 1,
          "tag": "two"
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "통솔 감소 대상과 피해 대상은 같은 2명",
    "replacedLegacy": false
  },
  run(c) {
    // 「1턴 동안 준비 후 2턴 동안 랜덤 적군 2명의 통솔을 35포인트 감소시키고」
    c.statMod(0);
    // 「이후 280%의 병기 피해를 준다」 — 같은 2명
    c.damage(0);
  },
});
