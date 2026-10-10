// 결사의 다짐 · 전법 · 지휘 100%
// 원문: 전투 시작 시, 랜덤 아군 단일 목표(전열 우선)가 결사 획득: 행동 전, 자신의 병력을 회복하며(치유율 80%, 목표의 지력과 통솔의 영향 받음), 받는 병기 피해가 20% 감소한다. 무력이 가장 높은 아군 단일 목표가 다짐 획득: 일반 공격 후, 50% 확률로 랜덤 적군 단일 목표에게 100%의 병기 피해를 1회 준다.
// 원문 절 구현: ok / approx / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "armor-edge",
  name: "결사의 다짐",
  kind: "지휘",
  isUnique: false,
  engineStatus: {
    "status": "approx",
    "note": "결사 회복은 받은 무장의 통솔 기준(전보: 주태 통솔 315 → 회복 297, 252 → 218 — 엔진 예측은 약 12% 높음, 지력 영향 미반영)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전투 시작 시, 랜덤 아군 단일 목표(전열 우선)가 결사 획득: 행동 전",
      "status": "ok"
    },
    {
      "text": "자신의 병력을 회복하며(치유율 80%, 목표의 지력과 통솔의 영향 받음)",
      "status": "approx"
    },
    {
      "text": "받는 병기 피해가 20% 감소한다",
      "status": "ok"
    },
    {
      "text": "무력이 가장 높은 아군 단일 목표가 다짐 획득: 일반 공격 후",
      "status": "ok"
    },
    {
      "text": "50% 확률로 랜덤 적군 단일 목표에게 100%의 병기 피해를 1회 준다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "battleStart",
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는병기피해",
          "min": -0.2,
          "max": -0.2,
          "target": "random_ally_front",
          "duration": 999,
          "maxStacks": 1,
          "tag": "k"
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": [],
      "grants": [
        {
          "key": "결사",
          "target": "tag:k",
          "skill": {
            "_timing": "action",
            "effects": {
              "damage": [],
              "heal": [
                {
                  "min": 0.8,
                  "max": 0.8,
                  "target": "self",
                  "stat": "통솔"
                }
              ],
              "buffs": [],
              "statMods": [],
              "statusEffects": [],
              "targets": [
                "self"
              ]
            }
          }
        },
        {
          "key": "다짐",
          "target": "highest_power_ally",
          "skill": {
            "trigger": {
              "event": "damage",
              "role": "dealt",
              "afterBasic": true,
              "chance": 0.5,
              "maxPerTurn": 9
            },
            "effects": {
              "damage": [
                {
                  "dmgType": "병기",
                  "min": 1,
                  "max": 1,
                  "target": "random_enemy_1"
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
    "authoredNote": "결사 회복은 받은 무장의 통솔 기준(전보: 주태 통솔 315 → 회복 297, 252 → 218 — 엔진 예측은 약 12% 높음, 지력 영향 미반영)",
    "replacedLegacy": true
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.buff(0);   // 받는병기피해 -20%, 대상 random_ally_front, 전투 종료까지, 최대 1중첩
    c.grant(0);   // 「결사」 부여, 대상 tag:k
    c.grant(1);   // 「다짐」 부여, 대상 highest_power_ally
  },
});
