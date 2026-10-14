// 십이기책 · 고유 전법 · 액티브 60%
// 원문(시즌3 미리보기 2026-10-07): 랜덤 적군 2~3명에게 220%의 책략 피해를 주며, 2턴 동안 지속되는 1가지 이상 상태을(를) 랜덤으로 부여한다(보유하지 않은 상태 우선 부여).
// 원문 절 구현: ok / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xun-you",
  name: "십이기책",
  kind: "액티브",
  isUnique: true,
  revised: [
    {
      "date": "2026-10-07",
      "note": "시즌3 미리보기: 이름 십이기책, 대상 랜덤 적군 2명 → 2~3명"
    }
  ],
  engineStatus: {
    "status": "approx",
    "note": "무작위 이상 상태는 대상 2명에게 같은 1종, 지속 2턴(원문에 지속시간 없음). \"미보유 상태 우선\" 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "랜덤 적군 2~3명에게 220%의 책략 피해를 주며",
      "status": "ok"
    },
    {
      "text": "2턴 동안 지속되는 1가지 이상 상태을(를) 랜덤으로 부여한다(보유하지 않은 상태 우선 부여)",
      "status": "ok",
      "reviewed": "목표마다 보유하지 않은 이상 상태 중 무작위"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 2.2,
          "max": 2.2,
          "target": "random_enemy_2to3",
          "tag": "e"
        }
      ],
      "heal": [],
      "buffs": [],
      "statMods": [],
      "statusEffects": [
        {
          "oneOf": [
            "공포",
            "무장 해제",
            "침묵",
            "혼란",
            "조롱",
            "허약",
            "군량 고갈",
            "홍수",
            "화공",
            "폭풍",
            "위협",
            "요술"
          ],
          "target": "tag:e",
          "duration": 2
        }
      ],
      "targets": []
    },
    "authored": true,
    "authoredStatus": "approx",
    "authoredNote": "무작위 이상 상태는 대상 2명에게 같은 1종, 지속 2턴(원문에 지속시간 없음). \"미보유 상태 우선\" 미반영",
    "replacedLegacy": false
  },
  run(c) {
    // 「랜덤 적군 2~3명에게 220%의 책략 피해를 주며」
    c.damage(0);   // 책략 220%, 대상 random_enemy_2to3 (tag:e 로 묶임)
    // 「2턴 동안 지속되는 1가지 이상 상태을(를) 랜덤으로 부여한다(보유하지 않은 상태 우선 부여)」 — 목표마다 따로 고름
    const st = c.skill.effects.statusEffects[0];
    c.tagged('e').forEach((u: any, i: number) => {
      if (!u.alive) return;
      const fresh = st.oneOf.filter((n: string) => !c.has(u, n));
      const name = c.pick(fresh.length ? fresh : st.oneOf);
      c.tag('e' + i, [u]);
      c.status({ name, target: 'tag:e' + i, duration: st.duration });
    });
  },
});
