// 성운 대열 · 고유 전법 · 지휘 100%
// 원문(시즌3 미리보기 2026-10-07): 전체 아군이 받는 책략 피해가 10% 감소한다(지력의 영향받음, 자신에게 효과 30% 증가). 전투 시작 전에 성운 대열을 부여해 진형 보너스를 70% 증가시키고(지력의 영향 받음), 진형 유형에 따라 기국 버프을(를) 획득한다.
// 기국 버프(툴팁): 단일 전열 진형: 전열 아군이 받는 피해 12% 감소(지력의 영향 받음), 피격률 85%로 고정 / 이중 전열 진형: 통솔이 가장 낮은 아군 단일 목표가 전열에 주는 피해 20% 증가, 매 턴 행동 시, 랜덤 적군 1~2명에게 160%의 피해 부여(피해 유형은 무력 또는 지력 중 높은 항목에 따라 결정) / 삼중 전열 진형: 매 턴 종료 시, 지력이 가장 높은 아군 단일 목표가 전체 적군에게 60%의 책략 피해 부여(추가로 부대 전체의 총 치유량 영향 받음)
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-sp-zhuge-liang",
  name: "성운 대열",
  kind: "지휘",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기 영상: 이름 성라기포 → 성운 대열. 진형 보너스 +70%(지력 영향)·기국 버프(진형 전열 칸 수별 3종) 구현(FEAT-029), 자신 책략 피해 감소 ×1.3"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "삼중 전열 기국의 '부대 전체의 총 치유량 영향'은 공식 미상이라 미반영. 진형 보너스 증가는 진형 특성 수치(받는 피해·주는 피해·통솔·연타 등)에만 적용, 피격률은 그대로",
    "source": "authored"
  },
  clauses: [
    {
      "text": "전체 아군이 받는 책략 피해가 10% 감소한다(지력의 영향받음, 자신에게 효과 30% 증가)",
      "status": "ok"
    },
    {
      "text": "전투 시작 전에 성운 대열을 부여해 진형 보너스를 70% 증가시키고(지력의 영향 받음)",
      "status": "ok",
      "reviewed": "진형 특성 수치 × (1 + 70% × 지력 영향) — FEAT-029"
    },
    {
      "text": "진형 유형에 따라 기국 버프을(를) 획득한다",
      "status": "approx",
      "reviewed": "전열 칸 수 1·2·3 → 단일·이중·삼중 기국. 삼중의 총 치유량 영향 미반영"
    }
  ],
  def: {
    "_timing": "battleStart",
    "formationBoost": {
      "pct": 0.7,
      "inf": "지력"
    },
    "qiju": {
      "singleReduce": 0.12,
      "singleHitRate": 0.85,
      "doubleFront": 0.2,
      "doubleStrike": 1.6,
      "tripleDamage": 0.6
    },
    "effects": {
      "damage": [],
      "heal": [],
      "buffs": [
        {
          "stat": "받는책략피해",
          "min": -0.1,
          "max": -0.1,
          "target": "all_ally",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        },
        {
          "stat": "받는책략피해",
          "min": -0.13,
          "max": -0.13,
          "target": "self",
          "duration": 999,
          "maxStacks": 1,
          "inf": {
            "stats": [
              "지력"
            ],
            "who": "self"
          }
        }
      ],
      "statMods": [],
      "statusEffects": [],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "진형 보너스 증가·기국 버프 구현(FEAT-029). 삼중 기국 총 치유량 영향 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 「전체 아군이 받는 책략 피해가 10% 감소한다(지력의 영향받음」 — 자신을 뺀 아군에게 10%
    c.tag('others', c.friendsOf(c.unit));
    c.buff({ ...c.skill.effects.buffs[0], target: 'tag:others' });
    // 「자신에게 효과 30% 증가)」 — 자신은 10% × 1.3 = 13% (한 효과로)
    c.buff(1);
    // 「진형 보너스 70% 증가」「기국 버프」는 포진 단계(applyFormationEffects → applyQijuBuffs)에서 def.formationBoost·def.qiju 로 처리
  },
});
