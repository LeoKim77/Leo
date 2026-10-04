// 투혼의추격 · 전법 · 패시브 100%
// 원문: 매 턴 행동 시 60% 확률로 이상 상태가 있는 적군에게 각각 120% 병기 피해를 줍니다. 대상마다 발동 여부를 따로 판정합니다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "relentless-chase",
  name: "투혼의추격",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 행동 시 60% 확률로 이상 상태가 있는 적군에게 각각 120% 병기 피해를 줍니다",
      "status": "ok"
    },
    {
      "text": "대상마다 발동 여부를 따로 판정합니다",
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
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 120%, 대상 all_enemy, 확률 60%, 조건 hasAnyStatus
  },
});
