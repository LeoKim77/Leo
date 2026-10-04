// 신체개조 · 전법 · 패시브 100%
// 원문: 매 턴 시작 시, 자신이 가하는 피해가 10% 증가합니다. 최대 3회 중첩되며, 전투 종료 시까지 지속됩니다. 매 턴 행동 시 55% 확률로 자신이 아래 효과를 획득합니다. 각 효과는 독립적으로 판정됩니다. 자신의 병력을 회복합니다. 치료율 200%(가장 높은 속성의 영향을 받음). 받는 피해가 20% 감소합니다. 지속시간은 1턴입니다.
// 원문 절 구현: ok / ok / ok / ok / ok / ok / approx / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "wash-marrow",
  name: "신체개조",
  kind: "패시브",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "회복의 \"가장 높은 속성 영향\"을 지력으로 계산",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 시작 시, 자신이 가하는 피해가 10% 증가합니다",
      "status": "ok"
    },
    {
      "text": "최대 3회 중첩되며",
      "status": "ok"
    },
    {
      "text": "전투 종료 시까지 지속됩니다",
      "status": "ok"
    },
    {
      "text": "매 턴 행동 시 55% 확률로 자신이 아래 효과를 획득합니다",
      "status": "ok"
    },
    {
      "text": "각 효과는 독립적으로 판정됩니다",
      "status": "ok"
    },
    {
      "text": "자신의 병력을 회복합니다",
      "status": "ok"
    },
    {
      "text": "치료율 200%(가장 높은 속성의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "받는 피해가 20% 감소합니다",
      "status": "ok"
    },
    {
      "text": "지속시간은 1턴입니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "주는피해",
          "min": 0.1,
          "max": 0.1,
          "target": "self",
          "duration": 999,
          "maxStacks": 3
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "action",
        "effects": {
          "damage": [],
          "heal": [
            {
              "min": 2,
              "max": 2,
              "target": "self",
              "chance": 0.55
            }
          ],
          "buffs": [
            {
              "stat": "받는피해",
              "min": -0.2,
              "max": -0.2,
              "target": "self",
              "duration": 1,
              "maxStacks": 1,
              "chance": 0.55
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "회복의 \"가장 높은 속성 영향\"을 지력으로 계산",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 주는피해 +10%, 대상 self, 전투 종료까지, 최대 3중첩
  },
});
