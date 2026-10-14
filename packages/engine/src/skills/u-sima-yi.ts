// 매의 응시 · 고유 전법 · 액티브 100%
// 원문: 포석을 진행하여 포진 상태 1가지를 랜덤으로 획득하며(다른 상태 우선 획득), 전투 종료까지 지속된다. 50% 확률로(지력의 영향 받음) 1회 재 포석한다. 랜덤 적군 2명에게 50%의 책략 피해를 주며, 포석으로 제공되는 상태 1가지 당 책략 피해 계수가 20%증가한다, 8회까지 증가할 수 있다.
// 원문 절 구현: missing / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sima-yi",
  name: "매의 응시",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "포진 상태 자체의 효과는 미지원. 포석 수(발동마다 1 + 50%로 1, 최대 8)에 따른 피해 계수 증가만 반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "포석을 진행하여 포진 상태 1가지를 랜덤으로 획득하며(다른 상태 우선 획득)",
      "status": "missing"
    },
    {
      "text": "전투 종료까지 지속된다",
      "status": "ok"
    },
    {
      "text": "50% 확률로(지력의 영향 받음) 1회 재 포석한다",
      "status": "ok"
    },
    {
      "text": "랜덤 적군 2명에게 50%의 책략 피해를 주며",
      "status": "ok"
    },
    {
      "text": "포석으로 제공되는 상태 1가지 당 책략 피해 계수가 20%증가한다",
      "status": "ok"
    },
    {
      "text": "8회까지 증가할 수 있다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.5,
          "max": 0.5,
          "target": "random_enemy_n",
          "selfStack": {
            "key": "포석",
            "gain": 1,
            "bonusChance": 0.5,
            "max": 8,
            "per": 0.2
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
    "authoredStatus": "approx",
    "authoredNote": "포진 상태 자체의 효과는 미지원. 포석 수(발동마다 1 + 50%로 1, 최대 8)에 따른 피해 계수 증가만 반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 50%, 대상 random_enemy_n
  },
});
