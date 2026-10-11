// 투혼의 추격 · 전법 · 패시브 100%
// 원문(녹화 2026-10-11): 매 턴 행동 시, 60% 확률로 이상 상태을(를) 보유한 적군에게 120%의 병기 피해를 주며, 목표마다 개별적으로 판정된다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "relentless-chase",
  name: "투혼의 추격",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 전법 녹화 원문(10레벨)으로 교체: 이름 띄어쓰기 투혼의 추격"
    }
  ],
  clauses: [
    {
      "text": "매 턴 행동 시, 60% 확률로 이상 상태을(를) 보유한 적군에게 120%의 병기 피해를 주며",
      "status": "ok"
    },
    {
      "text": "목표마다 개별적으로 판정된다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "action",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1.2,
          "max": 1.2,
          "target": "all_enemy",
          "condition": {
            "type": "hasAnyStatus",
            "who": "target",
            "statuses": [
              "공포",
              "무장 해제",
              "침묵",
              "혼란",
              "조롱",
              "허약",
              "군량 고갈",
              "홍수",
              "화공",
              "폭풍",
              "위협",
              "요술"
            ]
          },
          "chance": 0.6,
          "chancePerTarget": true
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
    "replacedLegacy": false
  },
  run(c) {
    // 「매 턴 행동 시, 60% 확률로 이상 상태을(를) 보유한 적군에게 120%의 병기 피해를 주며」「목표마다 개별적으로 판정된다」
    c.damage(0);   // 병기 120%, 대상 all_enemy, 확률 60%(목표별), 조건 hasAnyStatus
  },
});
