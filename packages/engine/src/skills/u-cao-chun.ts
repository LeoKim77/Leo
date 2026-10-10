// 조순 고유 전법 · 고유 전법 · 지휘 100%
// 원문: 전투 시작 후, 아군 기병 및 창병이 일반 공격을 한 뒤 자신이 가하는 피해가 5% 증가합니다(가장 높은 속성의 영향을 받음). 이 효과는 최대 6회 중첩됩니다. 3턴부터, 아군 기병 및 창병이 행동할 때 추가로 적군 무작위 단일 대상에게 140%의 병기 피해를 입힙니다.
// 원문 절 구현: approx / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-cao-chun",
  name: "조순 고유 전법",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "\"가장 높은 속성 영향\" 미반영. 3턴부터의 추가 피해를 \"행동할 때\" 대신 행동 시작(패시브 순서)에서 처리. 병종이 기병·창병인 아군에게만 동작",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 후, 아군 기병 및 창병이 일반 공격을 한 뒤 자신이 가하는 피해가 5% 증가합니다(가장 높은 속성의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "이 효과는 최대 6회 중첩됩니다",
      "status": "ok"
    },
    {
      "text": "3턴부터",
      "status": "ok"
    },
    {
      "text": "아군 기병 및 창병이 행동할 때 추가로 적군 무작위 단일 대상에게 140%의 병기 피해를 입힙니다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "grants": [
        {
          "key": "조순·기병 일반 공격 후",
          "target": "all_ally",
          "skill": {
            "type": "패시브",
            "trigger": {
              "event": "damage",
              "role": "dealt",
              "afterBasic": true,
              "chance": 1,
              "maxPerTurn": 99,
              "condition": {
                "type": "unitType",
                "who": "self",
                "value": "기병"
              }
            },
            "effects": {
              "damage": [],
              "heal": [],
              "buffs": [
                {
                  "stat": "주는피해",
                  "min": 0.05,
                  "max": 0.05,
                  "target": "self",
                  "duration": 999,
                  "maxStacks": 6
                }
              ],
              "statMods": [],
              "statusEffects": [],
              "targets": []
            }
          }
        },
        {
          "key": "조순·창병 일반 공격 후",
          "target": "all_ally",
          "skill": {
            "type": "패시브",
            "trigger": {
              "event": "damage",
              "role": "dealt",
              "afterBasic": true,
              "chance": 1,
              "maxPerTurn": 99,
              "condition": {
                "type": "unitType",
                "who": "self",
                "value": "창병"
              }
            },
            "effects": {
              "damage": [],
              "heal": [],
              "buffs": [
                {
                  "stat": "주는피해",
                  "min": 0.05,
                  "max": 0.05,
                  "target": "self",
                  "duration": 999,
                  "maxStacks": 6
                }
              ],
              "statMods": [],
              "statusEffects": [],
              "targets": []
            }
          }
        },
        {
          "key": "조순·기병 추가 피해",
          "target": "all_ally",
          "skill": {
            "type": "패시브",
            "_timing": "action",
            "onlyTurns": [
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "effects": {
              "damage": [
                {
                  "dmgType": "병기",
                  "min": 1.4,
                  "max": 1.4,
                  "target": "random_enemy_1",
                  "condition": {
                    "type": "unitType",
                    "who": "attacker",
                    "value": "기병"
                  }
                }
              ],
              "heal": [],
              "buffs": [],
              "statMods": [],
              "statusEffects": [],
              "targets": []
            }
          }
        },
        {
          "key": "조순·창병 추가 피해",
          "target": "all_ally",
          "skill": {
            "type": "패시브",
            "_timing": "action",
            "onlyTurns": [
              3,
              4,
              5,
              6,
              7,
              8
            ],
            "effects": {
              "damage": [
                {
                  "dmgType": "병기",
                  "min": 1.4,
                  "max": 1.4,
                  "target": "random_enemy_1",
                  "condition": {
                    "type": "unitType",
                    "who": "attacker",
                    "value": "창병"
                  }
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
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"가장 높은 속성 영향\" 미반영. 3턴부터의 추가 피해를 \"행동할 때\" 대신 행동 시작(패시브 순서)에서 처리. 병종이 기병·창병인 아군에게만 동작",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.grant(0);   // 「조순·기병 일반 공격 후」 부여, 대상 all_ally
    c.grant(1);   // 「조순·창병 일반 공격 후」 부여, 대상 all_ally
    c.grant(2);   // 「조순·기병 추가 피해」 부여, 대상 all_ally
    c.grant(3);   // 「조순·창병 추가 피해」 부여, 대상 all_ally
  },
});
