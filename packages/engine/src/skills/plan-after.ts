// 용의주도 · 전법 · 추격 75%
// 원문: 일반 공격 후, 적군 전체에게 40%의 책략 피해를 입힙니다. 또한 50% 확률(지력의 영향을 받음)로 용의주도를 추가로 1회 발동합니다. 이 추가 발동은 다시 연쇄 발동되지 않습니다. 용의주도의 피해 계수는 매 턴 12%씩 증가합니다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "plan-after",
  name: "용의주도",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "매 턴 12%·지력 영향",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "피해 계수 매 턴 +12%(예전 +30%), 추가 발동 확률 지력 영향"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 적군 전체에게 40%의 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "또한 50% 확률(지력의 영향을 받음)로 용의주도를 추가로 1회 발동합니다",
      "status": "ok"
    },
    {
      "text": "이 추가 발동은 다시 연쇄 발동되지 않습니다",
      "status": "ok"
    },
    {
      "text": "용의주도의 피해 계수는 매 턴 12%씩 증가합니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.4,
          "target": "all_enemy",
          "turnScale": {
            "mode": "add",
            "perTurn": 0.12
          }
        },
        {
          "dmgType": "책략",
          "min": 0.4,
          "max": 0.4,
          "target": "all_enemy",
          "chance": 0.5,
          "turnScale": {
            "mode": "add",
            "perTurn": 0.12
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
    "authoredStatus": "ok",
    "authoredNote": "매 턴 12% 증가·지력 영향 반영 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // 「일반 공격 후, 적군 전체에게 40%의 책략 피해를 입힙니다」
    // 「용의주도의 피해 계수는 매 턴 12%씩 증가합니다」
    c.damage(0);
    // 「또한 50% 확률(지력의 영향을 받음)로 용의주도를 추가로 1회 발동합니다」
    // 「이 추가 발동은 다시 연쇄 발동되지 않습니다」
    if (c.chance(0.5 * c.infl('지력'))) c.damage({ ...c.skill.effects.damage[1], chance: undefined });
  },
});
