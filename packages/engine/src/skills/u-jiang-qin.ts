// 천하무략 · 고유 전법 · 액티브 50%
// 원문: 2턴 동안 자신의 지력과 무력이 20포인트 증가하며, 2회 중첩될 수 있다. 랜덤 적군 2명에 2턴 동안 지속되는 홍수을(를) 부여하며, 목표가 이미 홍수 상태면 100%의 병기와 책략 피해를 준다.
// 원문 절 구현: ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-jiang-qin",
  name: "천하무략",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "ok",
    "note": "홍수 부여 전에 이미 홍수였던 목표만 100% 병기·책략",
    "source": "authored"
  },
  revised: [
    {
      "date": "2026-10-11",
      "note": "영웅 녹화 원문 순서대로 run(c)·partRuns 작성"
    }
  ],
  clauses: [
    {
      "text": "2턴 동안 자신의 지력과 무력이 20포인트 증가하며",
      "status": "ok"
    },
    {
      "text": "2회 중첩될 수 있다",
      "status": "ok"
    },
    {
      "text": "랜덤 적군 2명에 2턴 동안 지속되는 홍수을(를) 부여하며",
      "status": "ok"
    },
    {
      "text": "목표가 이미 홍수 상태면 100%의 병기와 책략 피해를 준다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "병기",
          "min": 1,
          "max": 1,
          "target": "tag:had"
        },
        {
          "dmgType": "책략",
          "min": 1,
          "max": 1,
          "target": "tag:had"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "지력",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        },
        {
          "stat": "무력",
          "min": 20,
          "max": 20,
          "target": "self",
          "duration": 2,
          "maxStacks": 2
        }
      ],
      "statusEffects": [
        {
          "name": "홍수",
          "target": "tag:two",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "ok",
    "authoredNote": "홍수 부여 전에 이미 홍수였던 목표만 100% 병기·책략",
    "replacedLegacy": false
  },
  run(c) {
    // 「2턴 동안 자신의 지력과 무력이 20포인트 증가하며, 2회 중첩될 수 있다」
    c.statMod(0);
    c.statMod(1);
    // 「랜덤 적군 2명에 2턴 동안 지속되는 홍수을(를) 부여하며」 — 부여 전에 이미 홍수였던 목표를 기억
    const two = c.tag('two', c.targets('random_enemy_n'));
    c.tag('had', two.filter(u => c.has(u, '홍수')));
    c.status(0);
    // 「목표가 이미 홍수 상태면 100%의 병기와 책략 피해를 준다」
    if (c.tagged('had').length) { c.damage(0); c.damage(1); }
  },
});
