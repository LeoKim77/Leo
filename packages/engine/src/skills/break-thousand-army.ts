// 천군격파 · 전법 · 추격 40%
// 원문: 일반 공격 후, 적군 무작위 2명에게 180%의 책략 피해를 입힙니다. 또한 35% 확률(지력의 영향을 받음)로 해당 피해가 추가로 20% 증가합니다. 각 대상은 독립적으로 판정됩니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "break-thousand-army",
  name: "천군격파",
  kind: "추격",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "대상별 판정 구현",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "대상마다 35%(지력 영향) 판정으로 피해 +20% (예전엔 기대값 ×1.07)"
    }
  ],
  clauses: [
    {
      "text": "일반 공격 후, 적군 무작위 2명에게 180%의 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "또한 35% 확률(지력의 영향을 받음)로 해당 피해가 추가로 20% 증가합니다",
      "status": "ok"
    },
    {
      "text": "각 대상은 독립적으로 판정됩니다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.8,
          "max": 1.8,
          "target": "tag:one"
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
    "authoredNote": "대상별 판정 구현 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // 「일반 공격 후, 적군 무작위 2명에게 180%의 책략 피해를 입힙니다」
    const two = c.targets('random_enemy_n');
    // 「또한 35% 확률(지력의 영향을 받음)로 해당 피해가 추가로 20% 증가합니다」
    // 「각 대상은 독립적으로 판정됩니다」
    const p = 0.35 * c.infl('지력');
    for (const u of two) { c.tag('one', [u]); c.damage({ ...c.skill.effects.damage[0], bonusMult: c.chance(p) ? 1.2 : 1 }); }
  },
});
