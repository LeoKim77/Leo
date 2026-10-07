// 요새 함락 · 전법 · 패시브 100%
// 원문(도감 2026-10-07): 자신의 회심 확률이 20% 증가하며, 매 턴 행동 종료 시마다 랜덤 적군 2명에게 110%의 병기 피해를 준다.
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
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 해외 번역 문구를 한국판 원문으로 교체(동작 같음)"
    },
    {
      "date": "2026-10-04",
      "note": "원문 대조 결과 이미 구현돼 있음 — 절 상태 표시만 바로잡음 (v1.12b 절 매칭이 낡음)"
    }
  ],
  clauses: [
    {
      "text": "자신의 회심 확률이 20% 증가하며",
      "status": "ok"
    },
    {
      "text": "매 턴 행동 종료 시마다 랜덤 적군 2명에게 110%의 병기 피해를 준다",
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
