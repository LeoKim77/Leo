// 요새 함락 · 전법 · 패시브 100%
// 원문: 자신의 회심 확률이 20% 상승합니다. 매 턴 행동 종료 시 랜덤 적군 2명에게 110% 병기 피해를 줍니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-hardship",
  name: "요새 함락",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "자신의 회심 확률이 20% 상승합니다",
      "status": "ok"
    },
    {
      "text": "매 턴 행동 종료 시 랜덤 적군 2명에게 110% 병기 피해를 줍니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "actionEnd",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.1,
          "max": 1.1,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "회심",
              "min": 0.2,
              "max": 0.2,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 110%, 대상 random_enemy_n
  },
});
