// 불굴의 의지 · 고유 전법 · 패시브 100%
// 원문: 우군이 현재 병력의 10%보다 높은 피해를 받기 직전, 80%확률(통솔의 영향 받음)로 우군을 위해 해당 피해를 부담한다. 매 턴 각 우군마다 최대 3회 부담할 수 있으며, 부담하는 피해가 50%감소한다(통솔의 영향 받음). 자신이 곧 사망할 때 생존한 우군이 있으면 100%확률로 불굴이 발동된다. 불굴: 치명적인 피해를 1회 면역한다. 불굴이 발동될 때마다 다음 발동률이 10%감소한다.
// 원문 절 구현: ok / approx / ok / approx / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhou-tai",
  name: "불굴의 의지",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "전보(2026-10-03)로 확인한 구조: 매 턴 시작 시 우군에게 「불굴의 의지」를 걸고 주태 행동 종료 시 해제, 그동안 현재 병력 10% 초과 피해를 80% 확률로 50% 줄여 대신 받음(우군당 턴 3회). 확률·감소율의 통솔 영향은 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "우군이 현재 병력의 10%보다 높은 피해를 받기 직전",
      "status": "ok"
    },
    {
      "text": "80%확률(통솔의 영향 받음)로 우군을 위해 해당 피해를 부담한다",
      "status": "approx"
    },
    {
      "text": "매 턴 각 우군마다 최대 3회 부담할 수 있으며",
      "status": "ok"
    },
    {
      "text": "부담하는 피해가 50%감소한다(통솔의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "자신이 곧 사망할 때 생존한 우군이 있으면 100%확률로 불굴이 발동된다",
      "status": "ok"
    },
    {
      "text": "불굴: 치명적인 피해를 1회 면역한다",
      "status": "ok"
    },
    {
      "text": "불굴이 발동될 때마다 다음 발동률이 10%감소한다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "guardAllies": {
        "threshold": 0.1,
        "chance": 0.8,
        "perTurn": 3,
        "cut": 0.5,
        "unyielding": {
          "decay": 0.1
        }
      }
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "전보(2026-10-03)로 확인한 구조: 매 턴 시작 시 우군에게 「불굴의 의지」를 걸고 주태 행동 종료 시 해제, 그동안 현재 병력 10% 초과 피해를 80% 확률로 50% 줄여 대신 받음(우군당 턴 3회). 확률·감소율의 통솔 영향은 미반영",
    "replacedLegacy": false
  },
  run(c) {
    c.guard();   // 보호 상태(대신 받기)
  },
});
