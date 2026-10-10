// 음과 양 · 전법 · 지휘 100%
// 원문(도감 2026-10-07): 2번째 턴부터 턴 시작 시, 65% 확률로 랜덤 아군 2명의 병력을 회복한다(치유율 150%, 지력의 영향 받음). 턴 종료 시, 65% 확률로 랜덤 적군 2명에게 150%의 책략 피해를 준다.
// 원문 절 구현: ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "odd-even",
  name: "음과 양",
  kind: "지휘",
  isUnique: false,
  revised: [
    {
      "date": "2026-10-07",
      "note": "도감 녹화(S2 전설): 해외 번역 문구를 한국판 원문으로 교체(동작 같음)"
    }
  ],
  engineStatus: {
    "status": "ok",
    "source": "authored"
  },
  clauses: [
    {
      "text": "2번째 턴부터 턴 시작 시, 65% 확률로 랜덤 아군 2명의 병력을 회복한다(치유율 150%, 지력의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "턴 종료 시, 65% 확률로 랜덤 적군 2명에게 150%의 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "_timing": "turnStart",
    "onlyTurns": [
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ],
    "effects": {
      "damage": [],
      "heal": [
        {
          "min": 1.5,
          "max": 1.5,
          "target": "random_ally_n",
          "chance": 0.65,
          "chanceOnce": true
        }
      ],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "onlyTurns": [
          2,
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
              "dmgType": "책략",
              "min": 1.5,
              "max": 1.5,
              "target": "random_enemy_n",
              "chance": 0.65
            }
          ],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "ok",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.heal(0);   // 치유율 150%, 대상 random_ally_n, 확률 65%(1회 판정)
  },
});
