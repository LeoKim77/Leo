// 현묘한계책 · 고유 전법 · 지휘 100%
// 원문: 매 턴 시작시, 90% 확률로 랜덤 적군 단일 목표와 우군 1명에게 2턴 동안 지속되는 혼란을 부여한다. 적군 목표가 이미 혼란 상태일 경우, 추가로 300%의 책략 피해를 준다. 우군 목표가 이미 혼란 상태일 경우, 추가로 해당 목표와 자신의 병력을 회복한다. (치유율 110% 지력의 영향 받음)
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-jia-xu",
  name: "현묘한계책",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "원문 전체 구현",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-05",
      "note": "90% 판정 1번(대상 앞), '적군이 이미 혼란이면 300%', '우군이 이미 혼란이면 그 우군과 자신 회복 110%' 구현"
    }
  ],
  clauses: [
    {
      "text": "매 턴 시작시, 90% 확률로 랜덤 적군 단일 목표와 우군 1명에게 2턴 동안 지속되는 혼란을 부여한다",
      "status": "ok"
    },
    {
      "text": "적군 목표가 이미 혼란 상태일 경우, 추가로 300%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "우군 목표가 이미 혼란 상태일 경우, 추가로 해당 목표와 자신의 병력을 회복한다",
      "status": "ok"
    },
    {
      "text": "(치유율 110% 지력의 영향 받음)",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 3,
          "max": 3,
          "target": "tag:e",
          "tag": "e",
          "condition": null
        }
      ],
      "heal": [
        {
          "min": 1.1,
          "max": 1.1,
          "target": "tag:h"
        }
      ],
      "statusEffects": [
        {
          "name": "혼란",
          "target": "tag:e",
          "duration": 2
        },
        {
          "name": "혼란",
          "target": "tag:a",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "원문 전체 구현 (2026-10-05)",
    "replacedLegacy": false
  },
  run(c) {
    // 「매 턴 시작시, 90% 확률로 랜덤 적군 단일 목표와 우군 1명에게 2턴 동안 지속되는 혼란을 부여한다」
    if (!c.chance(0.9)) return;
    const e = c.tag('e', c.targets('random_enemy_1'));
    const a = c.tag('a', c.targets('random_ally_1'));
    const eHad = e.length > 0 && c.has(e[0], '혼란'), aHad = a.length > 0 && c.has(a[0], '혼란');
    c.status(0); c.status(1);
    // 「적군 목표가 이미 혼란 상태일 경우, 추가로 300%의 책략 피해를 준다」
    if (eHad) c.damage(0);
    // 「우군 목표가 이미 혼란 상태일 경우, 추가로 해당 목표와 자신의 병력을 회복한다」
    // 「(치유율 110% 지력의 영향 받음)」
    if (aHad) { c.tag('h', [a[0], c.unit]); c.heal(0); }
  },
});
