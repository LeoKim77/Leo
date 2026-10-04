// 장춘화 고유 전법 · 고유 전법 · 지휘 100%
// 원문: 아군 중 지력이 가장 높은 단일 무장이 일반 공격을 한 후, 대상에게 70%의 책략 피해를 입힙니다(추가로 심계 중첩 수의 영향을 받음). 또한 20% 확률(지력의 영향을 받음)로 심계 1중첩을 획득합니다. 심계 효과: 책략 피해가 3% 증가하며, 최대 10중첩까지 보유할 수 있습니다. 매 턴 지력이 가장 높은 단일 무장이 행동한 후 일반 공격을 1회 추가로 실시합니다. 단, 심계가 6중첩 미만일 경우 이 추가 일반 공격으로는 추격 전법을 발동할 수 없습니다.
// 원문 절 구현: ok / approx / ok / ok / ok / ok / ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-chunhua",
  name: "장춘화 고유 전법",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "지력 최고 아군은 전투 시작 때 1회 결정. 심계는 주는 책략 피해 +3%/중첩으로만 반영(추가 피해 계수 영향 미반영). 추가 일반 공격은 행동 시작에 처리하고 심계 6중첩 미만 추격 금지 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "아군 중 지력이 가장 높은 단일 무장이 일반 공격을 한 후",
      "status": "ok"
    },
    {
      "text": "대상에게 70%의 책략 피해를 입힙니다(추가로 심계 중첩 수의 영향을 받음)",
      "status": "approx"
    },
    {
      "text": "또한 20% 확률(지력의 영향을 받음)로 심계 1중첩을 획득합니다",
      "status": "ok"
    },
    {
      "text": "심계 효과: 책략 피해가 3% 증가하며",
      "status": "ok"
    },
    {
      "text": "최대 10중첩까지 보유할 수 있습니다",
      "status": "ok"
    },
    {
      "text": "매 턴 지력이 가장 높은 단일 무장이 행동한 후 일반 공격을 1회 추가로 실시합니다",
      "status": "ok"
    },
    {
      "text": "단",
      "status": "ok"
    },
    {
      "text": "심계가 6중첩 미만일 경우 이 추가 일반 공격으로는 추격 전법을 발동할 수 없습니다",
      "status": "approx"
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
          "key": "심계",
          "target": "highest_intel_ally",
          "skill": {
            "type": "패시브",
            "trigger": {
              "event": "damage",
              "role": "dealt",
              "afterBasic": true,
              "chance": 1,
              "maxPerTurn": 99
            },
            "effects": {
              "damage": [
                {
                  "dmgType": "책략",
                  "min": 0.7,
                  "max": 0.7,
                  "target": "trigger_defender"
                }
              ],
              "heal": [],
              "buffs": [
                {
                  "stat": "주는책략피해",
                  "min": 0.03,
                  "max": 0.03,
                  "target": "self",
                  "duration": 999,
                  "maxStacks": 10,
                  "chance": 0.2
                }
              ],
              "statMods": [],
              "statusEffects": [],
              "targets": []
            }
          }
        },
        {
          "key": "추가 일반 공격",
          "target": "highest_intel_ally",
          "skill": {
            "type": "패시브",
            "_timing": "action",
            "effects": {
              "damage": [
                {
                  "dmgType": "병기",
                  "min": 1,
                  "max": 1,
                  "target": "random_enemy_1",
                  "asBasicAttack": true
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
    "authoredNote": "지력 최고 아군은 전투 시작 때 1회 결정. 심계는 주는 책략 피해 +3%/중첩으로만 반영(추가 피해 계수 영향 미반영). 추가 일반 공격은 행동 시작에 처리하고 심계 6중첩 미만 추격 금지 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.grant(0);   // 「심계」 부여, 대상 highest_intel_ally
    c.grant(1);   // 「추가 일반 공격」 부여, 대상 highest_intel_ally
  },
});
