// 천하의인재 · 전법 · 액티브 50%
// 원문: 1턴 준비 후, 적군 전체에게 260%의 책략 피해를 입힙니다. 또한 80% 확률로 대상에게 무작위 제어 상태 1종을 부여합니다. 지속시간은 2턴입니다.
// 원문 절 구현: ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "talent-under-heaven",
  name: "천하의인재",
  kind: "액티브",
  isUnique: false,
  engineStatus: {
    "status": "ok",
    "note": "대상마다 무작위 제어 1종",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "무작위 제어 상태를 대상마다 따로 고름(80% 대상별)"
    }
  ],
  clauses: [
    {
      "text": "1턴 준비 후, 적군 전체에게 260%의 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "또한 80% 확률로 대상에게 무작위 제어 상태 1종을 부여합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 2턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "prepTurns": 1,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 2.6,
          "max": 2.6,
          "target": "all_enemy",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "oneOf": [
            "공포",
            "무장 해제",
            "침묵",
            "혼란",
            "조롱",
            "허약",
            "군량 고갈"
          ],
          "target": "tag:e",
          "chance": 0.8,
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "대상마다 무작위 제어 1종 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // 「1턴 준비 후, 적군 전체에게 260%의 책략 피해를 입힙니다」
    c.damage(0);
    // 「또한 80% 확률로 대상에게 무작위 제어 상태 1종을 부여합니다」
    // 「지속시간은 2턴입니다」
    for (const u of c.tagged('e')) { c.tag('one', [u]); c.status({ ...c.skill.effects.statusEffects[0], target: 'tag:one' }); }
  },
});
