// 구벌중원 · 고유 전법 · 지휘 100%
// 원문: 매 턴 종료 시 1~3회 토벌을 실시합니다. 토벌 시 적군 무작위 2명에게 40%의 병기 피해와 책략 피해를 입힙니다. 아군 전체가 피해를 가할 때마다 해당 턴의 토벌 피해 계수가 5% 증가하며, 최대 9회까지 증가합니다. 토벌이 누적 3회 발동하면 적군 중 병력이 가장 낮은 단일 대상에게 도주병을 발생시킵니다(지력과 무력의 영향을 받음).
// 원문 절 구현: approx / ok / approx / ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-jiang-wei",
  name: "구벌중원",
  kind: "지휘",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "토벌 1~3회를 1회 확정+66.7%+33.3%(기대 2회)로, 피해 계수 증가는 턴당 평균 6회 가정(+30%, 40%→52%)으로 처리. 도주병은 2턴 종료 시 1회(누적 3회 시점 근사, 무력 기준)",
    "source": "authored"
  },
  clauses: [
    {
      "text": "매 턴 종료 시 1~3회 토벌을 실시합니다",
      "status": "approx"
    },
    {
      "text": "토벌 시 적군 무작위 2명에게 40%의 병기 피해와 책략 피해를 입힙니다",
      "status": "ok"
    },
    {
      "text": "아군 전체가 피해를 가할 때마다 해당 턴의 토벌 피해 계수가 5% 증가하며",
      "status": "approx"
    },
    {
      "text": "최대 9회까지 증가합니다",
      "status": "ok"
    },
    {
      "text": "토벌이 누적 3회 발동하면 적군 중 병력이 가장 낮은 단일 대상에게 도주병을 발생시킵니다(지력과 무력의 영향을 받음)",
      "status": "approx"
    }
  ],
  def: {
    "_timing": "turnEnd",
    "desertionStat": "무력",
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 0.52,
          "max": 0.52,
          "target": "random_enemy_n",
          "tag": "t1"
        },
        {
          "dmgType": "책략",
          "min": 0.52,
          "max": 0.52,
          "target": "tag:t1"
        },
        {
          "dmgType": "병기",
          "min": 0.52,
          "max": 0.52,
          "target": "random_enemy_n",
          "tag": "t2",
          "chance": 0.667
        },
        {
          "dmgType": "책략",
          "min": 0.52,
          "max": 0.52,
          "target": "tag:t2",
          "chance": 0.667
        },
        {
          "dmgType": "병기",
          "min": 0.52,
          "max": 0.52,
          "target": "random_enemy_n",
          "tag": "t3",
          "chance": 0.333
        },
        {
          "dmgType": "책략",
          "min": 0.52,
          "max": 0.52,
          "target": "tag:t3",
          "chance": 0.333
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "parts": [
      {
        "_timing": "turnEnd",
        "onlyTurns": [
          2
        ],
        "desertionStat": "무력",
        "effects": {
          "damage": [],
          "heal": [],
          "buffs": [],
          "statMods": [],
          "statusEffects": [
            {
              "name": "탈주병",
              "target": "lowest_hp_enemy"
            }
          ],
          "targets": []
        }
      }
    ],
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "토벌 1~3회를 1회 확정+66.7%+33.3%(기대 2회)로, 피해 계수 증가는 턴당 평균 6회 가정(+30%, 40%→52%)으로 처리. 도주병은 2턴 종료 시 1회(누적 3회 시점 근사, 무력 기준)",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 병기 52%, 대상 random_enemy_n
    c.damage(1);   // 책략 52%, 대상 tag:t1
    c.damage(2);   // 병기 52%, 대상 random_enemy_n, 확률 66.7%
    c.damage(3);   // 책략 52%, 대상 tag:t2, 확률 66.7%
    c.damage(4);   // 병기 52%, 대상 random_enemy_n, 확률 33.3%
    c.damage(5);   // 책략 52%, 대상 tag:t3, 확률 33.3%
  },
});
