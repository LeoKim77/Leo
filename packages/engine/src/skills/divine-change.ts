// 뛰어난 응변 · 전법 · 액티브 100%
// 원문(시즌3 미리보기 2026-10-07): 랜덤 아군 2명의 병력을 회복시킨다(치유율 90%, 지력의 영향을 받음). 누적 4회 발동 후 발동 시마다 랜덤 적군 2명에게 160%의 책략 피해를 추가로 부여한다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "divine-change",
  name: "뛰어난 응변",
  kind: "액티브",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 원문이 완전히 다름 — 매 시전 랜덤 아군 2명 회복 90%, 누적 4회 발동 후부터 시전마다 랜덤 적군 2명 160% 추가(예전 해외 문구: 첫 4턴 회복 110% / 후반 4턴 피해)"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "누적 4회 발동 \"후\"를 5번째 발동부터로 해석(확인 질문)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "랜덤 아군 2명의 병력을 회복시킨다(치유율 90%, 지력의 영향을 받음)",
      "status": "ok"
    },
    {
      "text": "누적 4회 발동 후 발동 시마다 랜덤 적군 2명에게 160%의 책략 피해를 추가로 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.6,
          "max": 1.6,
          "target": "random_enemy_n",
          "turnCond": {
            "minTurn": 5
          }
        }
      ],
      "heal": [
        {
          "min": 0.9,
          "max": 0.9,
          "target": "random_ally_n",
          "turnCond": {
            "maxTurn": 4
          }
        }
      ],
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
    // 「랜덤 아군 2명의 병력을 회복시킨다(치유율 90%, 지력의 영향을 받음)」
    c.heal(0);
    // 「누적 4회 발동 후 발동 시마다 랜덤 적군 2명에게 160%의 책략 피해를 추가로 부여한다」 — 5번째 발동부터(이 전법의 누적 발동 수, 전투 내내)
    const u: any = c.unit;
    const cnt = (u._castCount || (u._castCount = {}));
    cnt[c.skill.id] = (cnt[c.skill.id] || 0) + 1;
    if (cnt[c.skill.id] > 4) c.damage(0);
  },
});
