// 고통의 심계 · 고유 전법 · 지휘 100%
// 원문(시즌3 미리보기 2026-10-07): 지력이 가장 높은 아군 단일 목표가 일반 공격 후, 목표에게 70%의 책략 피해를 주며(추가로 심계 스택수의 영향 받음), 25% 확률로(지력의 영향 받음) 1스택의 심계를 획득한다. 심계: 책략 피해가 3% 증가하며, 최대 10스택 중첩된다. 매 턴 지력이 가장 높은 단일 목표가 행동 후, 추가로 일반 공격을 1회 시전한다(심계 스택수가 6회 미만이면 추격 전법 발동 불가).
// 원문 절 구현: ok / approx / ok / ok / ok / ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-chunhua",
  name: "고통의 심계",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 고통의 심계, 심계 획득 확률 20% → 25%(지력 영향)"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "지력 최고 아군은 전투 시작 때 1회 결정. 심계는 주는 책략 피해 +3%/중첩으로만 반영(추가 피해 계수 영향 미반영). 추가 일반 공격은 행동 시작에 처리하고 심계 6중첩 미만 추격 금지 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "지력이 가장 높은 아군 단일 목표가 일반 공격 후",
      "status": "ok"
    },
    {
      "text": "목표에게 70%의 책략 피해를 주며(추가로 심계 스택수의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "25% 확률로(지력의 영향 받음) 1스택의 심계를 획득한다",
      "status": "ok"
    },
    {
      "text": "심계: 책략 피해가 3% 증가하며",
      "status": "ok"
    },
    {
      "text": "최대 10스택 중첩된다",
      "status": "ok"
    },
    {
      "text": "매 턴 지력이 가장 높은 단일 목표가 행동 후",
      "status": "ok"
    },
    {
      "text": "추가로 일반 공격을 1회 시전한다(심계 스택수가 6회 미만이면 추격 전법 발동 불가)",
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
                  "chance": 0.25
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
