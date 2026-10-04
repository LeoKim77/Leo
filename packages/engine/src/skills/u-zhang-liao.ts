// 바람방랑자 · 고유 전법 · 패시브 100%
// 원문: 관통이(가) 20%증가한다. 매 턴 시작시, 60%확률(이미 손실된 병력의 영향 받음)로 1턴 동안 정신회복을 획븍한다. 자신이 전열이면 피해를 준 후, 랜덤 적군 단일 목표에서 50%의 피해전달을 주며 후열 목표를 우선적으로 선택한다.
// 원문 절 구현: ok / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-liao",
  name: "바람방랑자",
  kind: "패시브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "손실 병력 영향, 전열 시 피해 전달 미지원",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-04",
      "note": "'자신이 전열이면 피해를 준 후, 그 피해의 50%를 랜덤 적 1명(후열 우선)에게 피해 전달' 구현"
    }
  ],
  clauses: [
    {
      "text": "관통이(가) 20%증가한다",
      "status": "ok"
    },
    {
      "text": "매 턴 시작시, 60%확률(이미 손실된 병력의 영향 받음)로 1턴 동안 정신회복을 획븍한다",
      "status": "approx"
    },
    {
      "text": "자신이 전열이면 피해를 준 후, 랜덤 적군 단일 목표에서 50%의 피해전달을 주며 후열 목표를 우선적으로 선택한다",
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
      "statusEffects": [
        {
          "name": "정신 회복",
          "target": "self",
          "chance": 0.6,
          "duration": 1
        }
      ],
      "targets": []
    },
    "parts": [
      {
        "_timing": "battleStart",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [
            {
              "stat": "방어관통",
              "min": 0.2,
              "max": 0.2,
              "target": "self",
              "duration": 999,
              "maxStacks": 1
            }
          ],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      },
      {
        "trigger": {
          "event": "damage",
          "role": "dealt",
          "chance": 1,
          "condition": {
            "type": "position",
            "who": "self",
            "pos": "front"
          }
        },
        "effects": {
          "damage": [
            {
              "dmgType": "병기",
              "transferOfEvent": 0.5,
              "target": "random_enemy_back_first"
            }
          ]
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "손실 병력 영향, 전열 시 피해 전달 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.status(0);   // 정신 회복, 대상 self, 확률 60%, 1턴
  },
});
