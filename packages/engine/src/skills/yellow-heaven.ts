// 황천의 선동 · 전법 · 액티브 55%
// 원문(시즌3 미리보기 2026-10-07): 적군 전체에 140%의 책략 피해를 주며, 2턴 동안 지속되는 요술을(를) 부여한다. 목표가 요술 상태를 보유한 경우, 1턴 동안 목표의 주는 피해가 16% 감소한다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "yellow-heaven",
  name: "황천의 선동",
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
      "text": "적군 전체에 140%의 책략 피해를 주며",
      "status": "ok"
    },
    {
      "text": "2턴 동안 지속되는 요술을(를) 부여한다",
      "status": "ok"
    },
    {
      "text": "목표가 요술 상태를 보유한 경우, 1턴 동안 목표의 주는 피해가 16% 감소한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "all_enemy"
        }
      ],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": -0.16,
          "max": -0.16,
          "target": "all_enemy",
          "duration": 1,
          "maxStacks": 1,
          "condition": {
            "type": "hasStatus",
            "who": "target",
            "status": "요술"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [
        {
          "name": "요술",
          "target": "all_enemy",
          "duration": 2
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
    c.damage(0);   // 책략 140%, 대상 all_enemy
    c.buff(0);   // 주는피해 -16%, 대상 all_enemy, 1턴, 최대 1중첩, 조건 hasStatus
    c.status(0);   // 요술, 대상 all_enemy, 2턴
  },
});
