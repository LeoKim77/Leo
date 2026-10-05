// 화소연영 · 고유 전법 · 액티브 60%
// 원문: 랜덤 적군 단일 목표에게 2턴 동안 지속되는 화공을 부여한다. 이후 화공 상태를 보유한 적군 목표에게 2턴 동안 지속되는 연소 상태를 1스택 부여하며, 220%의 책략피해를 주고, 40%확률로 (지력의 영향 받음) 추가로 1스택의 연소 상태를 부여한다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-lu-xun",
  name: "화소연영",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "연소 상태(지속 피해)는 미지원. 화공 부여 후 화공 보유 적에게 220% 책략 피해",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "연소 구현(R-048): 화공 보유 적에게 연소 1스택 → 220% 책략 → 40%(지력 영향) 추가 1스택"
    }
  ],
  clauses: [
    {
      "text": "랜덤 적군 단일 목표에게 2턴 동안 지속되는 화공을 부여한다",
      "status": "ok"
    },
    {
      "text": "이후 화공 상태를 보유한 적군 목표에게 2턴 동안 지속되는 연소 상태를 1스택 부여하며",
      "status": "ok"
    },
    {
      "text": "220%의 책략피해를 주고",
      "status": "ok"
    },
    {
      "text": "40%확률로 (지력의 영향 받음) 추가로 1스택의 연소 상태를 부여한다",
      "status": "ok"
    }
  ],
  def: {
    "statusFirst": true,
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 2.2,
          "max": 2.2,
          "target": "tag:burn"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "name": "화공",
          "target": "random_enemy_1",
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
    // 「랜덤 적군 단일 목표에게 2턴 동안 지속되는 화공을 부여한다」
    c.status(0);
    // 「이후 화공 상태를 보유한 적군 목표에게 2턴 동안 지속되는 연소 상태를 1스택 부여하며」
    const burn = c.tag('burn', c.enemiesOf(c.unit).filter(u => c.has(u, '화공')));
    c.status({ name: '연소', target: 'tag:burn', duration: 2 });
    // 「220%의 책략피해를 주고」
    c.damage(0);
    // 「40%확률로 (지력의 영향 받음) 추가로 1스택의 연소 상태를 부여한다」 — 목표마다 판정
    burn.forEach((u, i) => { if (u.alive && c.chance(0.4 * c.infl('지력'))) { c.tag('b' + i, [u]); c.status({ name: '연소', target: 'tag:b' + i, duration: 2 }); } });
  },
});
