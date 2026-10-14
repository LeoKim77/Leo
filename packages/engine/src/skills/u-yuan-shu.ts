// 참호천자 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후 첫 4턴 동안, 아군 전체의 통솔이 80 증가합니다(통솔의 영향을 받음). 이 효과로 증가한 통솔은 매 턴 종료 시 15씩 감소합니다. 또한 4턴 시작 시, 아군 중 통솔이 가장 높은 무장이 옥새를 획득합니다. 옥새 효과: 가하는 피해가 15% 증가합니다(통솔의 영향을 받음). 자신의 행동 종료 시, 적군 전체에게 160%의 병기 피해를 입힙니다(옥새 보유자의 통솔 영향을 받음).
// 원문 절 구현: ok / approx / ok / ok / approx / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-yuan-shu",
  name: "참호천자",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "통솔 영향 미반영. 옥새 피해는 행동 종료 시 처리. 옥새 보유자는 4턴 시작 시 통솔 기준으로 1회 결정",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후 첫 4턴 동안",
      "status": "ok"
    },
    {
      "text": "아군 전체의 통솔이 80 증가합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "이 효과로 증가한 통솔은 매 턴 종료 시 15씩 감소합니다",
      "status": "ok"
    },
    {
      "text": "또한 4턴 시작 시, 아군 중 통솔이 가장 높은 무장이 옥새를 획득합니다",
      "status": "ok"
    },
    {
      "text": "옥새 효과: 가하는 피해가 15% 증가합니다(통솔의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "자신의 행동 종료 시, 적군 전체에게 160%의 병기 피해를 입힙니다(옥새 보유자의 통솔 영향을 받음)",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "통솔",
          "min": 80,
          "max": 80,
          "target": "all_ally",
          "duration": 4,
          "maxStacks": 1
        }
      ],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "onlyTurns": [
          1
        ],
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "통솔",
              "min": -15,
              "max": -15,
              "target": "all_ally",
              "duration": 3,
              "maxStacks": 1
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      },
      {
        "_timing": "turnEnd",
        "onlyTurns": [
          2
        ],
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "통솔",
              "min": -15,
              "max": -15,
              "target": "all_ally",
              "duration": 2,
              "maxStacks": 1
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      },
      {
        "_timing": "turnEnd",
        "onlyTurns": [
          3
        ],
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [
            {
              "stat": "통솔",
              "min": -15,
              "max": -15,
              "target": "all_ally",
              "duration": 1,
              "maxStacks": 1
            }
          ],
          "statusEffects": [],
          "targets": []
        }
      },
      {
        "_timing": "turnStart",
        "onlyTurns": [
          4
        ],
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "주는피해",
              "min": 0.15,
              "max": 0.15,
              "target": "highest_command_ally",
              "duration": 999,
              "maxStacks": 1,
              "tag": "y"
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": [],
          "grants": [
            {
              "key": "옥새",
              "target": "tag:y",
              "skill": {
                "type": "패시브",
                "_timing": "actionEnd",
                "effects": {
                  "damage": [
                    {
                      "dmgType": "병기",
                      "min": 1.6,
                      "max": 1.6,
                      "target": "all_enemy"
                    }
                  ],
                  "heal": [],
                  "buffs": [],
                  "statMods": [],
                  "statusEffects": [],
                  "targets": []
                }
              }
            }
          ]
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "통솔 영향 미반영. 옥새 피해는 행동 종료 시 처리. 옥새 보유자는 4턴 시작 시 통솔 기준으로 1회 결정",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 통솔 80, 대상 all_ally, 4턴, 최대 1중첩
  },
});
