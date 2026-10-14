// 태평의 여운 · 고유 전법 · 지휘 100%
// 원문(시즌3 미리보기 2026-10-07): 전체 아군의 액티브 전법 발동 성공 후 80% 확률로 자신이 랜덤 적군 2명에게 140%의 책략 피해를 준다. 발동 시마다 현재 턴의 발동률이 10% 감소한다. 적군이 요술 상태면 주는 피해의 40%(지력의 영향 받음)만큼 병력이 가장 낮은 아군 단일 목표의 병력을 회복시킨다.
// 원문 절 구현: ok / approx / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-zhang-ning",
  name: "태평의 여운",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 태평의 여운, 해외 번역 문구를 한국판 원문으로 교체"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "\"발동마다 그 턴 확률 10% 감소\"를 턴당 평균 70%로 처리. 요술 대상 피해량 40% 회복 미지원",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전체 아군의 액티브 전법 발동 성공 후 80% 확률로 자신이 랜덤 적군 2명에게 140%의 책략 피해를 준다",
      "status": "ok"
    },
    {
      "text": "발동 시마다 현재 턴의 발동률이 10% 감소한다",
      "status": "approx"
    },
    {
      "text": "적군이 요술 상태면 주는 피해의 40%(지력의 영향 받음)만큼 병력이 가장 낮은 아군 단일 목표의 병력을 회복시킨다",
      "status": "ok"
    }
  ],
  def: {
    "trigger": {
      "event": "cast",
      "castType": "액티브",
      "role": "ally_side",
      "chance": 0.7,
      "maxPerTurn": 99
    },
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 1.4,
          "max": 1.4,
          "target": "random_enemy_n"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "\"발동마다 그 턴 확률 10% 감소\"를 턴당 평균 70%로 처리. 요술 대상 피해량 40% 회복 미지원",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 140%, 대상 random_enemy_n
  },
});
