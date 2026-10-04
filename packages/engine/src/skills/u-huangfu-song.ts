// 평란정반 · 고유 전법 · 지휘 100%
// 원문: 자신이 받는 피해가 12% 감소합니다(통솔의 영향을 받음). 매 턴 처음으로 피해를 받은 후 군령 1개를 획득합니다. 군령 효과: 아군 전체의 통솔이 25 증가하며, 중첩 가능합니다. 군령은 최대 10개까지 보유할 수 있습니다. 자신의 통솔이 60 증가할 때마다 군령 1개를 추가로 획득합니다. 처음으로 군령 10중첩을 보유하게 되면 적군 전체에게 260%의 병기 피해를 입힙니다(추가로 통솔 차이의 영향을 받음).
// 원문 절 구현: approx / ok / ok / ok / ok / missing / missing
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-huangfu-song",
  name: "평란정반",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "\"통솔 60 증가마다 군령 추가\"와 \"군령 10중첩 시 260% 피해\"는 미지원(피격 1회/턴만으로는 10중첩에 못 미침). 통솔 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "자신이 받는 피해가 12% 감소합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "매 턴 처음으로 피해를 받은 후 군령 1개를 획득합니다",
      "status": "ok"
    },
    {
      "text": "군령 효과: 아군 전체의 통솔이 25 증가하며",
      "status": "ok"
    },
    {
      "text": "중첩 가능합니다",
      "status": "ok"
    },
    {
      "text": "군령은 최대 10개까지 보유할 수 있습니다",
      "status": "ok"
    },
    {
      "text": "자신의 통솔이 60 증가할 때마다 군령 1개를 추가로 획득합니다",
      "status": "missing"
    },
    {
      "text": "처음으로 군령 10중첩을 보유하게 되면 적군 전체에게 260%의 병기 피해를 입힙니다(추가로 통솔 차이의 영향을 받음)",
      "status": "missing"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는피해",
          "min": -0.12,
          "max": -0.12,
          "target": "self",
          "duration": 999,
          "maxStacks": 1
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "trigger": {
          "event": "damage",
          "role": "taken",
          "chance": 1,
          "maxPerTurn": 1
        },
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "통솔",
              "min": 25,
              "max": 25,
              "target": "all_ally",
              "duration": 999,
              "maxStacks": 10
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"통솔 60 증가마다 군령 추가\"와 \"군령 10중첩 시 260% 피해\"는 미지원(피격 1회/턴만으로는 10중첩에 못 미침). 통솔 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는피해 -12%, 대상 self, 전투 종료까지, 최대 1중첩
  },
});
