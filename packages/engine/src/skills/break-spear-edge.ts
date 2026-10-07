// 병기 파괴 · 전법 · 액티브 50%
// 원문(시즌3 미리보기 2026-10-07): 랜덤 적군 2명에게 220%의 병기 피해를 주며, 75% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-spear-edge",
  name: "병기 파괴",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 해외 번역 문구를 한국판 원문으로 교체"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "랜덤 적군 2명에게 220%의 병기 피해를 주며",
      "status": "ok"
    },
    {
      "text": "75% 확률로 1턴 동안 지속되는 무장 해제을(를) 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 2.2,
          "max": 2.2,
          "target": "random_enemy_n",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "무장 해제",
          "target": "tag:e",
          "chance": 0.75,
          "duration": 1
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 220%, 대상 random_enemy_n
    c.status(0);   // 무장 해제, 대상 tag:e, 확률 75%, 1턴
  },
});
