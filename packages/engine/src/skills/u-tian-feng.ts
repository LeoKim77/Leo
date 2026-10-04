// 지략 방어 · 고유 전법 · 액티브 60%
// 원문: 통솔이 가장 높은 아군 단일 목표가 1스택의 방어를 획득하고, 무력, 지력, 선공이 40포인트 증가한다 (최고 속성의 영향 받음). 통솔이 가장 낮은 적군 단일 목표의 무력, 지력, 선공이 40포인트 감소한다(최고 속성의 영향 받음). 해당 효과는 2턴 동안 지속된다.
// 원문 절 구현: ok / ok / ok / ok / ok / ok / ok / ok
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-tian-feng",
  name: "지략 방어",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "최고 속성 영향 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "통솔이 가장 높은 아군 단일 목표가 1스택의 방어를 획득하고",
      "status": "ok"
    },
    {
      "text": "무력",
      "status": "ok"
    },
    {
      "text": "지력",
      "status": "ok"
    },
    {
      "text": "선공이 40포인트 증가한다 (최고 속성의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "통솔이 가장 낮은 적군 단일 목표의 무력",
      "status": "ok"
    },
    {
      "text": "지력",
      "status": "ok"
    },
    {
      "text": "선공이 40포인트 감소한다(최고 속성의 영향 받음)",
      "status": "ok"
    },
    {
      "text": "해당 효과는 2턴 동안 지속된다",
      "status": "ok"
    }
  ],
  def: {
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [],
      "statMods": [
        {
          "stat": "무력",
          "min": 40,
          "max": 40,
          "target": "highest_command_ally",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "지력",
          "min": 40,
          "max": 40,
          "target": "highest_command_ally",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "선공",
          "min": 40,
          "max": 40,
          "target": "highest_command_ally",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "무력",
          "min": -40,
          "max": -40,
          "target": "lowest_control_enemy",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "지력",
          "min": -40,
          "max": -40,
          "target": "lowest_control_enemy",
          "duration": 2,
          "maxStacks": 1
        },
        {
          "stat": "선공",
          "min": -40,
          "max": -40,
          "target": "lowest_control_enemy",
          "duration": 2,
          "maxStacks": 1
        }
      ],
      "statusEffects": [
        {
          "name": "방어",
          "target": "highest_command_ally",
          "duration": 99
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "최고 속성 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // (원문 절 매핑 없음)
    c.statMod(0);   // 무력 40, 대상 highest_command_ally, 2턴, 최대 1중첩
    c.statMod(1);   // 지력 40, 대상 highest_command_ally, 2턴, 최대 1중첩
    c.statMod(2);   // 선공 40, 대상 highest_command_ally, 2턴, 최대 1중첩
    c.statMod(3);   // 무력 -40, 대상 lowest_control_enemy, 2턴, 최대 1중첩
    c.statMod(4);   // 지력 -40, 대상 lowest_control_enemy, 2턴, 최대 1중첩
    c.statMod(5);   // 선공 -40, 대상 lowest_control_enemy, 2턴, 최대 1중첩
    c.status(0);   // 방어, 대상 highest_command_ally, 99턴
  },
});
