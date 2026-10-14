// 용감한 선봉 · 고유 전법 · 추격 50%
// 원문: 일반 공격 후, 2턴 동안 자신의 선공이 25 증가한다. 이후 전체 적군에게 80%의 병기 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-ding-feng",
  name: "용감한 선봉",
  kind: "추격",
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
      "text": "일반 공격 후, 2턴 동안 자신의 선공이 25 증가한다",
      "status": "ok"
    },
    {
      "text": "이후 전체 적군에게 80%의 병기 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.8,
          "max": 0.8,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "선공",
          "min": 25,
          "max": 25,
          "target": "self",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "",
    "replacedLegacy": false
  },
  run(c) {
    // 「일반 공격 후, 2턴 동안 자신의 선공이 25 증가한다」
    c.statMod(0);
    // 「이후 전체 적군에게 80%의 병기 피해를 준다」
    c.damage(0);
  },
});
