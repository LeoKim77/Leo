// 순유 고유 전법 · 고유 전법 · 액티브 60%
// 원문: 적군 무작위 2명에게 220%의 책략 피해를 입히고, 무작위 이상 상태 1종을 부여합니다. 이때 대상이 아직 보유하지 않은 이상 상태를 우선적으로 부여합니다.
// 원문 절 구현: ok / approx / approx
import { defineSkill } from './types.ts';

export default defineSkill({
  id: "u-xun-you",
  name: "순유 고유 전법",
  kind: "액티브",
  isUnique: true,
  engineStatus: {
    "status": "approx",
    "note": "무작위 이상 상태는 대상 2명에게 같은 1종, 지속 2턴(원문에 지속시간 없음). \"미보유 상태 우선\" 미반영",
    "source": "authored"
  },
  clauses: [
    {
      "text": "적군 무작위 2명에게 220%의 책략 피해를 입히고",
      "status": "ok"
    },
    {
      "text": "무작위 이상 상태 1종을 부여합니다",
      "status": "approx"
    },
    {
      "text": "이때 대상이 아직 보유하지 않은 이상 상태를 우선적으로 부여합니다",
      "status": "approx"
    }
  ],
  def: {
    "effects": {
      "damage": [
        {
          "dmgType": "책략",
          "min": 2.2,
          "max": 2.2,
          "target": "random_enemy_n",
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
    // (원문 절 매핑 없음)
    c.damage(0);   // 책략 220%, 대상 random_enemy_n
    c.status(0);   // 공포/무장 해제/침묵/혼란/조롱/허약/군량 고갈/홍수/화공/폭풍/위협/요술, 대상 tag:e, 2턴
  },
});
