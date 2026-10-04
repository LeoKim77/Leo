// @ts-nocheck
// ============================================================
// v1.12b 전투 엔진 (legacy/simulator-v1.12b.html 에서 옮겨 온 코어)
//
// 바뀐 점 — 동작은 v1.12b 와 같게 유지한다:
//   - Math.random → 주입 가능한 __rng (시드 고정 → 같은 판 재현)
//   - window.GAME_DATA → createLegacyEngine(gameData) 인자
//   - __T(...) 감사(audit)용 구조화 기록 지점 추가 (기록 함수가 없으면 아무 일도 안 함)
// 효과 언어(AST) 엔진으로 넘어가기 전까지 이 파일이 실제 전투 규칙의 기준이다.
// v1.12b 대비 수정 내역은 ENGINE_FIXES 와 data/changelog 에 남긴다. 원본 그대로는 core-v1.12b.js.
// ============================================================
export const ENGINE_FIXES = [
  { id: 'FIX-001', date: '2026-10-02', found: '감사 E05', title: '행동 중 전사한 무장이 계속 행동하던 문제',
    detail: '지휘·패시브(행동 시) 효과가 유발한 반격·연계로 시전자가 전사해도 이어서 액티브·일반 공격을 하던 문제를 고침.' },
  { id: 'FIX-002', date: '2026-10-02', found: '감사 D06', title: '한 전법의 여러 피해가 대상을 따로 뽑던 문제',
    detail: '대상이 따로 적히지 않은 피해 항목(책략과 병기 동시 피해, "추가로" 피해)이 같은 발동 안에서 첫 대상을 공유하도록 고침. 방화범·문과 무·야습 등.' },
  { id: 'FEAT-001', date: '2026-10-02', found: '금병법 반영', title: '금병법용 계기 추가',
    detail: '액티브·추격 전법 발동 후 반응, 특정 상태 부여 후 반응, 전투당 1회 제한, 병력 조건, 추격 발동률, 고유 전법 발동률 가산, 병력 우위 대상 피해·탈주병 증가, 진영 보너스 대체.' },
  { id: 'FEAT-002', date: '2026-10-02', found: 'S2 신규 전법 반영', title: 'S2 전법용 효과 추가',
    detail: '상태를 피해보다 먼저 부여(statusFirst), 버프·스탯 효과의 대상 공유(tag), 「저항」(피해 1회 무효), 발동마다 쌓이는 자체 누적(selfStack).' },
  { id: 'FEAT-003', date: '2026-10-02', found: '감사 S05 (결사의 다짐·눈부신 자태)', title: '효과 부여·일반 공격 후 계기',
    detail: '다른 무장에게 전법처럼 동작하는 효과를 부여(grants), 추격이 아닌 "일반 공격 후" 계기(afterBasic), 전열 우선 대상(random_ally_front).' },
  { id: 'FIX-003', date: '2026-10-02', found: '감사 D06', title: '피해 확률을 대상마다 따로 판정하던 문제',
    detail: '"N% 확률로 (대상)에게 피해" 를 발동 1회에 한 번만 판정하도록 고침. 문과 무·광풍의 분노·일인천군. 상태 부여 확률은 기존처럼 대상별 판정.' },
  { id: 'FEAT-006', date: '2026-10-03', found: '전보 녹화 (주태·조운·악진 vs 토지 수비군)', title: '진형 칸에 따른 전열·후열',
    detail: '무장 고유 배치 대신 진형 칸으로 전열·후열을 정한다. 기형진은 첫 칸만 전열, 일자진은 전원 전열(전보 확인). 전열 칸엔 배치 성향이 전열인 무장이 먼저.' },
  { id: 'FEAT-007', date: '2026-10-03', found: '전보 녹화 (주태 불굴의 의지)', title: '대신 받기·불굴(치명 피해 면역)',
    detail: '매 턴 시작 시 보호자가 우군에게 보호 상태를 걸고 자기 행동이 끝나면 해제. 보호 중 현재 병력 10% 초과 피해는 확률로 보호자가 줄여서 대신 받음(우군당 턴 3회). 보호자 사망 직전 우군이 살아 있으면 불굴로 1회 면역(발동마다 −10%p).' },
  { id: 'FIX-008', date: '2026-10-04', found: '사용자 확인 R-021 (난공불락)', title: '확률이 대상 앞에 오면 시전 1회 판정',
    detail: '"60% 확률로 랜덤 적군 2~3명을 조롱"을 대상마다 60%씩 따로 굴리던 문제. 원문 순서대로 확률 판정 1번 → 성공하면 대상 전원. 회복·능력치·버프·상태 항목에 chanceOnce 추가, 같은 확률 값은 판정 공유(충성과 용맹 조롱 및 위협). 원문에 "목표마다 개별 판정"이 있으면 대상별(고진양번).' },
  { id: 'FIX-007', date: '2026-10-04', found: '사용자 확인 R-020', title: "전법 '랜덤 적군'은 균등 무작위",
    detail: "전법의 '랜덤 적군 N명'을 진형 피격률로 가중해 뽑던 것(v1.12b)을 살아 있는 적 전체에서 균등 무작위로 바꿈. 진형 피격률은 일반 공격(연타·축력 포함) 대상 선정에만 적용." },
  { id: 'FEAT-018', date: '2026-10-04', found: '공용 규칙 R-022·R-023·R-024 (사용자 제공 자료)', title: '행동 순서 = 선공 + 난수 ±35 전체 정렬, 준비 단계는 배치 순',
    detail: '같은 편 선공 순 고정 + 양 편 선두 병합(0.5+차/140 확률, v1.12 W31 잠정)을 버리고, 매 턴 생존 무장 전원 선공 + 균등 난수(−35~+35)로 양 편 구분 없이 정렬. 선공 차 70 초과는 여전히 확정 선행. 동률은 전열 → 아군 → 배치 순. 전투 시작 지휘·패시브는 선공과 무관하게 배치 순(아군 1 → 적군 1 → 아군 2 …).' },
  { id: 'FEAT-019', date: '2026-10-04', found: '공용 규칙 R-026 (사용자 제공 자료)', title: '혼란·조롱이 단일 대상 전법에도 적용',
    detail: '혼란: 일반 공격과 단일 대상 전법의 목표를 자신을 뺀 생존 무장 전체(적+아군)에서 무작위로 고른다 — 피해 전법이 아군을, 회복·버프 전법이 적을 고를 수 있다. 조롱: 적 단일 대상 전법도 조롱 시전자에게 고정. 여러 명 대상(전체·랜덤 N명)은 그대로. 혼란이 조롱보다 우선.' },
  { id: 'FIX-009', date: '2026-10-04', found: '공용 규칙 R-027 (사용자 제공 자료)', title: '피신당한 일반 공격 뒤 추격 없음',
    detail: '일반 공격이 피신으로 무효가 되면 그 행동의 추격 전법 판정을 하지 않는다(연타·축력 평타 중 하나라도 맞으면 판정). 예전엔 평타를 "했다"는 것만으로 추격을 굴렸다.' },
  { id: 'FIX-010', date: '2026-10-04', found: '공용 규칙 R-025 (사용자 제공 자료) + 화공 2턴 녹화', title: '지속 턴 = 걸린 무장의 행동 횟수',
    detail: '"턴 시작 때 있던 효과"를 보유자 행동 시작에 깎던 방식은 이미 행동을 마친 무장에게 건 1턴 효과·턴 종료 시 1턴 효과가 한 번도 적용되지 않았다. 보유자가 행동을 마친 시점에 있던 효과만 다음 행동 시작 때 1 감소 → "N턴 지속" = 걸린 무장의 행동 N번에 영향.' },
  { id: 'FEAT-017', date: '2026-10-04', found: '사용자 확인 R-019 (원문 그대로 실행)', title: '랜덤 2~3명·효과 전체 1회 판정',
    detail: '"랜덤 2~3명"을 2명으로 줄이던 근사를 버리고 매 시전 2명/3명을 같은 확률로 고른다(난공불락 조롱, 황심의 가호 피신). "N% 확률로 ~ 여러 명의 능력치 증가"처럼 효과 전체가 한 번에 걸리는 확률은 대상마다가 아니라 한 번만 판정.' },
  { id: 'FIX-006', date: '2026-10-04', found: '전보 툴팁 (부상병이 잃은 병력보다 많게 표시)', title: '부상병 집계',
    detail: '회유·심리 공격·역전 회복이 부상병을 줄이지 않았고, 병력보다 큰 피해도 그대로 부상병에 더해 부상병이 잃은 병력보다 커지던 문제. 회복은 부상병에서 빼고, 부상병은 실제로 잃은 병력의 85%로. 기본 시뮬(R-011, 부상병 상한 꺼짐)의 승패에는 영향 없음.' },
  { id: 'FEAT-016', date: '2026-10-04', found: '사용자 제안 (게임 전보 툴팁)', title: '전보 줄마다 무장 상태 툴팁',
    detail: '단일 전투에서 전보 한 줄이 찍힐 때마다 그 줄에 나온 무장의 능력치·병력·부상병·증감·상태이상·능력치 버프(남은 턴)를 함께 남긴다. 게임 전보처럼 이름을 누르면 그 순간의 툴팁을 볼 수 있어 역검증·미반영 효과 찾기에 쓴다.' },
  { id: 'FIX-005', date: '2026-10-03', found: '전보 녹화 (조황화 무승부 이후 교전)', title: '재교전 최대 병력',
    detail: '8턴 무승부 뒤 재교전은 남은 병력이 그대로 최대 병력이 되고(손책 13,967/13,967) 부상병은 넘어가지 않는다. 포진 효과(진형·병법·지휘 전법)는 처음부터 다시 걸린다.' },
  { id: 'FIX-004', date: '2026-10-03', found: '금병법 원문 대조 (이유〈비호〉 "방어 2스택")', title: '방어 스택 중첩',
    detail: '방어는 1회 소모형 스택(최대 2)인데 같은 상태 갱신 규칙에 걸려 1스택만 쌓이던 문제를 고침.' },
  { id: 'FEAT-015', date: '2026-10-03', found: '금병법 원문 대조', title: '책략 후 병기 증가·홍수 상대 피해 감소·상태 시전자 지정',
    detail: '서서〈장검행〉 책략 피해 후 다음 병기 피해 +40%. 서성〈의성〉 홍수 상태 적이 주는 피해 −8%(서성 생존 중). 황월영〈기관술〉 조롱 시전자를 통솔 최고 우군으로.' },
  { id: 'FEAT-014', date: '2026-10-03', found: '금병법 미리보기 캡처 (조조〈맹덕신서 하권〉)', title: '최고 속성 증감',
    detail: '능력치 증감 대상으로 "최고 속성"(적용 시점의 무력·지력·통솔·선공 중 최댓값) 지원. 맹덕신서 하권: 아군 전원이 일반 공격 직전마다 최고 속성 +8(최대 3중첩).' },
  { id: 'FEAT-013', date: '2026-10-03', found: '금병법 미리보기 캡처 (사마의〈대략〉)', title: '스택 문턱 회복',
    detail: '사마의〈대략〉: 매의 응시의 포석이 처음으로 4스택·8스택이 될 때 아군 전체 회복(치유율 80%, 지력 영향).' },
  { id: 'FEAT-012', date: '2026-10-03', found: '금병법 미리보기 캡처 (공손찬·마운록)', title: '피신 후 성장·아군 병종별 최고 속성 증가',
    detail: '공손찬〈백마의종〉: 피신할 때마다 무력·지력이 선공의 2%만큼 증가(최대 8회). 마운록〈풍속통의〉: 아군 중 기병 무장의 최고 속성 +5%(무장 기본 병종 기준, R-015에 따라 병종 전환은 보지 않음).' },
  { id: 'FEAT-011', date: '2026-10-03', found: '금병법 미리보기 캡처 (주태·육손)', title: '역전·같은 열 우군·턴 한정 디버프 계기',
    detail: '주태〈역전〉: 대신 받아 준 우군의 다음 피해 +20%, 그 피해의 50%만큼 보호자 회복. 〈불굴〉용 같은 열 랜덤 우군 대상. 육손〈분량〉용 "첫 N턴 동안" 디버프 계기 턴 제한.' },
  { id: 'FEAT-010', date: '2026-10-03', found: '금병법 미리보기 캡처 (감녕〈산림탈기〉)', title: '일반 공격 전 시점',
    detail: '"일반 공격 전, N% 확률로 …" 효과를 평타 직전에 처리하는 단계(beforeBasic) 추가. 위협·공포 등으로 평타를 못 하면 발동하지 않는다.' },
  { id: 'FEAT-009', date: '2026-10-03', found: '사용자 확인 R-011~R-016', title: '시뮬 범위: 개인 선택·공통 변수 제외',
    detail: '병종 효과(상성·병종 강화·병종 전환), 부상병 회복 상한을 기본으로 끈다(계수 troopEffects·woundedCap). 진형 효과(전열·후열 피격률·진형 특성)는 R-013 정정(2026-10-03)으로 기본 반영(formationEffects). 건물 기술·장비·일반 병법은 원래 미반영. 무장 배치와 전법 배치에 따른 계수에 집중.' },
  { id: 'FEAT-008', date: '2026-10-03', found: '전보 녹화 (요새 함락·결사의 다짐)', title: '행동 종료 시점, 회복 기준 능력치',
    detail: '"행동 종료 시" 효과를 일반 공격·추격 뒤에 처리하는 단계(actionEnd) 추가. 회복량이 지력 대신 통솔 등을 따르는 전법(결사 회복 215~297, 주태 통솔 315)에 기준 능력치 지정.' },
  { id: 'FEAT-005', date: '2026-10-02', found: '사용자 확인 R-009', title: '8턴 무승부 → 생존 무장 재교전',
    detail: '8턴이 끝나도 양쪽이 살아 있으면 남은 병력으로 승패를 가리던 방식(v1.12b)을 버리고, 전사 무장을 뺀 생존 무장끼리 병력·부상병을 이어받아 다시 전투한다. 한쪽 전멸까지 반복(상한 10차).' },
  { id: 'FEAT-004', date: '2026-10-02', found: 'S3 신규 전법 반영', title: 'S3 전법용 대상·조건 추가',
    detail: '지력이 가장 낮은 아군 대상(lowest_intel_ally, 공성계), 직전 턴에 발동하지 않았으면 피해 증가(idleBonus, 만군 멸시), 전법별 마지막 발동 턴 기록.' },
];
export function createLegacyEngine(gameData) {
let __rng = Math.random;
let __traceFn = null;
let __turn = 0;
let __detail = false;   // FEAT-016: 전보 줄마다 그 순간 무장 상태(툴팁)를 남긴다 — 단일 전투에서만 켬
let __turnOffset = 0;   // FEAT-005: 재교전의 전보·추적 턴 번호를 앞 교전 뒤에 잇는다
let __phase = 'battleStart';
const __skillStack = [];
const __invStack = [];
let __invSeq = 0;
function __T(ev) {
  if (!__traceFn) return;
  ev.turn = __turn > 0 ? __turn + __turnOffset : 0; ev.phase = __phase;   // 재교전의 포진 단계도 0턴
  if (ev.inv == null && __invStack.length) ev.inv = __invStack[__invStack.length - 1];
  __traceFn(ev);
}
// ============================================================
// 천하결전 덱 시뮬레이터 — 전투 엔진 코어
// 근사 엔진: 승률/구조적 취약점 분석용. 절대 데미지 수치는 신뢰하지 않음.
// ============================================================

// C=1.44는 레벨5 순수 기본공격 실측 데이터 2건(진형/기술/국가보너스 완전 배제)으로 역산한 값.
//   - 허저(무력153.37, 백병혈전 +10 버프 검증됨) → 왕랑(통솔44) = 165 피해 → C=1.384
//   - 조인(무력81) → 유표(통솔52) = 74 피해 → C=1.500 (조인의 '양번 사수' 버프 영향 여부 미확인)
// 기존 C=3.23(레벨50 실전 로그 역산)과 약 2.2배 차이 나는데, 그 로그에는 국가보너스·진형·건물기술
// 등이 전부 뒤섞여 있었을 가능성이 높아 이번 순수 실험값을 더 신뢰함. α(방어 가중)는 여전히 가정값 1.0.
// baseCrit: 회심/묘책 기본 확률.
// 🔴 예전 0.05는 근거 없는 값이었고, 실전 전보에서 관측된 값은 훨씬 높다.
//   (곽가 묘책 59.12%, 순욱 53.12%, 제갈량 41.08% — 병법 '강궁' +10% 포함)
//   이 차이는 병법·도시기술 등 시뮬 미반영 요소에서 오는 것으로 보이며,
//   0.05로 두면 회심/묘책 의존 덱(특히 책략덱)이 심하게 저평가된다.
//   관측치 중앙값 근처인 0.25를 기본값으로 두되, 시뮬 화면에서 조정 가능하게 노출한다.
// beta=0.45: 실측 2건(관평, 9000/10000 vs 800/10000 병력, 동일 대상) 역산치. C/alpha 재검증 필요할 수 있음(병력항 추가로 기존 역산 배경과 상호작용).
// [실측 확정] 병기와 책략은 방어스탯도 alpha도 서로 다르다.
//   근거 — 천하평론(같은 시전자 손권이 같은 턴에 병기 80% + 책략 80%을 적 3명에게 동시 타격).
//   손권 무력 198.50 / 지력 234.20, 손권 치명타 0회(회심 오염 없음).
//   대상별 「받는 피해」를 게임 내 툴팁으로 전부 확보해 정규화한 뒤 역산했다:
//     황충 -1.40% / 서성 +23.27% / 장비 +23.27%
//
//   ■ 병기 (황충 97 / 서성 137)
//       방어=무력 → alpha=+0.564 ✅  |  통솔 -0.495 ❌  |  지력 -0.384 ❌
//   ■ 책략 (서성 193 / 장비 231)
//       방어=지력 → alpha=+1.142 ✅  |  통솔 -2.609 ❌  |  무력 -0.318 ❌
//
//   → 같은 계열 스탯끼리 맞붙는 구조(병기↔무력, 책략↔지력). 용어 시트의 "통솔이 받는
//     병기·책략 피해에 영향"과는 어긋나지만, 통솔로는 두 세트 모두 alpha가 음수라 기각된다.
//   ※ 방어 흡수분을 복원한 표본으로 교차검증하면 책략은 오차 14%로 맞고, 병기는 50%로
//     어긋난다(장비 케이스). 병기 alpha는 표본 2건뿐이라 신뢰도가 낮다 — 추가 검증 필요.
//   ※ C는 그대로 1.44 유지. 실전 역산값 2.3~2.7에는 병법·장비·도시기술이 포함돼 있어
//     "청정" 기준과 직접 비교할 수 없다.
let DEBUG_DAMAGE_LOG = false; // 계산 내역 상세 로그 (UI 토글)
const DEFAULT_COEFFS = { Clin: 2.726, kDef: 1.574, kDefIntel: 1.28, floorRate: 0.01, counterRatio: 0.5, damageVariance: 0.01, C: 1.44, beta: 0.45, defRatio: 0.4, critMult: 1.5, baseCrit: 0,   /* v1.12: 녹화 4판의 아군 타격 40여 건에서 기본 회심이 한 번도 없었음 → 기본 회심·묘책 0 */ statScaleWeight: 0.0021,   /* 2026-10-03 전보: 목우유마·난세의 간웅·전략 계획 실측으로 0.285%→0.21%/스탯 */ durationMode: 'holder', drawRule: 'rematch', maxRounds: 10, troopEffects: false, formationEffects: true, woundedCap: false,   /* R-011~R-016 시뮬 범위: 병종·부상병 제외, 진형은 반영(R-013 정정) */   /* R-009 8턴 무승부 → 생존 무장 재교전 */
  // ── v1.12 실측 공식 (하후돈덱 2판 + 조운덱 2판, 공격자·피격자 툴팁 확보 표본) ──
  // ── 2026-10-03 전보 역재현(조황화 훈련소 전투 병기 25건·책략 8건 + 조운덱 3건) 재추정 ──
  //   v1.12 값(414/1.07/1.63/0.47, 책략 1.73/0.40)은 고무력 공격자 표본만으로 맞춰져 저무력 공격(화타 무력 49.5 → 손책 168,
  //   엔진 81)과 고통솔 피격을 크게 틀렸다(병기 RMS 37%, 책략 29%). 전법 승품 보정(R-017) 후 새 값: 병기 9.6%, 책략 9.4%.
  //   병력 지수는 이번 표본에선 0 이 가장 잘 맞지만 v1.12 의 병력 비교 근거가 있어 0.1 로 둔다(검증 대기).
  P0: 250, Pa: 0.85, Pd: 0.6, betaP: 0.1,     // 병기: (250 + 0.85×무력 − 0.6×통솔×(1−관통)) × (병력/10000)^0.1
  Ma: 1.5, betaM: 0.1,                        // 책략: 1.5 × 지력 × (병력/10000)^0.1
  counterBonus: 0.15,                         // 병종 상성: 방패>궁, 궁>창, 창>기, 기>방패 — 피해 +15%
  woundedRate: 0.85 };                        // 손실 병력 중 부상병 비율(실측 0.847~0.849). 회복은 부상병 수가 상한
// ============================================================
// [v1.11] 작업 목록 반영 내역 (천하결전_시뮬v2_작업목록_녹화실험.xlsx 기준)
//   W02 턴 시작/턴 종료 단계 신설        W03 시점 문구 없는 상시 패시브 → 준비 턴 1회
//   W04 준비 턴 효과 기본 지속 = 전투 종료까지   W05 버프 지속 감소 = 보유자 행동 기준(잠정)
//   W08 스탯 영향 곱연산 기본값×(1+(스탯−100)×0.285%) + 원문 절 기반 확대 적용(잠정)
//   W09 "목표의 ○○ 영향" → 효과를 받는 무장 스탯 사용
//   W11 주는/받는 피해 분리 곱(잠정)      W13 일반+속성 증상 100% 상한 공유(잠정)
//   W14 액티브 받는피해 분기 버그 수정    W20 "포진" 표기 → "준비 턴"
//   W27 전법 수치 1~10레벨 난수 → 10레벨(최고) 고정
// [v1.12] 실측 공식 반영: 병기·책략 기초식 교체, 병력 계수 절대값화, 병종 상성 +15%,
//   피신 곱 합성, 상태 지속도 보유자 행동 기준, 회복 = 지력×유효치유율 + 부상병 상한,
//   선공 병합 판정, 턴 종료 효과는 그 턴 행동 순서, 난수 폭 ±1%, 표기 "포진" 복원
//   회복 공식은 실측 검증된 기존 식(가산 0.12%p)을 유지한다 — E07·E15 실측 후 교체.
// ============================================================
const HEAL_STAT_W = 0.0012;   // 회복 전용: 실측 3건(오차 0~3%)으로 검증된 기존 가중치
const V111_STATS = { influenceAttached: 0, influenceSkills: [] };
function infStatValue(u, st) {
  if (st === '최고') return Math.max(effStat(u, '무력'), effStat(u, '지력'), effStat(u, '통솔'), effStat(u, '선공'));
  return effStat(u, st);
}
// 스탯 영향 배수: 기본값 × (1 + (스탯 − 100) × w). 여러 스탯이면 평균(잠정).
function infMult(inf, self, target, coeffs) {
  if (!inf) return 1;
  const u = inf.who === 'target' && target ? target : self;
  if (!u) return 1;
  const vals = inf.stats.map(st => infStatValue(u, st));
  const v = vals.reduce((a, b) => a + b, 0) / vals.length;
  const w = coeffs && coeffs.statScaleWeight != null ? coeffs.statScaleWeight : DEFAULT_COEFFS.statScaleWeight;
  return Math.max(0, 1 + (v - 100) * w);
}
// 원문 절(clauses)의 "(○○의 영향 받음)"을 해당 절이 구현한 효과 항목에 연결한다.
//   회복(heal)은 전용 공식이 있어 제외, 상태 부여(statusEffects)는 수치가 없어 제외.
function attachInfluences(D) {
  const all = [...(D.skills || []), ...(D.uniqueSkills || [])];
  all.forEach(sk => {
    (sk.clauses || []).forEach(cl => {
      const m = (cl.text || '').match(/\(([^()]*?)의\s*영향\s*받음\)/);
      if (!m) return;
      const inner = m[1];
      let stats = inner.includes('최고') ? ['최고'] : (inner.match(/무력|지력|통솔|선공/g) || []);
      if (!stats.length) return;
      const inf = { stats, who: inner.includes('목표') ? 'target' : 'self' };
      (cl.impl || []).forEach(p => {
        const mm = String(p).match(/^(buffs|statMods|damage|alwaysOnBuffs)\[(\d+)\]$/);
        if (!mm) return;
        const arr = mm[1] === 'alwaysOnBuffs' ? sk.alwaysOnBuffs : (sk.effects || {})[mm[1]];
        const item = arr && arr[+mm[2]];
        if (!item || item.statScale || item.inf) return;
        item.inf = inf;
        V111_STATS.influenceAttached++;
        if (!V111_STATS.influenceSkills.includes(sk.name)) V111_STATS.influenceSkills.push(sk.name);
      });
    });
  });
}
try { attachInfluences(gameData); } catch (e) { console.warn('attachInfluences 실패', e); }
// 전법 발동 시점 분류 (W02·W03): battleStart / turnStart / turnEnd / action / trigger
function skillTiming(skill) {
  if (!skill) return 'action';
  if (skill.type !== '지휘' && skill.type !== '패시브') return 'action';
  if (skill.trigger) return 'trigger';
  if (skill._timing) return skill._timing;
  let r;
  if (isBattleStartOnly(skill)) r = 'battleStart';
  else {
    const raw = skill.raw || '';
    const pats = [
      ['turnStart', /턴\s*시작/],
      ['turnEnd', /턴\s*종료\s*시/],
      ['action', /행동\s*시|행동\s*전|일반\s*공격\s*(?:전|후)|피해를\s*받|\d+번째\s*턴에/],
      ['legacy', /전투\s*시작/],
    ];
    let best = null, pos = 1e9;
    pats.forEach(([k, re]) => { const i = raw.search(re); if (i >= 0 && i < pos) { pos = i; best = k; } });
    if (!best) best = /매\s*턴/.test(raw) ? 'action' : 'battleStart';
    if (best === 'legacy') best = 'action';   // "전투 시작" + 반복 문구 혼재 → 기존처럼 행동 시(블록 엔진에서 분리 예정)
    r = best;
  }
  skill._timing = r;
  return r;
}
// 페이즈 발동 (턴 시작 / 턴 종료)
// 동률 2차 기준(R-023): 전열 우선 → 아군(A) 우선 → 배치 순
const slotIdx = u => parseInt(String(u.id).slice(1), 10) || 0;
const tieKey = u => (u.position === 'back' ? 1 : 0) * 100 + (u.side === 'A' ? 0 : 10) + slotIdx(u);
function mergeActionOrder(units, coeffs) {
  const win = (coeffs && coeffs.orderWindow) || 70;   // 선공 차가 이보다 크면 확정 선행 (용어 시트 4번)
  // FEAT-018(R-022): 매 턴 생존 무장 전원의 선공에 균등 난수 ±35(=창 70의 절반)를 더해 양 편 구분 없이 내림차순 정렬.
  //   두 무장의 난수 차는 −70~+70 이므로 "선공 차 70 초과 = 확정 선행"(용어 시트 4번)이 그대로 성립한다.
  if (((coeffs && coeffs.orderMode) || 'noise') === 'noise') {
    const half = win / 2;
    return units.filter(u => u.alive)
      .map(u => ({ u, v: effStat(u, '선공') + (__rng() * 2 - 1) * half }))
      .sort((a, b) => (b.v - a.v) || (tieKey(a.u) - tieKey(b.u)))
      .map(x => x.u);
  }
  // (예전 v1.12 W31 방식: 같은 편 선공 순 고정 + 양 편 선두 비교 병합 — orderMode 'merge')
  const bySpd = arr => arr.filter(u => u.alive).sort((a, b) => effStat(b, '선공') - effStat(a, '선공'));
  const A = bySpd(units.filter(u => u.side === 'A')), B = bySpd(units.filter(u => u.side === 'B'));
  const out = [];
  while (A.length && B.length) {
    const a = A[0], b = B[0];
    const d = effStat(a, '선공') - effStat(b, '선공');
    let aFirst;
    if (Math.abs(d) > win) aFirst = d > 0;
    else { const pHigh = 0.5 + Math.abs(d) / (2 * win); aFirst = (__rng() < pHigh) === (d >= 0); }
    out.push(aFirst ? A.shift() : B.shift());
  }
  return out.concat(A, B);
}
function runPhaseSkills(phase, units, coeffs, log, turn, contrib, turnOrder) {
  // v1.12 W32: 턴 종료 효과는 그 턴의 실제 행동 순서대로 (영상: 화타 → 대교 → 초선)
  const order = (turnOrder || units.filter(u => u.alive).sort((a, b) => effStat(b, '선공') - effStat(a, '선공'))).filter(u => u.alive);
  const label = phase === 'turnStart' ? '턴 시작' : '턴 종료';
  __phase = phase;
  order.forEach(u => {
    if (!u.alive) return;
    u.skills.filter(s => skillTiming(s) === phase && (!s.onlyTurns || s.onlyTurns.includes(turn))).forEach(skill => {
      log.push(`${turn}턴: [${u.name}]이(가) 전법 [${skill.name}]을(를) 발동했습니다. (${label})`);
      applySkillEffects(u, skill, units, coeffs, log, turn, contrib);
    });
  });
}
// 보유자 행동 기준 지속 감소 (W05 → FIX-010, R-025)
//   "N턴 지속" = 걸린 무장의 행동 N번에 영향. 보유자가 행동을 마친 시점에 이미 있던 효과만 다음 행동 시작 때 1 감소한다
//   (= 행동을 마칠 때마다 −1, 소멸 표기는 다음 행동 시작 — 영상: 화공 2턴이 3턴 행동 시작 때 소멸).
//   예전엔 "턴 시작 때 있던 것"을 기준으로 깎아, 이미 행동한 무장에게 건 1턴 효과·턴 종료 시 1턴 효과가 한 번도 적용되지 않았다.
function tickHolderBuffs(u) {
  u.statuses = u.statuses.filter(st => { if (!st._old) return true; st.remain--; return st.remain > 0; });
  u.buffs = u.buffs.filter(b => { if (!b._old) return true; b.remain--; if (b.remain <= 0) { u.mods[b.stat] -= b.value; return false; } return true; });
  u.statBuffs = u.statBuffs.filter(b => { if (!b._old) return true; b.remain--; if (b.remain <= 0) { u.stats[b.stat] = Math.max(0, u.stats[b.stat] - b.value); return false; } return true; });
}
function markHolderSeen(u) {
  u.buffs.forEach(b => { b._old = true; }); u.statBuffs.forEach(b => { b._old = true; }); u.statuses.forEach(st => { st._old = true; });
}
// 회복 스케일 계수 — 실측 2건으로 보정 (0.5 임의값 → 0.57 → 0.40).
// 채택 근거: 순욱 [청낭 치료] 로그. 전투 중 실제 지력이 349.12로 로그에 찍혀 있어
//   버프 포함 정확한 값을 알 수 있는 유일한 사례.
//   실측 2,324 회복은 "거인-2배 회복" 발동분이므로 원본은 1,162.
//   1162 = C(3.23, 레벨50 실전 기준) × 349.12 × 2.6 × S  →  S = 0.396
// 견희 사례(516)로 계산하면 0.57이 나오는데, 이는 카드 스탯(201)을 쓴 탓.
//   S=0.40 기준 역산 시 견희의 전투 중 지력은 288이어야 하며, 순욱의 버프량(+107)과
//   비슷한 +87 수준이라 앞뒤가 맞는다. 즉 선형 모델 자체는 문제없고 입력값이 문제였음.
// HEAL_SCALE 0.40: 군량 고갈이 없는 "깨끗한" 실측 표본으로 확정.
//   마초[평화의 기운] 예측 73 vs 실측 73 (오차 0%) / 여몽[지혜의 바람] 222 vs 229 (오차 3%)
//   ※ 한때 1.09로 올린 적이 있는데 오류였다. 군량 고갈 표본을 ÷0.30으로 "복원"해 역산했기 때문.
//   원칙1: 군량 고갈·받는치유 보정이 걸린 표본으로는 계수를 역산하지 않는다.
//   원칙2: 승급된 전법은 계수 역산 근거로 쓰지 않는다 (아래 승급 메모 참조).
//
// [참고용 메모 — 시뮬에는 반영하지 않음] 전법 승급
//   실측: 표기 치유율 = DB 기본값 x (1 + 0.03 x 승급개수). 전 전법 공통으로 1개당 정확히 +3%.
//     전쟁 조달 110%→119.9%(3개) / 평화의 기운 90%→95.4%(2개) / 전장의 노래 130%→145.6%(4개)
//     지혜의 바람은 승급 0개라 표기가 DB와 정확히 일치(140%) → DB 기본값 자체도 검증됨.
//   승급은 병법·장비·건물기술과 마찬가지로 계정별 사용자 변수이므로 시뮬 범위에서 제외한다.
//   ("고정 시스템 값 vs 사용자 의존 값" 원칙)
const HEAL_SCALE = 0.40;

function pick(arr) { return arr[Math.floor(__rng() * arr.length)]; }
function randRange(min, max) { return min + __rng() * (max - min); }
// v1.11 W27: 전법 수치는 "1레벨→10레벨" 범위다. 예전엔 매 발동마다 그 사이 난수를 뽑아
//   효과가 평균 약 75% 수준으로 과소평가됐다. 전법 레벨(기본 10 = 최고 레벨) 기준 값으로 고정한다.
let SKILL_LEVEL = 10;
function lvVal(min, max) {
  if (max == null) return min;
  if (min == null) return max;
  return min + (max - min) * (SKILL_LEVEL - 1) / 9;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ---------- 유닛 빌드 ----------
function buildUnit(general, skills, uniqueSkill, formation, position, side, idx) {
  return {
    id: `${side}${idx}`,
    side,
    generalId: general.id,
    name: general.name,
    gender: general.gender || 'M', // 'M' | 'F' — 성별 조건부 전법용 (54명 수동 분류, 부정확할 수 있음)
    country: general.country,     // 진영(위촉오군) 보너스 판정용 — 예전엔 복사하지 않아 undefined였다
    unitType: general.unitType,   // 병종(방패/궁/창/기병) 보너스 판정용 — 동일 문제
    role: general.role,
    position, // 'front' | 'mid' | 'back' (배치 위치, 진형 피격률/전열우선 타겟팅에 사용)
    baseStats: { ...general.stats },
    stats: { ...general.stats },
    troops: general.maxTroops,
    maxTroops: general.maxTroops,
    pendingSkills: [],
    guaranteedCrit: 0,
    guaranteedCritNonBasicOnly: false,
    mods: { 주는피해: 0, 받는피해: 0, 받는병기피해: 0, 받는책략피해: 0, 받는회복량: 0, 주는회복량: 0, 회복2배확률: 0, 액티브발동률: 0, 방어관통: 0, 간파: 0, 회심: DEFAULT_COEFFS.baseCrit, 묘책: DEFAULT_COEFFS.baseCrit, 회유: 0, 심리공격: 0, 연타확률: 0, 피신: 0, 반격확률: 0, 반격피해: 0, 추격전법피해: 0, 받는추격피해: 0, 받는일반공격피해: 0, 받는액티브피해: 0, 주는병기피해: 0, 주는책략피해: 0, 주는일반공격피해: 0, 주는액티브피해: 0, 회심피해: 0, 액티브재발동: 0 },
    buffs: [], // {stat, value, remain, srcId} — mods 계열 버프
    statBuffs: [], // {stat, value, remain, srcId} — 무력/지력/통솔/선공 증감
    statuses: [], // {name, remain}
    skills: [uniqueSkill, ...skills].filter(Boolean),
    skillUses: {}, // skillId -> count
    triggerCounts: {}, // skillId -> 이번 턴 발동 횟수 (연계 전법 매 턴 상한용)
    basicAttackCount: 0, // 허저 백병혈전: 개인 일반공격 누적(팀 합산은 battleState에서 별도 관리)
    forcedTargetId: null,
    alive: true,
    formation,
    dmgDealt: 0,
    healDone: 0,
    skillDmgContribution: {}, // skillId -> total damage/heal value
  };
}

// 진형의 위치별 피격률에 따른 가중 랜덤 선택 (전열이 대체로 더 많이 맞도록)
function weightedPickByPosition(units) {
  const weights = units.map(u => {
    const hr = u.formation && u.formation.hitRate;
    if (!hr) return 1;
    return Math.max(0.05, hr[u.position] != null ? hr[u.position] : 0.33);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = __rng() * total;
  for (let i = 0; i < units.length; i++) {
    r -= weights[i];
    if (r <= 0) return units[i];
  }
  return units[units.length - 1];
}
function weightedShuffleByPosition(units, n) {
  const pool = [...units];
  const picked = [];
  while (pool.length && picked.length < n) {
    const u = weightedPickByPosition(pool);
    picked.push(u);
    pool.splice(pool.indexOf(u), 1);
  }
  return picked;
}

// ---------- 타겟 선택 ----------
function selectTargets(unit, targetCodes, allUnits, aux) {   // aux: 조건 판정·대리 공격자 지정 등 보조 조회(혼란·조롱 미적용)
  const enemies = allUnits.filter(u => u.alive && u.side !== unit.side);
  const allies = allUnits.filter(u => u.alive && u.side === unit.side);
  if (unit.forcedTargetId) {
    const t = allUnits.find(u => u.id === unit.forcedTargetId && u.alive);
    if (t) return [t];
  }
  if (!enemies.length) return [];
  const code = targetCodes.find(c => c !== 'self') || 'random_enemy_1';
  // FEAT-019(R-026): 단일 대상 전법도 혼란·조롱을 따른다 (일반 공격과 같은 규칙)
  //   혼란: 자신을 뺀 생존 무장 전체(적+아군)에서 무작위 — 피해 전법은 아군을, 회복·버프 전법은 적을 고를 수 있다
  //   조롱: 적 단일 대상 전법은 나를 조롱한 시전자에게 고정 (혼란이 우선)
  if (!aux && targetCodes.some(c => c !== 'self') && (SINGLE_TARGET_CODES.has(code) || !KNOWN_TARGET_CODES.has(code))) {
    if (statusFlag(unit, 'randomizeTarget')) return [pick(allUnits.filter(u => u.alive && u !== unit))];
    if (!/ally/.test(code)) { const tc = tauntTargetFor(unit, allUnits); if (tc) return [tc]; }
  }
  let result;
  switch (code) {
    case 'all_enemy': result = enemies; break;
    case 'all_ally': result = allies; break;
    // FIX-007(R-020): 전법의 '랜덤 적군'은 진형 피격률과 무관하게 살아 있는 적 전체에서 균등 무작위 (피격률은 일반 공격 대상에만)
    case 'random_enemy_n': result = shuffle(enemies).slice(0, 2); break;
    case 'random_ally_n': result = shuffle(allies).slice(0, 2); break;
    // FEAT-017 "랜덤 2~3명": 매 시전 2명 또는 3명을 같은 확률로 고른다 (원문 그대로)
    case 'random_enemy_2to3': result = shuffle(enemies).slice(0, __rng() < 0.5 ? 2 : 3); break;
    case 'random_ally_2to3': result = shuffle(allies).slice(0, __rng() < 0.5 ? 2 : 3); break;
    case 'random_ally_front': { const fr = allies.filter(u => u.position === 'front'); result = [pick(fr.length ? fr : allies)]; break; }   // FEAT-003 전열 우선
    case 'random_same_row_ally': { const row = x => (x.position === 'back' ? 'back' : 'front'); result = shuffle(allies.filter(u => u !== unit && row(u) === row(unit))).slice(0, 1); break; }   // FEAT-011 같은 열 우군(자신 제외)
    case 'random_ally_1': result = shuffle(allies.filter(u => u !== unit)).slice(0, 1); break;   // FEAT-001: 랜덤 우군 단일(자신 제외)
    case 'random_enemy_1': result = [pick(enemies)]; break;
    case 'lowest_control_enemy': result = [minBy(enemies, u => u.stats.통솔)]; break;
    case 'lowest_power_enemy': result = [minBy(enemies, u => u.stats.무력)]; break;
    case 'lowest_intel_enemy': result = [minBy(enemies, u => u.stats.지력)]; break;
    case 'lowest_speed_enemy': result = [minBy(enemies, u => u.stats.선공)]; break;
    case 'highest_speed_ally': result = [maxBy(allies, u => u.stats.선공)]; break;
    case 'highest_combined_ally': result = [maxBy(allies, u => u.stats.무력 + u.stats.지력 + u.stats.선공)]; break;
    case 'lowest_combined_enemy': result = [minBy(enemies, u => u.stats.무력 + u.stats.지력 + u.stats.선공)]; break;
    case 'highest_power_enemy': result = [maxBy(enemies, u => u.stats.무력)]; break;
    case 'highest_intel_enemy': result = [maxBy(enemies, u => u.stats.지력)]; break;
    case 'highest_power_ally': result = [maxBy(allies, u => u.stats.무력)]; break;
    case 'highest_intel_ally': result = [maxBy(allies, u => u.stats.지력)]; break;
    case 'highest_command_ally': result = [maxBy(allies, u => u.stats.통솔)]; break;
    case 'highest_control_ally': result = [maxBy(allies, u => u.stats.통솔)]; break;
    case 'lowest_hp_ally': result = [minBy(allies, u => u.troops)]; break;
    case 'lowest_intel_ally': result = [minBy(allies, u => u.stats.지력)]; break;   // FEAT-004
    case 'lowest_hp_enemy': result = [minBy(enemies, u => u.troops)]; break;
    default: result = [pick(enemies)];
  }
  // 아군 대상 코드인데 자기 자신 외에 아군이 없는 경우 등 방어적으로 빈 결과를 걸러냄
  return (Array.isArray(result) ? result : [result]).filter(Boolean);
}
// FEAT-019: 혼란·조롱이 적용되는 단일 대상 코드 (그 밖에 모르는 코드는 기본값 '랜덤 적 1명'으로 처리되므로 단일로 본다)
const SINGLE_TARGET_CODES = new Set(['random_enemy_1', 'random_ally_1', 'random_ally_front', 'random_same_row_ally',
  'lowest_control_enemy', 'lowest_power_enemy', 'lowest_intel_enemy', 'lowest_speed_enemy', 'lowest_combined_enemy', 'lowest_hp_enemy',
  'highest_power_enemy', 'highest_intel_enemy', 'highest_speed_ally', 'highest_combined_ally', 'highest_power_ally', 'highest_intel_ally',
  'highest_command_ally', 'highest_control_ally', 'lowest_hp_ally', 'lowest_intel_ally']);
const KNOWN_TARGET_CODES = new Set([...SINGLE_TARGET_CODES, 'all_enemy', 'all_ally', 'random_enemy_n', 'random_ally_n', 'random_enemy_2to3', 'random_ally_2to3']);
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(__rng() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
function minBy(arr, fn) { return arr.length ? arr.reduce((a, b) => (fn(a) <= fn(b) ? a : b)) : null; }
function maxBy(arr, fn) { return arr.length ? arr.reduce((a, b) => (fn(a) >= fn(b) ? a : b)) : null; }

// ---------- 데미지/치유 계산 ----------
function calcDamage(attacker, defender, ratio, dmgType, coeffs, log, turnNo, dmgTag) {
  // ── 선형 감산 모델 ──────────────────────────────────────────────
  //   피해 = 배율 × 병력계수 × (Clin × ATK − k × DEF)
  //   기존 비율식 ATK/(ATK+α·DEF)은 실측과 맞지 않아 폐기했다.
  //   근거(파죽지세: 전체 적군 고정 140%, 같은 시전자·같은 턴, 받는피해 전부 툴팁 확보):
  //     손권 통솔 223.0 → 정규화 501.8 / 주창 271.5 → 396.1 / 우금 314.5 → 301.2
  //     양 끝점으로 직선을 그어 가운데 점을 예측하니 395.5 vs 396.1 — 오차 0.16%.
  //     통솔 1당 감소량도 2.179 / 2.207로 일정(비율식이면 고통솔에서 완만해져야 하는데 아님).
  //     2차 시전(우금 통솔 294.5)으로 교차검증 시 오차 5.0%.
  //   Clin=2.726 / k=1.574는 위 표본에서 역산 (황충 무력 260.92, 배율 1.4, 병력계수 0.995).
  //   ※ 이 값에는 병법·장비·도시기술이 포함돼 있어 "청정" 기준이 아니다.
  // ── v1.12 실측 기초식 ─────────────────────────────────────────
  //   병기: (P0 + Pa×무력 − Pd×통솔×(1−방어관통)) × (병력/10000)^betaP
  //     저무력 무장(대교 60.5·정욱 97)의 평타가 130~310 피해를 내는 것을 설명하는 병력 기반 상수항 포함
  //   책략: Ma × 지력 × (병력/10000)^betaM — 방어 스탯 영향이 거의 없음
  //     (화공전술: 서황 지력 117 → 505, 견희 지력 208 → 508)
  //   병력 계수는 '현재/최대 비율'이 아니라 절대 병력 기준 (최대 8,260 vs 10,000 비교로 확인)
  const DC = DEFAULT_COEFFS;
  const cf = (k) => (coeffs[k] != null ? coeffs[k] : DC[k]);
  const ATK = dmgType === '병기' ? effStat(attacker, '무력') : effStat(attacker, '지력');
  let base;
  if (dmgType === '병기') {
    const pierce = clamp(attacker.mods.방어관통 || 0, 0, 0.9);
    const DEF = effStat(defender, '통솔') * (1 - pierce);
    const tf = Math.pow(Math.max(attacker.troops, 1) / 10000, cf('betaP'));
    base = ratio * tf * Math.max(cf('P0') + cf('Pa') * ATK - cf('Pd') * DEF, 1);
  } else {
    const tf = Math.pow(Math.max(attacker.troops, 1) / 10000, cf('betaM'));
    base = ratio * tf * cf('Ma') * ATK;
  }
  // 병종 상성 (+15%)
  const COUNTER = { '방패병': '궁병', '궁병': '창병', '창병': '기병', '기병': '방패병' };
  if (cf('troopEffects') && attacker.unitType && COUNTER[attacker.unitType] === defender.unitType) base *= 1 + cf('counterBonus');   // R-015: 병종 효과 제외가 기본
  base = Math.max(base, 1);
  // 주는피해와 받는피해는 '일반 피해 범주' 안에서 합연산으로 상쇄된다.
  // ── v1.11 W11·W13·W14: 주는 쪽과 받는 쪽을 분리한 곱 구조(잠정) ──
  //   주는 쪽: (1 + min(일반 증상 + 병기/책략 증상, 100%)) × (1 + 유형 증상)
  //   받는 쪽: (1 + 받는피해합성 + 위협류) × (1 + 받는 병기/책략) × (1 + 받는 유형)
  const outTypeMod = dmgType === '병기' ? (attacker.mods.주는병기피해 || 0) : (attacker.mods.주는책략피해 || 0);
  // FEAT-001: "병력이 자신보다 높은 목표에게 주는 피해 증가" (관우 오상)
  const vsHigher = defender.troops > attacker.troops ? (attacker.mods.병력우위대상피해 || 0) : 0;
  const outShared = Math.min((attacker.mods.주는피해 || 0) + outTypeMod + vsHigher, 1.0);
  const typeMod = dmgType === '병기' ? (defender.mods.받는병기피해 || 0) : (defender.mods.받는책략피해 || 0);
  const statusIn = accumStatus(defender, 'inDamageAdd', 'add');   // 위협 등
  let kindMod = 0;
  let outKindMod = 0;
  if (dmgTag === 'basic') {
    kindMod = defender.mods.받는일반공격피해 || 0;
    outKindMod = attacker.mods.주는일반공격피해 || 0;
  } else if (dmgTag === 'active') {
    kindMod = defender.mods.받는액티브피해 || 0;      // 예전엔 분기 중복으로 적용되지 않던 항목
    outKindMod = attacker.mods.주는액티브피해 || 0;
  } else if (dmgTag === 'pursuit') {
    kindMod = defender.mods.받는추격피해 || 0;
  }
  const outMult = Math.max(0, (1 + outShared) * (1 + outKindMod));
  const inMult = Math.max(0.1,
    (1 + (defender.mods.받는피해 || 0) + statusIn)
    * (1 + typeMod)
    * (1 + kindMod));
  let dmg = base * outMult * inMult;
  // 허약: 주는 최종 피해 70% 감소
  dmg *= accumStatus(attacker, 'outDamageMult', 'mult');
  // 회심은 감면 범주가 전부 적용된 '최종값'에 곱한다(최외곽 레이어).
  // 기본 피해에 먼저 곱하면 방어자 감면에 의해 회심 효과가 상쇄되는 왜곡이 생긴다.
  const critChance = dmgType === '병기' ? attacker.mods.회심 : attacker.mods.묘책;
  let crit = false;
  // 확정 회심: "다음 피해에 회심/묘책이 반드시 발동" (인재 기용, 견희 낙수의 여신).
  // 1회 소모형이므로 사용 즉시 차감한다. 견희 쪽은 "일반 공격이 아닌 피해"로 한정된다.
  let forcedCrit = false;
  if (attacker.guaranteedCrit > 0 && !(attacker.guaranteedCritNonBasicOnly && ratio === 1.0)) {
    attacker.guaranteedCrit--;
    forcedCrit = true;
  }
  if (forcedCrit || __rng() < clamp(critChance, 0, 0.95)) {
    // 요술: 회심/묘책 피해 15% 감소
    // 회심 배율 = 기본 1.5배 + 「회심/묘책 피해 증가」 mod (인재 기용 +40% 등).
    // 요술 등 회심피해 감소 상태이상은 증가분에만 적용된다.
    const critBonus = (coeffs.critMult - 1) + (attacker.mods.회심피해 || 0);
    const critMult = 1 + critBonus * accumStatus(attacker, 'critDamageMult', 'mult');
    dmg *= critMult;
    crit = true;
  }
  // 데미지 난수: 실제 게임은 같은 조건에서도 미세 편차가 있다 (전략판 기준 ±5%).
  // 우리 실측에서도 회복량이 182/181처럼 1% 안팎으로 흔들렸다.
  dmg *= (1 - coeffs.damageVariance) + __rng() * (2 * coeffs.damageVariance);
  dmg = Math.max(1, Math.round(dmg));
  // FEAT-011 역전(주태 금병법): 보호자가 대신 받아 준 우군의 다음 피해 증가
  const rv = attacker._reversal;
  if (rv) dmg = Math.max(1, Math.round(dmg * (1 + rv.bonus)));
  // FEAT-015 서서〈장검행〉: 책략 피해를 준 뒤 다음 병기 피해 증가
  const np = dmgType === '병기' ? attacker._nextPhysBonus : 0;
  if (np) dmg = Math.max(1, Math.round(dmg * (1 + np)));
  // FEAT-015 서성〈의성〉: 피해를 준 상대가 홍수 상태면 아군이 받는 피해 감소 (서성 생존 중)
  const fw = defender._floodWard;
  if (fw && fw.by.alive && hasStatus(attacker, '홍수')) dmg = Math.max(1, Math.round(dmg * (1 - fw.value)));
  if (DEBUG_DAMAGE_LOG && log) {
    log.push(`${turnNo}턴:   └[계산] ATK ${ATK.toFixed(1)} / DEF ${DEF.toFixed(1)} / 전법계수 ${(ratio*100).toFixed(1)}% ` +
      `→ 기초 ${base.toFixed(1)} × 주는피해 ${outMult.toFixed(3)} × 받는피해 ${inMult.toFixed(3)}` +
      `${crit ? ` × 회심 ${coeffs.critMult}` : ''} = ${dmg}`);
  }

  // 피신: 일정 확률로 피해 무효 (백발백중 보유 공격자에겐 무효화되지 않음)
  if (!hasStatus(attacker, '백발백중') && __rng() < clamp(defender.mods.피신 || 0, 0, 0.9)) {
    if (log) log.push(`${turnNo}턴:   [${defender.name}]이(가) 「피신」에 성공하여 피해를 무효화했습니다.`);
    __T({ e: 'evade', src: attacker.id, dst: defender.id, skill: __skillStack[__skillStack.length - 1] || null });
    // FEAT-012 피신 후 성장(공손찬〈백마의종〉): 피신할 때마다 무력·지력 +선공×ratio, 최대 max회
    const eg = defender._evadeGrowth;
    if (eg && (defender._evadeGrowthN || 0) < eg.max) {
      defender._evadeGrowthN = (defender._evadeGrowthN || 0) + 1;
      const add = defender.stats.선공 * eg.ratio;
      (eg.stats || ['무력', '지력']).forEach(k => { defender.stats[k] = (defender.stats[k] || 0) + add; });
      if (log) log.push(`${turnNo}턴:   [${defender.name}]의 무력·지력이 ${add.toFixed(2)} 증가했습니다. (피신 후 성장 ${defender._evadeGrowthN}/${eg.max})`);
    }
    return { dmg: 0, crit: false, evaded: true };
  }
  
  // FEAT-002 저항: 1스택 소모해 이번 피해를 무효로 한다 (적재적소 "저항 1중첩(피해 1회 무효)")
  const resistIdx = defender.statuses.findIndex(s => s.name === '저항');
  if (resistIdx >= 0) {
    defender.statuses.splice(resistIdx, 1);
    if (log) log.push(`${turnNo}턴:   [${defender.name}]이(가) 「저항」으로 이번 피해를 무효화했습니다.`);
    __T({ e: 'resist', src: attacker.id, dst: defender.id, skill: __skillStack[__skillStack.length - 1] || null });
    return { dmg: 0, crit: false, resisted: true };
  }
  // 방어 스택: 1스택 소모해 70~90% 감소 (기본 80% ± 난수, 무장 스탯과 무관한 시스템 고정값).
  // 평타·액티브·추격·지속피해 등 모든 직접 피해에 발동한다. 방어파괴 보유 공격자에겐 무시됨.
  const guardIdx = defender.statuses.findIndex(s => s.name === '방어');
  if (guardIdx >= 0 && !hasStatus(attacker, '방어파괴')) {
    defender.statuses.splice(guardIdx, 1);
    const reduced = Math.max(1, Math.round(dmg * (1 - randRange(0.7, 0.9))));
    if (log) log.push(`${turnNo}턴:   [${defender.name}]이(가) 방어 횟수를 1회 소모하여 이번 피해가 ${(100*(1-reduced/dmg)).toFixed(0)}% 감소합니다.`);
    dmg = reduced;
  }

  // FEAT-007 대신 받기(주태 불굴의 의지): 보호 상태인 우군이 현재 병력의 일정 비율보다 큰 피해를 받기 직전,
  //   확률로 보호자가 그 피해를 줄여서 대신 받는다 (전보: "[주태]이(가) [악진] 대신 피해를 받습니다.")
  const gd = defender._guard;
  if (gd && gd.by.alive && gd.by !== defender && dmg > defender.troops * gd.cfg.threshold
      && (gd.count[turnNo] || 0) < gd.cfg.perTurn && __rng() < gd.cfg.chance) {
    gd.count[turnNo] = (gd.count[turnNo] || 0) + 1;
    const g = gd.by;
    const shared = Math.max(1, Math.round(dmg * (1 - gd.cfg.cut)));
    if (log) log.push(`${turnNo}턴:   [${g.name}]이(가) [${defender.name}] 대신 피해를 받습니다.`);
    __T({ e: 'guard', src: g.id, dst: defender.id, amount: shared, skill: gd.skill });
    applyGuardedLoss(g, attacker, shared, dmgType, dmgTag, crit, coeffs, log, turnNo);
    if (g._guardReversal && g.alive) defender._reversal = { by: g, bonus: g._guardReversal.bonus, healRatio: g._guardReversal.healRatio };
    return { dmg: 0, crit, guarded: true };
  }
  dmg = unyieldingCheck(defender, dmg, log, turnNo);
  const lossReal = Math.min(dmg, defender.troops);
  defender.troops = Math.max(0, defender.troops - dmg);
  if (np) delete attacker._nextPhysBonus;
  if (dmgType === '책략' && attacker._strategyThenPhys) attacker._nextPhysBonus = attacker._strategyThenPhys;
  if (rv) {
    delete attacker._reversal;
    const g = rv.by;
    if (g.alive) {
      const before = g.troops;
      g.troops = Math.min(g.maxTroops, g.troops + Math.round(dmg * rv.healRatio * (1 + (g.mods.받는회복량 || 0)) * accumStatus(g, 'healReceivedMult', 'mult')));
      g.wounded = Math.max(0, (g.wounded || 0) - (g.troops - before));
      if (log) log.push(`${turnNo}턴:   [${g.name}]이(가) 「역전」으로 병력을 ${g.troops - before}(${g.troops}) 회복했습니다.`);
    }
  }
  __T({ e: 'damage', src: attacker.id, dst: defender.id, amount: dmg, dmgType, tag: dmgTag, crit: !!crit, skill: __skillStack[__skillStack.length - 1] || null, after: defender.troops });
  defender.wounded = (defender.wounded || 0) + Math.round(lossReal * (coeffs.woundedRate != null ? coeffs.woundedRate : DEFAULT_COEFFS.woundedRate));   // v1.12 W43 (FIX-006: 실제로 잃은 병력 기준)
  if (defender.troops <= 0) defender.alive = false;
  // 독살 시해(이유 군주 시해): 짐독 상태인 대상을 때리면 확률로 짐독 1스택 추가
  if (hasStatus(attacker, '시해') && hasStatus(defender, '짐독') && __rng() < 0.5) {
    const cnt = defender.statuses.filter(s => s.name === '짐독').length;
    if (cnt < 5) {
      // 짐독은 이유만 부여할 수 있으므로, 기존 스택의 시전자(이유)를 그대로 승계한다
      const src = defender.statuses.find(s => s.name === '짐독');
      defender.statuses.push({ name: '짐독', remain: 2,
        casterId: src ? src.casterId : attacker.id, casterName: src ? src.casterName : attacker.name });
    }
    if (log) log.push(`${turnNo}턴:   [${defender.name}]의 「짐독」이(가) 1스택 추가됐습니다. (${attacker.name}의 시해)`);
  }
  // 회유/심리공격: 준 피해만큼 자신의 병력 회복
  // 이것도 "회복"이므로 받는회복량/군량 고갈 보정을 동일하게 적용한다
  // (예전에는 보정 없이 그대로 더해서, 군량 고갈이 걸려도 흡혈은 멀쩡히 되는 문제가 있었음)
  const drain = dmgType === '병기' ? (attacker.mods.회유 || 0) : (attacker.mods.심리공격 || 0);
  if (drain > 0 && attacker.alive) {
    const drainName = dmgType === '병기' ? '회유' : '심리 공격';
    if (log) log.push(`${turnNo}턴: [${attacker.name}]이(가) ${drainName}을(를) 발동했습니다.`);
    let leech = dmg * drain;
    leech *= (1 + (attacker.mods.받는회복량 || 0));
    // 군량 고갈 등으로 회복이 깎이면 실제 게임처럼 그 사유를 한 줄로 남긴다
    const healMult = accumStatus(attacker, 'healReceivedMult', 'mult');
    if (healMult < 1) {
      const src = attacker.statuses.find(s => s.name === '군량 고갈');
      const by = src && src.casterName ? `[${src.casterName}]의 ` : '';
      if (log) log.push(`${turnNo}턴:   [${attacker.name}]이(가) ${by}「군량 고갈」 효과로 치유 효과 ${(healMult*100).toFixed(0)}%(으)로 감소`);
    }
    leech *= healMult;
    const before = attacker.troops;
    attacker.troops = Math.min(attacker.maxTroops, attacker.troops + Math.round(leech));
    attacker.wounded = Math.max(0, (attacker.wounded || 0) - (attacker.troops - before));   // FIX-006 회유·심리 공격 회복도 부상병에서 나온다
    if (log) log.push(`${turnNo}턴:   [${attacker.name}]이(가) 병력을 ${attacker.troops - before}(${attacker.troops}) 회복했습니다.`);
  }
  return { dmg, crit };
}

// FEAT-007 불굴: 보호자 자신이 곧 사망할 때 생존한 우군이 있으면 치명적 피해 1회 면역(발동마다 다음 확률 −10%p)
function unyieldingCheck(u, dmg, log, turnNo) {
  const uy = u._unyielding;
  if (!uy || dmg < u.troops || !u._allies || !u._allies.some(a => a !== u && a.alive)) return dmg;
  const p = Math.max(0, 1 - uy.decay * uy.n);
  if (__rng() >= p) return dmg;
  uy.n++;
  if (log) log.push(`${turnNo}턴:   [${u.name}]이(가) 「불굴」로 치명적인 피해를 면역합니다.`);
  __T({ e: 'status', src: u.id, dst: u.id, status: '불굴', dur: 0, refreshed: false, skill: uy.skill });
  return 0;
}
function applyGuardedLoss(g, attacker, amount, dmgType, dmgTag, crit, coeffs, log, turnNo) {
  amount = unyieldingCheck(g, amount, log, turnNo);
  g.troops = Math.max(0, g.troops - amount);
  __T({ e: 'damage', src: attacker.id, dst: g.id, amount, dmgType, tag: dmgTag, crit: !!crit, skill: __skillStack[__skillStack.length - 1] || null, after: g.troops, guarded: true });
  g.wounded = (g.wounded || 0) + Math.round(amount * (coeffs.woundedRate != null ? coeffs.woundedRate : DEFAULT_COEFFS.woundedRate));
  if (log) log.push(`${turnNo}턴:   [${g.name}]은(는) [${attacker.name}]의 피해로 병력이 ${amount}(${g.troops}) 손실됐습니다.`);
  if (g.troops <= 0) g.alive = false;
}

function calcHeal(caster, target, ratio, coeffs, healStat) {
  // 공격 스케일과 비슷한 크기로 맞춤 (근사): 지력 기반, maxTroops 비례가 아님
  // maxTroops 비례로 하면 통솔 높은 탱커 대상 고비율 회복기가 비현실적으로 강력해짐
  // ① 기초 회복 = C × 시전자 지력 × 유효치유율 × HEAL_SCALE
  //   "(지력의 영향 받음)" 계층: 치유율 += (지력 - 100) x 0.0012. 기준점이 100이라
  //   지력 100 미만 무장은 오히려 치유율이 깎인다 — 이 페널티 구조가 실측과 일치한다.
  //   통솔/무력은 반영하지 않는다: "지력과 통솔의 영향"이라 적힌 지혜의 바람이 지력항만으로
  //   오차 3%에 맞아서(통솔 213.20인데도) 통솔 기여가 유의미하지 않다고 판단했다.
  //   무력도 같은 이유로 미반영. 단 전쟁 조달만 실측이 예측의 4.56배로 크게 어긋나는데,
  //   이는 무력 계수로 설명하기엔 과도해서(지력 가중치의 18배 필요) 별도 구조로 추정된다
  //   — "일반 공격 후" 발동이라 공격 피해량 연동(흡혈)일 가능성. 미해결, 표본 추가 필요.
  //   회복량은 시전자 병력에 비례하지 않는다. beta 미적용.
  // healStat: 회복량이 지력 대신 다른 능력치를 따르는 경우 (FEAT-008, 결사의 다짐 '결사' → 통솔, 전보 확인)
  const casterInt = effStat(caster, healStat || '지력');
  const w = coeffs && coeffs.healStatW != null ? coeffs.healStatW : HEAL_STAT_W;   // v1.11: 회복은 검증된 기존 가중치 유지 (민감도 분석용으로 계수화)
  const effRatio = Math.max(0, ratio + (casterInt - 100) * w);
  // v1.12 W44(잠정): 회복 = 시전자 지력 × 유효치유율. 시전자 병력과 무관(평화의 기운 3턴 327 vs 예측 339).
  let heal = casterInt * effRatio;
  // 회복도 시전자의 남은 병력에 비례한다(피해와 같은 비선형 계수를 공유).
  // (v1.12: 회복은 시전자 병력에 비례하지 않음 — 병력 계수 제거)
  // ② 시전자의 "주는 회복 효과" 보정
  heal *= (1 + (caster.mods.주는회복량 || 0));
  // ③ 대상의 "받는 회복 효과" 보정 (등애 둔전령 +10%, 인연 명실상부 +8% 등)
  // (받는회복량은 아래 healMult에서 합연산으로 함께 처리한다)
  // ④ 회복 2배 발동 (순욱 인재 등용 등) — 시전자 기준 확률 판정
  const dblChance = caster.mods.회복2배확률 || 0;
  let doubled = false;
  if (dblChance > 0 && __rng() < clamp(dblChance, 0, 1)) { heal *= 2; doubled = true; }
  // ⑤ 군량 고갈: 받는 병력 회복 효과 70% 감소
  // 받는 치유 효과는 같은 범주라 합연산이다: (1 + 증가총합 − 감소총합)
  // 예) 받는치유 +30%, 군량 고갈 −70% → 1 + 0.30 − 0.70 = 0.60
  const healMult = Math.max(0, 1 + (target.mods.받는회복량 || 0)
    + (accumStatus(target, 'healReceivedMult', 'mult') - 1));
  heal *= healMult;
  heal = Math.max(0, Math.round(heal));
  // ⑥ 최대 병력 초과분은 버려짐(오버힐)
  heal = Math.min(heal, target.maxTroops - target.troops);
  // v1.12 W43: 회복은 부상병 수가 상한
  // R-011: 부상병을 따로 두지 않는다 — 기본은 잃은 병력까지 회복 (woundedCap=true 면 v1.12 부상병 상한)
  const cap = (coeffs && coeffs.woundedCap) ? (target.wounded || 0) : (target.maxTroops - target.troops);
  heal = Math.min(heal, Math.max(0, cap));
  if (!target.alive || target.troops <= 0) return { heal: 0, doubled: false, healMult, effRatio };
  target.troops += heal;
  __T({ e: 'heal', src: caster.id, dst: target.id, amount: heal, doubled, skill: __skillStack[__skillStack.length - 1] || null });
  target.wounded = Math.max(0, (target.wounded || 0) - heal);
  return { heal, doubled, healMult, effRatio };
}

// ============================================================
// 연계(트리거) 전법 시스템
// "피해를 준 후", "피해를 받으면", "적이 디버프를 받으면" 처럼 고정 슬롯이 아니라
// 전투 중 특정 사건에 반응해 발동하는 전법들을 위한 이벤트 버스.
// 매 턴 시작 시 unit.triggerCounts를 초기화하고, 사건 발생 시 조건에 맞는
// 트리거 보유자를 찾아 확률 판정 후 재발동시킨다.
// ============================================================
function rollTrigger(unit, skill) {
  const t = skill.trigger;
  const used = unit.triggerCounts[skill.id] || 0;
  if (used >= (t.maxPerTurn || 1)) return false;
  unit.battleTriggerCounts = unit.battleTriggerCounts || {};
  if (t.maxPerBattle != null && (unit.battleTriggerCounts[skill.id] || 0) >= t.maxPerBattle) return false;
  if (t.condition && !evalCondition(t.condition, { self: unit, target: unit, attacker: unit })) return false;
  const __ok = __rng() < (t.chance != null ? t.chance : 1);
  __T({ e: 'roll', unit: unit.id, skill: skill.id, kind: 'trigger', p: t.chance != null ? t.chance : 1, ok: __ok, used, max: t.maxPerTurn || 1 });
  if (!__ok) return false;
  unit.triggerCounts[skill.id] = used + 1;
  unit.battleTriggerCounts[skill.id] = (unit.battleTriggerCounts[skill.id] || 0) + 1;
  return true;
}

function emitDamageEvent(ctx, allUnits, coeffs, log, turn, contrib) {
  const { attacker, defender, dmgType, crit, isBasic } = ctx;
  allUnits.forEach(u => {
    if (!u.alive) return;
    u.skills.forEach(skill => {
      const t = skill.trigger;
      if (!t || t.event !== 'damage') return;
      // 추격(追擊) 계열 전법은 게임 규칙상 "일반 공격 후"에만 발동 가능하고, 반격으로는 발동되지 않는다
      // (용어 시트 8번 항목 + 중국 커뮤니티 자료 교차검증). type==='추격'인데 trigger로 구현된 경우
      // (천군소탕/원문사극/경무장 등)에도 이 전제조건을 강제한다. 이게 빠져 있으면 액티브/지휘 피해에도
      // 즉시 반응해버려 "1턴에 일반공격도 안 했는데 천군소탕이 터진다" 같은 버그가 생긴다.
      // 추격은 (가) 일반 공격이 낸 피해여야 하고 (나) 일반 공격 단계 안이어야 한다.
      // isBasic만으로는 액티브가 낸 피해에 반응하는 걸 막지만, 단계 밖 호출까지는 못 막아서
      // u.inBasicPhase 플래그로 이중 확인한다 (원문사극이 일반공격보다 먼저 찍히던 문제).
      // 추격 전법 발동 규칙:
      //   (가) 일반 공격이 낸 피해여야 하고 (isBasic)
      //   (나) 일반 공격 단계 안이어야 하며 (inBasicPhase)
      //   (다) "그 일반 공격 1회당 판정 1번"만 얻는다.
      //   전법 설명의 "매 턴 N회"는 연격 등으로 평타를 여러 번 칠 때의 상한선(Cap)이지,
      //   평타 1회에 N번 터진다는 뜻이 아니다. 예전에는 이 구분이 없어 원문사극이
      //   판당 13회씩 발동했다(실전 9회).
      if (skill.type === '추격') {
        if (!isBasic || !u.inBasicPhase) return;
        u._pursuitDoneThisHit = u._pursuitDoneThisHit || {};
        if (u._pursuitDoneThisHit[skill.id]) return;   // 이번 평타에서 이미 판정함
        u._pursuitDoneThisHit[skill.id] = true;
      }
      if (t.afterBasic) {   // FEAT-003: "일반 공격 후" — 추격과 같은 관문(일반 공격 판정 피해, 평타 1회당 1번)
        if (!isBasic || !u.inBasicPhase || u !== attacker) return;
        u._afterBasicDone = u._afterBasicDone || {};
        const hitKey = skill.id + ':' + turn + ':' + (u._basicSeq || 0);
        if (u._afterBasicDone[hitKey]) return;
        u._afterBasicDone[hitKey] = true;
      }
      if (t.role === 'dealt' && u !== attacker) return;
      if (t.role === 'taken' && u !== defender) return;
      if (t.role === 'either' && u !== attacker && u !== defender) return;
      if (t.role === 'ally_taken' && (defender.side !== u.side)) return;
      // ally_dealt: "전체 아군에게 ~ 피해를 준 후" — 아군 누구든 피해를 냈을 때 발동
      if (t.role === 'ally_dealt' && (attacker.side !== u.side)) return;
      // "통솔이 가장 높은 아군 단일 목표가 피해를 받을 때마다" 처럼 피격 대상이 특정 조건을
      // 만족해야만 발동하는 유형. (난세의 간웅이 아무 아군이나 맞으면 터져서 판당 28회씩
      // 발동하던 문제 — 실제 전보에서는 1회로 집계된다)
      if (t.requireDefenderIs) {
        const want = selectTargets(u, [t.requireDefenderIs], allUnits, true)[0];
        if (!want || want !== defender) return;
      }
      if (t.filterDmgType && t.filterDmgType !== dmgType) return;
      if (t.requireCrit && !crit) return;
      if (!rollTrigger(u, skill)) return;
      applySkillEffects(u, skill, allUnits, coeffs, log, turn, contrib, { attacker, defender });
    });
  });
}

// 적에게 건 증감 중 '불리한 쪽'인지 판정 (디버프 부여 트리거용)
const DEBUFF_IF_NEGATIVE = ['주는피해','주는병기피해','주는책략피해','회심','묘책','연타확률',
  '피신','회유','심리공격','액티브발동률','받는회복량','반격확률'];
const DEBUFF_IF_POSITIVE = ['받는피해','받는병기피해','받는책략피해','받는일반공격피해',
  '받는액티브피해','받는추격피해'];
function isDebuffMod(key, amt) {
  if (amt < 0 && DEBUFF_IF_NEGATIVE.includes(key)) return true;
  if (amt > 0 && DEBUFF_IF_POSITIVE.includes(key)) return true;
  return false;
}

function emitDebuffEvent(ctx, allUnits, coeffs, log, turn, contrib) {
  const { caster, target } = ctx;
  allUnits.forEach(u => {
    if (!u.alive) return;
    u.skills.forEach(skill => {
      const t = skill.trigger;
      if (!t || t.event !== 'debuff') return;
      if (t.role === 'self_cast' && u !== caster) return;
      if (t.role === 'ally_side' && target.side === u.side) return; // "적이 디버프 받으면" = 대상이 내 편이 아닐 때
      // '이상 상태'만 보는 트리거(주유 기지의 승리)는 기본 디버프에는 반응하지 않는다.
      if (t.abnormalOnly && !ctx.abnormal) return;
      if (t.statusName && t.statusName !== ctx.statusName) return;   // FEAT-001: 특정 상태 부여에만 반응
      if (skill.onlyTurns && !skill.onlyTurns.includes(turn)) return;   // FEAT-011: "첫 3턴 동안" 등
      if (!rollTrigger(u, skill)) return;
      applySkillEffects(u, skill, allUnits, coeffs, log, turn, contrib, { caster, target });
    });
  });
}

// calcDamage + 연계 트리거 발동을 함께 처리하는 진입점 (모든 데미지는 이 함수를 거친다)
// isBasic: 이번 피해가 "일반 공격"(또는 그 연타)에서 나온 것인지 여부. 추격 전법 발동 조건 판정에 쓰인다.
function dealDamage(attacker, defender, ratio, dmgType, coeffs, log, allUnits, turn, contrib, isBasic, dmgTag) {
  const result = calcDamage(attacker, defender, ratio, dmgType, coeffs, log, turn, dmgTag || (isBasic ? 'basic' : 'active'));
  if (result.resisted) return result;   // 저항으로 무효 — 피격·회피 연계 없음
  if (result.evaded) {
    // 피신 성공 이벤트 — 칠진칠출(조운)의 '용담'처럼 회피에 반응하는 전법용
    emitEvadeEvent({ evader: defender, attacker }, allUnits, coeffs, log, turn, contrib);
  } else {
    emitDamageEvent({ attacker, defender, dmgType, crit: result.crit, isBasic: !!isBasic }, allUnits, coeffs, log, turn, contrib);
  }
  return result;
}

function emitEvadeEvent(ctx, allUnits, coeffs, log, turn, contrib) {
  const { evader, attacker } = ctx;
  if (!evader.alive) return;
  evader.skills.forEach(skill => {
    const t = skill.trigger;
    if (!t || t.event !== 'evade') return;
    if (!rollTrigger(evader, skill)) return;
    applySkillEffects(evader, skill, allUnits, coeffs, log, turn, contrib, { attacker: evader, defender: attacker });
  });
}

// ---------- 조건부 효과 판정 ----------
// "목표가 이미 OO 상태면 추가 효과", "무력이 지력보다 높으면 ~", "후열이면 ~" 같은
// 조건부 보너스/분기를 위한 범용 판정기.
function hasStatus(unit, name) { return unit.statuses.some(s => s.name === name); }
const CONTROL_DEBUFFS = ['공포', '무장 해제', '침묵', '혼란', '조롱', '허약', '군량 고갈'];
// 용어 시트 29~33: 비제어 이상상태 디버프 (제거 대상에는 포함되지만 제어 판정에는 안 들어감)
const NON_CONTROL_DEBUFFS = ['홍수', '화공', '폭풍', '위협', '요술'];
// 인게임 정의: "특수 디버프 상태 종류: 공포, 무장 해제, 침묵, 혼란, 조롱, 허약, 군량 고갈,
//   홍수, 화공, 폭풍, 위협, 요술 — 총 12가지"
// '디버프 부여 후' 트리거(주유 기지의 승리·세금 과징수 등)는 오직 이 12종에만 반응한다.
// 정신 회복·방어·피신 같은 기능성 버프나 단순 스탯 감소는 해당되지 않는다.
const SPECIAL_DEBUFFS = ['공포', '무장 해제', '무장해제', '침묵', '혼란', '조롱', '허약', '군량 고갈',
  '홍수', '화공', '폭풍', '위협', '요술'];
// 용어 시트 41번 '기본 디버프': 주는 피해 감소, 받는 피해 증가, 속성치 감소 등
//   '전법이 주는' 디버프 상태. 병법·장비 등 전법 외 효과는 여기 포함되지 않는다.
// → '디버프' 참조 트리거(세금 과징수·독설가·출기불의 등)는 이상 상태 12종 + 기본 디버프 모두에 반응하고,
//   '이상 상태' 참조 트리거(주유 기지의 승리)는 12종에만 반응한다.
const BASIC_DEBUFF_MODS_NEG = ['주는피해','주는병기피해','주는책략피해','회심','묘책','연타확률',
  '피신','회유','심리공격','액티브발동률','받는회복량','반격확률','간파','방어관통'];
const BASIC_DEBUFF_MODS_POS = ['받는피해','받는병기피해','받는책략피해','받는일반공격피해',
  '받는액티브피해','받는추격피해'];
function isBasicDebuff(key, amt) {
  if (amt < 0 && BASIC_DEBUFF_MODS_NEG.includes(key)) return true;
  if (amt > 0 && BASIC_DEBUFF_MODS_POS.includes(key)) return true;
  return false;
}
// 대상이 '디버프 상태'인가 (이상 상태 12종 OR 기본 디버프 보유)
function hasAnyDebuffState(u) {
  if (u.statuses.some(s => SPECIAL_DEBUFFS.includes(s.name))) return true;
  if (u.buffs && u.buffs.some(b => isBasicDebuff(b.stat, b.value))) return true;
  if (u.statBuffs && u.statBuffs.some(b => b.value < 0)) return true;   // 속성치 감소
  return false;
}

// ============================================================
// 상태이상 / 기능성 버프 정의 (용어 시트 기준)
// 이전에는 상태이상이 "부여만 되고" 실제 효과가 전혀 없어서 제어형 덱이 저평가되고 있었음.
// ============================================================
const STATUS_DEF = {
  // --- 제어 계열 (정신 회복 보유 시 일시 무효) ---
  // 공포: 일반 공격 + 액티브 전법만 불가. 지휘·패시브·추격은 정상 발동한다.
  //   (게임 툴팁: "이상 상태이자 제어 상태, 액티브 전법과 일반 공격 불가")
  //   ※ 게임 업데이트로 위협↔공포 정의가 서로 뒤바뀌었다.
  '공포':      { control: true, blockBasic: true, blockActive: true },
  '무장 해제': { control: true, blockBasic: true },
  // 침묵: 구버전 '능력 소진'이 이름만 바뀐 것. 액티브 전법만 봉쇄한다.
  '침묵':      { control: true, blockActive: true },
  '혼란':      { control: true, randomizeTarget: true },
  '조롱':      { control: true, forceTargetCaster: true },
  '허약':      { control: true, outDamageMult: 0.3 },    // 주는 최종 피해 70% 감소
  '군량 고갈': { control: true, healReceivedMult: 0.3 }, // 받는 병력 회복 70% 감소
  // --- 비제어 계열 ---
  '홍수': { statDelta: { 통솔: -20 } },
  '화공': { statDelta: { 지력: -15 } },
  '폭풍': { statDelta: { 선공: -30 } },
  // 위협: 받는 피해 +10% (구버전에선 '공포'였음).
  // ※ 게임 툴팁의 「받는 피해」 수치에는 위협분이 이미 합산되어 표시된다.
  //   실측 로그로 계수를 역산할 때 위협을 또 더하면 중복이 되니 주의.
  //   시뮬 내부에서는 여기서 한 번만 더한다.
  // 짐독: 디버프. 매 턴 시작 시 (60% × 스택수)의 책략 피해를 받는다. 최대 5스택.
  //   이유만 부여할 수 있고, 피해는 짐독을 건 이유의 지력으로 계산한다.
  '짐독': { stackable: true, maxStack: 5, dotRatioPerStack: 0.6 },
  // 탈주병: 상태가 아니라 즉시 고정 피해로 처리된다(dealDesertionDamage 참조)
  '탈주병': { instantFixedDamage: true },
  // ── 기능성 버프 ──
  // 아래 넷은 STATUS_DEF의 공통 처리(statDelta/blockXxx)가 아니라 엔진 각 지점에서
  // 개별 로직으로 구현돼 있다. 감사기가 "정의 없음"으로 오탐하지 않도록 여기 등재한다.
  '방어':      { guardStack: true },
  '저항':      { resistStack: true },     // FEAT-002: calcDamage — 1스택 소모해 피해 1회 무효      // calcDamage: 1스택 소모해 피해 70~90% 감소
  '피신':      { evadeStack: true },      // calcDamage: 확률로 피해 완전 무효
  '정신 회복': { suppressControl: true }, // isControlSuppressed(): 제어 상태 효과 무효화
  '백발백중':  { ignoreEvade: true },     // calcDamage: 대상의 피신을 무시
  // 시해: 버프. 보유자가 짐독 대상에게 병기/책략 피해를 주면 50%로 짐독 1스택 추가.
  '시해': { grantsPoisonStack: 0.5 },
  '위협': { inDamageAdd: 0.10 },
  '요술': { critDamageMult: 0.85 },   // 회심/묘책 피해 15% 감소
};

function isControlSuppressed(unit) { return hasStatus(unit, '정신 회복'); }
// 조롱: 나에게 조롱을 건 시전자를 강제 공격 대상으로 반환 (시전자가 죽었으면 무효)
function tauntTargetFor(unit, allUnits) {
  if (isControlSuppressed(unit)) return null;
  const taunt = unit.statuses.find(s => s.name === '조롱' && s.casterId);
  if (!taunt) return null;
  const caster = allUnits.find(u => u.id === taunt.casterId && u.alive && u.side !== unit.side);
  return caster || null;
}
function activeStatuses(unit) {
  const suppressed = isControlSuppressed(unit);
  return unit.statuses.filter(s => {
    const def = STATUS_DEF[s.name];
    if (!def) return false;
    if (def.control && suppressed) return false;
    return true;
  });
}
function statusFlag(unit, key) {
  return activeStatuses(unit).some(s => STATUS_DEF[s.name] && STATUS_DEF[s.name][key]);
}
// 상태이상 보정이 반영된 실제 스탯 (원본 stats는 훼손하지 않음)
function effStat(unit, stat) {
  let v = unit.stats[stat] || 0;
  activeStatuses(unit).forEach(s => {
    const d = STATUS_DEF[s.name] && STATUS_DEF[s.name].statDelta;
    if (d && d[stat]) v += d[stat];
  });
  // 스탯 하한은 0이 아니라 1이다 (아무리 깎여도 최소 1로 공식에 대입된다).
  return Math.max(1, v);
}
function accumStatus(unit, key, mode) {
  let acc = mode === 'mult' ? 1 : 0;
  activeStatuses(unit).forEach(s => {
    const d = STATUS_DEF[s.name];
    if (!d || d[key] === undefined) return;
    if (mode === 'mult') acc *= d[key]; else acc += d[key];
  });
  return acc;
}

function resolveWho(who, ctx) {
  if (who === 'attacker') return ctx.attacker;
  if (who === 'target') return ctx.target;
  if (who === 'self') return ctx.self;
  return null;
}
function evalCondition(cond, ctx) {
  if (!cond) return true;
  let result;
  switch (cond.type) {
    case 'hasStatus': {
      const u = resolveWho(cond.who, ctx);
      result = u ? hasStatus(u, cond.status) : false;
      break;
    }
    case 'isFront': { // "목표가 전열이면" — 정욱 용맹의 화신 등
      const u = resolveWho(cond.who, ctx);
      result = !!u && u.position === 'front';
      break;
    }
    case 'hasAnyStatus': {
      const u = resolveWho(cond.who, ctx);
      const list = cond.status === 'CONTROL_GROUP' ? CONTROL_DEBUFFS : cond.statuses;
      result = u ? list.some(name => hasStatus(u, name)) : false;
      break;
    }
    case 'hasAnyDebuff': { // "디버프 상태를 보유한 경우" 처럼 특정 이름을 명시하지 않는 범용 디버프 체크
      const u = resolveWho(cond.who, ctx);
      result = u ? u.statuses.length > 0 : false;
      break;
    }
    case 'statCompareSelf': { // 같은 유닛의 두 스탯 비교 (예: 서서 - 목표 무력 vs 목표 지력)
      const u = resolveWho(cond.who, ctx);
      if (!u) { result = false; break; }
      const a = u.stats[cond.stat1], b = u.stats[cond.stat2];
      result = cond.op === '>' ? a > b : a < b;
      break;
    }
    case 'statCompareUnits': { // 서로 다른 두 유닛의 같은 스탯 비교 (예: 일인천군, 무열파로)
      const u1 = resolveWho(cond.who1, ctx), u2 = resolveWho(cond.who2, ctx);
      if (!u1 || !u2) { result = false; break; }
      const a = u1.stats[cond.stat], b = u2.stats[cond.stat];
      result = cond.op === '>' ? a > b : a < b;
      break;
    }
    case 'position': {
      const u = resolveWho(cond.who, ctx);
      result = u ? u.position === cond.pos : false;
      break;
    }
    case 'unitType': {
      const u = resolveWho(cond.who, ctx);
      result = u ? u.unitType === cond.value : false;
      break;
    }
    case 'troopsBelow': {
      const u = resolveWho(cond.who, ctx);
      result = u ? u.troops < u.maxTroops * cond.ratio : false;
      break;
    }
    case 'gender': {
      const u = resolveWho(cond.who, ctx);
      result = u ? u.gender === cond.value : false;
      break;
    }
    default: result = true;
  }
  return cond.negate ? !result : result;
}

// 턴 조건 판정: {parity:'odd'|'even'} / {turns:[2,4]} / {maxTurn:3}
function turnMatches(cond, turn) {
  if (!cond) return true;
  if (cond.parity === 'odd' && turn % 2 === 0) return false;
  if (cond.parity === 'even' && turn % 2 === 1) return false;
  if (cond.turns && !cond.turns.includes(turn)) return false;
  if (cond.maxTurn && turn > cond.maxTurn) return false;
  if (cond.minTurn && turn < cond.minTurn) return false;
  return true;
}
// 대상이 보유한 "이상 상태" 개수 (기문둔갑 등 개수 비례 스케일용)
function abnormalCount(unit) {
  return unit.statuses.filter(s => STATUS_DEF[s.name]).length;
}
// 적군 중 시전자와 성별이 다른(이성) 인원 수 (궁희 등)
function oppositeGenderCount(unit, allUnits) {
  return allUnits.filter(u => u.alive && u.side !== unit.side && u.gender !== unit.gender).length;
}

// ---------- 효과 실행 ----------
function applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib, eventCtx) {
  const __inv = ++__invSeq;
  __T({ e: 'skill', inv: __inv, unit: unit.id, skill: skill.id, kind: skill.type, via: eventCtx ? 'event' : 'slot' });
  __skillStack.push(skill.id);
  __invStack.push(__inv);
  try {
    if (skill.statusFirst && skill.effects && (skill.effects.statusEffects || []).length) {   // FEAT-002
      const eff = skill.effects;
      __applySkillEffectsImpl(unit, { ...skill, effects: { targets: eff.targets, statusEffects: eff.statusEffects } }, allUnits, coeffs, log, turn, contrib, eventCtx, true);
      return __applySkillEffectsImpl(unit, { ...skill, effects: { ...eff, statusEffects: [] } }, allUnits, coeffs, log, turn, contrib, eventCtx);
    }
    return __applySkillEffectsImpl(unit, skill, allUnits, coeffs, log, turn, contrib, eventCtx);
  }
  finally {
    __skillStack.pop(); __invStack.pop();
    (unit._lastCast = unit._lastCast || {})[skill.id] = turn;   // FEAT-004
    // 금병법 등 "액티브/추격 전법 발동 후" 반응형 효과 (FEAT-001)
    if ((skill.type === '액티브' || skill.type === '추격') && !skill.isManual && unit.alive) emitCastEvent({ caster: unit, skill }, allUnits, coeffs, log, turn, contrib);
  }
}
function emitCastEvent(ctx, allUnits, coeffs, log, turn, contrib) {
  const { caster, skill: cast } = ctx;
  allUnits.forEach(u => {
    if (!u.alive) return;
    u.skills.forEach(skill => {
      const t = skill.trigger;
      if (!t || t.event !== 'cast' || skill === cast) return;
      if (t.castType && t.castType !== cast.type) return;
      if (t.castSkill === 'unique' && !cast.isUnique) return;   // 자기 고유 전법 (role 'self' 와 함께 쓴다)
      if (t.role === 'self' && u !== caster) return;
      if (t.role === 'ally_side' && u.side !== caster.side) return;
      if (t.casterIs) {
        const ok = t.casterIs.some(code => code === 'self' ? u === caster : selectTargets(u, [code], allUnits, true)[0] === caster);
        if (!ok) return;
      }
      if (!rollTrigger(u, skill)) return;
      applySkillEffects(u, skill, allUnits, coeffs, log, turn, contrib, { attacker: caster, defender: null, caster });
    });
  });
}
function __applySkillEffectsImpl(unit, skill, allUnits, coeffs, log, turn, contrib, eventCtx, __noCount) {
  const eff = skill.effects || {};
  const targetCodes = eff.targets && eff.targets.length ? eff.targets : ['random_enemy_1'];
  let value = 0;
  const tags = {}; // 같은 스킬 내에서 앞서 정한 대상을 뒤 효과가 재사용하기 위한 태그 저장소
  let __sharedDmgTargets = null; // FIX-002
  const __chanceRolls = {};       // FIX-003
  // FIX-008(R-021): "N% 확률로 [대상]에게 …" 는 시전 1회에 한 번 판정하고, 성공하면 대상 전원에게 효과가 들어간다.
  //   같은 확률 값을 쓰는 항목(조롱 및 위협 등)은 같은 판정을 공유한다.
  const passOnce = x => { const k = 'once:' + x.chance; if (!(k in __chanceRolls)) __chanceRolls[k] = __rng() < x.chance; return __chanceRolls[k]; };
  const passChance = x => x.chance == null || (x.chanceOnce ? passOnce(x) : __rng() < x.chance);
  function resolveSpecial(code) {
    // 연계 발동 시 "방금 그 대상"을 가리키는 특수 코드 (예: 반격은 원래 공격자에게)
    if (code === 'trigger_defender' && eventCtx && eventCtx.defender) return [eventCtx.defender];
    if (code === 'trigger_attacker' && eventCtx && eventCtx.attacker) return [eventCtx.attacker];
    if (code === 'trigger_target' && eventCtx && eventCtx.target) return [eventCtx.target];   // FEAT-001: 상태를 받은 대상
    if (code.startsWith('tag:') && tags[code.slice(4)]) return tags[code.slice(4)];
    return null;
  }

  (eff.statMods || []).forEach(sm => {
    let targets;
    if (sm.target === 'self') targets = [unit];
    else if (sm.target && resolveSpecial(sm.target)) targets = resolveSpecial(sm.target);
    else if (sm.target) targets = selectTargets(unit, [sm.target], allUnits);
    else targets = selectTargets(unit, targetCodes, allUnits);
    if (sm.tag) tags[sm.tag] = targets;   // FEAT-002
    targets.forEach(t => {
      if (sm.condition && !evalCondition(sm.condition, { attacker: unit, target: t, self: unit })) return;
      if (!passChance(sm)) return;
      let amt = lvVal(sm.min, sm.max);
      if (sm.inf) amt *= infMult(sm.inf, unit, t, coeffs);   // v1.11 W08·W09
      // 턴별 감쇠/증폭 (예: 동탁 압도적 권력 — 통솔 탈취량이 매 턴 10% 감소)
      if (sm.turnScale) {
        const steps = Math.max(0, turn - 1);
        if (sm.turnScale.mode === 'mult') amt *= Math.pow(1 + sm.turnScale.perTurn, steps);
        else amt *= Math.max(0, 1 + sm.turnScale.perTurn * steps);
      }
      if (sm.conditionalBonusMult && evalCondition(sm.conditionalBonusMult.condition, { attacker: unit, target: t, self: unit })) {
        amt *= (1 + sm.conditionalBonusMult.mult);
      }
      // 스탯 증감도 지속시간/중첩 상한을 따른다 (예전에는 영구 적용되어 절대 안 풀렸음)
      const dur = sm.duration != null ? sm.duration : (turn === 0 ? 999 : 2);   // v1.11 W04
      const cap = sm.maxStacks != null ? sm.maxStacks : 1;
      const srcId = skill.id + ':stat:' + sm.stat;
      const existing = t.statBuffs.filter(x => x.srcId === srcId);
      // FEAT-014 "최고 속성": 적용 시점에 대상의 무력·지력·통솔·선공 중 가장 높은 능력치
      const sk = sm.stat === '최고속성' ? ['무력', '지력', '통솔', '선공'].reduce((m, k) => ((t.stats[k] || 0) > (t.stats[m] || 0) ? k : m), '무력') : sm.stat;
      if (existing.length >= cap) {
        existing[0].remain = dur;
      } else {
        t.stats[sk] = Math.max(0, (t.stats[sk] || 0) + amt);
        t.statBuffs.push({ stat: sk, value: amt, remain: dur, srcId });
        if (cap > 1) log.push(`${turn}턴:   [${t.name}]의 「${skill.name}」이(가) ${existing.length + 1}스택 중첩됐습니다.`);
        log.push(`${turn}턴:   [${t.name}]의 【${sk}】이(가) ${Math.abs(amt).toFixed(2)}(${(t.stats[sk]||0).toFixed(2)}) ${amt >= 0 ? '증가' : '감소'}했습니다.`);
      }
    });
  });

  // statMods를 먼저 처리(자기 스탯 강화 후 그 스탯으로 데미지 계산하는 전법들 — 하후연 신속기습 등)
  (eff.damage || []).forEach(d => {
    // 지시형 문장("무력이 가장 높은 아군이 적에게 피해를 준다") 대응:
    // d.actor가 있으면 그 아군이 실제 공격자(자신의 스탯으로 계산), 없으면 시전자 본인이 공격자.
    const attacker = d.actor && d.actor !== 'self' ? (selectTargets(unit, [d.actor], allUnits, true)[0] || unit) : unit;
    let targets;
    if (d.target === 'self') {
      targets = [attacker];
    } else if (d.target && resolveSpecial(d.target)) {
      targets = resolveSpecial(d.target);
    } else if (d.target) {
      targets = selectTargets(attacker, [d.target], allUnits);
    } else if (__sharedDmgTargets) {
      // FIX-002: 대상이 따로 적히지 않은 피해 항목은 같은 발동 안에서 첫 대상을 공유한다
      //   ("랜덤 적군 2명에게 책략과 병기 피해", "추가로 …" — v1.12b 는 항목마다 대상을 다시 뽑았다)
      targets = __sharedDmgTargets;
    } else {
      targets = selectTargets(unit, targetCodes, allUnits).filter(t => t.side !== unit.side || statusFlag(unit, 'randomizeTarget'));   // 혼란이면 아군도 맞을 수 있다(FEAT-019)
      if (!targets.length) targets = selectTargets(unit, ['random_enemy_1'], allUnits);
      __sharedDmgTargets = targets;
    }
    if (d.reciprocal) targets = [...targets].sort((a, b) => effStat(b, '선공') - effStat(a, '선공')); // 선공 높은 순으로 순차 교전
    if (d.tag) tags[d.tag] = targets;
    if (d.turnCond && !turnMatches(d.turnCond, turn)) return; // 홀/짝턴·특정턴 조건
    targets.forEach(t => {
      // 광역/다단 전법이 도는 도중 앞선 타격으로 대상이 쓰러지면 그 대상은 건너뛴다.
      // (시체를 계속 때려 로그와 기여도가 부풀려지던 문제)
      if (!t.alive || t.troops <= 0) return;
      if (!attacker.alive) return;           // 시전자가 도중에 쓰러지면 남은 타격도 중단
      if (d.reciprocal && !attacker.alive) return; // 교전 도중 공격자가 먼저 쓰러지면 남은 상대와는 교전하지 않음
      // 조건부 발동: 대상이 특정 상태를 가지고 있어야만 (예: "디버프 보유 시") 발동하는 별도 공격
      if (d.condition && !evalCondition(d.condition, { attacker, target: t, self: unit })) return;
      if (d.chance != null) {
        // FIX-003: "60% 확률로 랜덤 적군 2명에게 … 피해" 는 발동 1회에 한 번만 판정한다
        //   (v1.12b 는 대상·항목마다 따로 굴려 2명 중 1명만 맞는 일이 생겼다). 대상별 판정은 chancePerTarget.
        if (d.chancePerTarget) { if (__rng() >= d.chance) return; }
        else {
          const key = String(d.chance);
          if (!(key in __chanceRolls)) __chanceRolls[key] = __rng() < d.chance;
          if (!__chanceRolls[key]) return;
        }
      }
      let ratio = lvVal(d.min, d.max);
      // 스탯 영향 계수 (statScale): "(추가로 통솔의 영향 받음)" 유형.
      //   중문 커뮤니티 자료가 제시한 모델 — 배율(%) += (시전자 스탯 - 100) x 가중치.
      //   가중치 0.0012(통솔 1당 0.12%p)는 강렬 실측 3표본에 적용했을 때 병력계수 beta가
      //   기존 실측값 0.45에 수렴(0.460~0.466)해서 채택했다. 단 beta와 함께 푼 값이라
      //   독립 검증은 아직 없음 — statScaleWeight 슬라이더로 조정 가능하게 노출한다.
      // 추격 전법 피해 증가 (천군 소탕 등) — 시전 전법이 추격 계열일 때만 곱한다
      if (skill.type === '추격') ratio *= (1 + (unit.mods.추격전법피해 || 0));
      if (d.statScale) {
        const src = effStat(attacker, d.statScale.stat);
        // v1.11 W08: 곱연산 — 기본값 × (1 + (스탯 − 100) × w)
        ratio *= Math.max(0, 1 + (src - 100) * (coeffs.statScaleWeight != null ? coeffs.statScaleWeight : DEFAULT_COEFFS.statScaleWeight));
      }
      if (d.inf && !d.statScale) ratio *= infMult(d.inf, attacker, t, coeffs);
      // 턴 내 누적 감쇠 (turnDecay): "현재 턴에서 다음 <효과>의 피해 계수가 N% 감소".
      //   같은 턴 안에서만 누적되고 다음 턴에 초기화된다 (조운 칠진칠출의 용담).
      if (d.turnDecay) {
        unit._decay = unit._decay || {};
        if (unit._decay.__turn !== turn) unit._decay = { __turn: turn };
        const key = skill.id;
        const n = unit._decay[key] || 0;
        if (n > 0) ratio *= Math.pow(1 - d.turnDecay, n);
        unit._decay[key] = n + 1;
      }
      // 턴별 계수 증감 (turnScale): "매 턴 N% 증가/감소" 유형.
      //   비상한 전략 +10%/턴(누적 증가), 철기병 돌격 -25%/턴(발동 여부와 무관하게 감쇠).
      //   1턴차를 기준(배율 1.0)으로 보고 이후 턴마다 perTurn씩 적용한다.
      if (d.turnScale) {
        const steps = Math.max(0, turn - 1);
        if (d.turnScale.mode === 'mult') ratio *= Math.pow(1 + d.turnScale.perTurn, steps);
        else ratio *= Math.max(0, 1 + d.turnScale.perTurn * steps);
      }
      // 조건부 보너스: 같은 타격인데 조건 충족 시 배율만 더 붙는 경우 (예: 출기불의)
      if (d.conditionalBonusMult && evalCondition(d.conditionalBonusMult.condition, { attacker, target: t, self: unit })) {
        ratio *= (1 + d.conditionalBonusMult.mult);
      }
      // 개수 비례 증폭: 대상의 이상상태 수 / 적 이성 수 등
      if (d.selfStack) {   // FEAT-002: 사마의 매의 응시 "포석" — 발동마다 1(+확률로 1) 쌓이고 1개당 계수 증가
        const ss = d.selfStack;
        attacker._stacks = attacker._stacks || {};
        if (attacker._stacksInv !== __invStack[__invStack.length - 1]) {
          attacker._stacksInv = __invStack[__invStack.length - 1];
          let n = (attacker._stacks[ss.key] || 0) + (ss.gain || 1) + (ss.bonusChance && __rng() < ss.bonusChance ? 1 : 0);
          attacker._stacks[ss.key] = Math.min(n, ss.max || 99);
          // FEAT-013 스택 문턱 회복(사마의〈대략〉): 처음으로 포석 4/8스택이 되면 아군 전체 회복
          const sh = attacker._stackHeal;
          if (sh && sh.key === ss.key) {
            attacker._stackHealDone = attacker._stackHealDone || {};
            sh.thresholds.forEach(th => {
              if (attacker._stackHealDone[th] || attacker._stacks[ss.key] < th) return;
              attacker._stackHealDone[th] = true;
              log.push(`${turn}턴: [${attacker.name}]의 「${ss.key}」이(가) 처음으로 ${th}스택이 되어 금병법 효과로 아군 전체를 회복합니다.`);
              allUnits.filter(a => a.alive && a.troops > 0 && a.side === attacker.side).forEach(a => {
                const { heal: healed } = calcHeal(attacker, a, sh.ratio, coeffs);
                attacker.healDone += healed;
                log.push(`${turn}턴:   [${a.name}]이(가) 병력을 ${healed}(${a.troops}) 회복했습니다.`);
              });
            });
          }
        }
        ratio *= 1 + (ss.per || 0) * attacker._stacks[ss.key];
      }
      // FEAT-004: "직전 턴에 이 전법이 발동하지 않았다면 피해 N% 증가" (만군 멸시)
      if (d.idleBonus && (unit._lastCast || {})[skill.id] !== turn - 1) ratio *= 1 + d.idleBonus;
      if (d.scaleBy) {
        let n = 0;
        if (d.scaleBy.kind === 'targetAbnormal') n = abnormalCount(t);
        else if (d.scaleBy.kind === 'oppositeGender') n = oppositeGenderCount(attacker, allUnits);
        n = Math.min(n, d.scaleBy.cap != null ? d.scaleBy.cap : 99);
        ratio *= (1 + d.scaleBy.per * n);
      }
      // 전법 유형에 따라 받는피해 범주를 구분한다 (추격 / 액티브)
          const tag = skill.type === '추격' ? 'pursuit' : 'active';
      // asBasicAttack: 무쌍의 용사처럼 "전체 적군과 서로 1회의 일반 공격을 진행한다" 유형은
      // 시전자 쪽 타격이 진짜 '일반 공격'이라, 대상마다 추격 전법 판정 기회가 생긴다.
      // (실제 전보: 여포 일반공격 → 원문사극 → 천군소탕 → 상대 맞받아침 → 반격 → 무력대비 보너스)
      const asBasic = !!d.asBasicAttack;
      if (asBasic) { attacker.inBasicPhase = true; attacker._pursuitDoneThisHit = {}; attacker._basicSeq = (attacker._basicSeq || 0) + 1; }
      const { dmg, crit } = dealDamage(attacker, t, ratio, d.dmgType, coeffs, log, allUnits, turn, contrib,
        asBasic, asBasic ? 'basic' : tag);
      if (asBasic) attacker.inBasicPhase = false;
      attacker.dmgDealt += dmg;
      value += dmg;
      const actorNote = attacker !== unit ? ` (${unit.name}의 [${skill.name}]으로 지시됨)` : '';
      log.push(`${turn}턴: [${attacker.name}]이(가) 【${skill.name}】의 「${skill.name}」 효과를 발동합니다.${actorNote}`);
      if (crit) log.push(`${turn}턴:   [${attacker.name}] ${d.dmgType === '병기' ? '회심' : '묘책'} 발동. 피해는 ${Math.round(coeffs.critMult * 100)}%입니다.`);
      log.push(`${turn}턴:   [${t.name}]은(는) [${attacker.name}]의 【${skill.name}】 효과로 병력이 ${dmg}(${t.troops}) 손실됐습니다.`);
      if (d.reciprocal && t.alive) {
        // 무쌍의 용사(여포): "전체 적군과 서로 1회의 일반 공격을 진행한다" — 상대도 맞받아 친다.
        // 단, 맞받아치는 공격은 '반격 계열' 태그라 그 적의 추격 전법을 발동시키지 않는다.
        // (추격 트리거는 자기 행동 턴에 정식으로 개시한 평타에만 붙는다 → isBasic=false로 전달)
        // 반격확률 기반의 '반격'과는 다른 메커니즘이므로 로그에서도 구분해 적는다.
        // 조롱: 맞받아치는 쪽이 조롱 상태면 시전자(무쌍의 용사를 쓴 쪽)가 아니라
        // 자신에게 조롱을 건 무장을 강제로 공격한다. 혼란이 걸려 있으면 무작위 대상.
        let backTarget = attacker;
        const taunt = tauntTargetFor(t, allUnits);
        if (statusFlag(t, 'randomizeTarget')) {
          const foes = allUnits.filter(u => u.alive && u.side !== t.side);
          if (foes.length) backTarget = pick(foes);
          log.push(`${turn}턴: [${t.name}]은(는) 「혼란」 효과로 목표가 무작위화됩니다.`);
        } else if (taunt && taunt.alive) {
          backTarget = taunt;
          log.push(`${turn}턴: [${t.name}]은(는) 「조롱」 효과로 [${taunt.name}]을(를) 강제 공격합니다.`);
        }
        log.push(`${turn}턴: [${t.name}]이(가) [${backTarget.name}]에게 맞받아 일반 공격을 진행합니다.`);
        const back = dealDamage(t, backTarget, 1.0, '병기', coeffs, log, allUnits, turn, contrib, false, 'basic');
        t.dmgDealt += back.dmg;
        if (back.crit) log.push(`${turn}턴:   [${t.name}] 회심 발동. 회심 피해는 ${Math.round(coeffs.critMult * 100)}%입니다.`);
        log.push(`${turn}턴:   [${backTarget.name}]의 병력이 ${back.dmg}(${backTarget.troops}) 손실됐습니다.`);
      }
    });
  });

  (eff.heal || []).forEach(h => {
    if (h.turnCond && !turnMatches(h.turnCond, turn)) return;
    const healer = h.actor && h.actor !== 'self' ? (selectTargets(unit, [h.actor], allUnits, true)[0] || unit) : unit;
    let targets;
    if (h.target === 'self') {
      targets = [healer];
    } else if (h.target) {
      targets = selectTargets(healer, [h.target], allUnits);
    } else {
      // 회복은 반드시 아군 대상. targetCodes에 적군 코드가 섞여 있으면(예: 둔전령은
      // "전체 적군과 아군이 주는 피해 감소" + "전체 아군 회복"이 한 문장에 있어
      // targets가 ['all_enemy','all_ally']로 잡힘) 아군 코드만 골라 써야 한다.
      const allyCodes = targetCodes.filter(c => c.includes('ally') || c === 'self');
      targets = selectTargets(unit, allyCodes.length ? allyCodes : ['lowest_hp_ally'], allUnits);
      targets = targets.filter(t => t.side === unit.side);
      if (!targets.length) targets = selectTargets(unit, ['lowest_hp_ally'], allUnits);
    }
    // afterProcs: "매 턴 최대 N회 발동되며, N회 발동 후 ~" 유형 (주유 기지의 승리).
    // 매 턴 리셋되는 카운터이고, 그 턴에 상한 N회를 모두 채웠을 때만 이 회복이 나간다.
    // 한 턴에 4회를 못 채우면 회복은 발동하지 않는다.
    if (h.afterProcs) {
      unit._procCountTurn = unit._procCountTurn || {};
      const key = skill.id + ':heal';
      if (unit._procCountTurn.__turn !== turn) { unit._procCountTurn = { __turn: turn }; }
      unit._procCountTurn[key] = (unit._procCountTurn[key] || 0) + 1;
      if (unit._procCountTurn[key] !== h.afterProcs) return;
      log.push(`${turn}턴: [${unit.name}]의 【${skill.name}】이(가) 이번 턴 ${h.afterProcs}회를 모두 채워 추가 효과가 발동합니다.`);
    }
    targets.forEach(t => {
      if (!t.alive || t.troops <= 0) return;   // 쓰러진 대상은 회복 불가(부활 없음)
      if (!passChance(h)) return;
      const ratio = lvVal(h.min, h.max);
      const { heal: healed, doubled, healMult, effRatio } = calcHeal(healer, t, ratio, coeffs, h.stat);
      healer.healDone += healed;
      value += healed * 0.6; // 치유 가치는 피해 대비 가중치 낮춰서 기여도 산정
      log.push(`${turn}턴: [${healer.name}]이(가) 【${skill.name}】의 「${skill.name}」 효과를 발동합니다.` +
        `${doubled ? ' [2배 회복 발동]' : ''} (치유율 ${(effRatio*100).toFixed(1)}%, 시전자 지력 ${effStat(healer,'지력').toFixed(2)})`);
      if (healMult < 1) {
        const src = t.statuses.find(s => s.name === '군량 고갈');
        const by = src && src.casterName ? `[${src.casterName}]의 ` : '';
        log.push(`${turn}턴:   [${t.name}]이(가) ${by}「군량 고갈」 효과로 치유 효과 ${(healMult*100).toFixed(0)}%(으)로 감소`);
      }
      log.push(`${turn}턴:   [${t.name}]이(가) 병력을 ${healed}(${t.troops}) 회복했습니다.`);
    });
  });

  (eff.buffs || []).forEach(b => {
    if (b.turnCond && !turnMatches(b.turnCond, turn)) return;
    if (b.chanceAll != null && __rng() >= b.chanceAll) return;   // FEAT-017 효과 전체에 한 번 판정 ("N% 확률로 ~ 2~3명의 …")
    let targets;
    if (b.target === 'self') targets = [unit];
    else if (b.target && resolveSpecial(b.target)) targets = resolveSpecial(b.target);
    else if (b.target) targets = selectTargets(unit, [b.target], allUnits);
    else targets = targetCodes.includes('self') ? [unit] : selectTargets(unit, targetCodes, allUnits);
    if (b.tag) tags[b.tag] = targets;   // FEAT-002
    targets.forEach(t => {
      if (b.condition && !evalCondition(b.condition, { attacker: unit, target: t, self: unit })) return;
      if (!passChance(b)) return;
      let amt = lvVal(b.min, b.max);
      if (b.inf) amt *= infMult(b.inf, unit, t, coeffs);   // v1.11 W08·W09
      if (b.countScale) {
        let count;
        if (b.countScale.statCompare) {
          const cs = b.countScale.statCompare;
          const pool = allUnits.filter(u => u.alive && u.side !== unit.side);
          count = pool.filter(u => (cs.op === '<' ? u.stats[cs.stat] < unit.stats[cs.stat] : u.stats[cs.stat] > unit.stats[cs.stat])).length;
        } else {
          const pool = allUnits.filter(u => u.alive && u.side === (b.countScale.side === 'enemy' ? (unit.side === 'A' ? 'B' : 'A') : unit.side));
          count = pool.filter(u => hasStatus(u, b.countScale.status)).length;
        }
        amt += b.countScale.perCount * count;
      }
      if (b.stat === '확정회심') { // 스탯 누적이 아니라 1회 소모 카운터
        targets.forEach(() => {});
        t.guaranteedCrit = (t.guaranteedCrit || 0) + 1;
        if (b.nonBasicOnly) t.guaranteedCritNonBasicOnly = true;
        return;
      }
      const key = b.stat.replace(/이|가|을|를/g, '');
      const dur = b.duration != null ? b.duration : (turn === 0 ? 999 : 2);   // v1.11 W04: 준비 턴 효과는 전투 종료까지
      const cap = b.maxStacks != null ? b.maxStacks : 1;
      const srcId = skill.id + ':' + key;
      const existing = t.buffs.filter(x => x.srcId === srcId);
      if (existing.length >= cap) {
        // 상한 도달: 가장 오래된 스택의 지속시간만 갱신 (수치는 더 쌓이지 않음)
        existing[0].remain = dur;
      } else {
        // 받는피해 계열의 "감소"는 가산이 아니라 독립 곱연산으로 누적된다.
        //   최종 = 기존 + (1 - 기존) x 신규   (= 1 - (1-기존)(1-신규))
        // 실측 근거: 하후돈이 진형 -6.00% 상태에서 병종 효과를 받자 로그 증분이 2.10%가 아닌
        //   1.97%로 찍혔다(= 0.94 x 2.10). 같은 효과를 감상 0%였던 관우/등애는 2.10% 그대로 받았다.
        //   즉 로그에 표시되는 증분은 "이미 스케일링된 값"이고, 누계 = 기존 + 표시증분이 된다.
        //   (이전에 관우 사례를 근거로 가산이라 판단했으나, 그 사례는 두 모델을 구분하지 못하는
        //    무의미한 표본이었다. 나중에 중문 커뮤니티 자료로도 같은 공식이 확인됨.)
        const IN_DMG_KEYS = ['받는피해', '받는병기피해', '받는책략피해'];
        // v1.12 W51: 피신 확률 증가도 곱 합성 — 신규 × (1 − 기존) (조운 41.02%에 3% → +1.76%)
        if (key === '피신' && amt > 0) amt = amt * (1 - Math.max(0, Math.min(t.mods.피신 || 0, 1)));
        if (IN_DMG_KEYS.includes(key) && amt < 0) {
          const prevRed = -(t.mods[key] || 0);          // 기존 감소율(양수화)
          const scaled = amt * (1 - Math.max(0, Math.min(prevRed, 1)));  // 스케일링된 증분
          amt = scaled;
        }
        t.mods[key] = (t.mods[key] || 0) + amt;
        t.buffs.push({ stat: key, value: amt, remain: dur, srcId });
        // 기본 디버프(주는피해↓·받는피해↑ 등)도 '디버프' 트리거를 발생시킨다.
        // 단 '이상 상태' 트리거(주유 기지의 승리)는 여기서 발동하지 않는다(abnormal:false).
        if (t.side !== unit.side && isBasicDebuff(key, amt)) {
          emitDebuffEvent({ caster: unit, target: t, abnormal: false }, allUnits, coeffs, log, turn, contrib);
        }
        // 실제 게임 전보와 같은 형식: 변화량(누적값) 표기
        const stacks = existing.length + 1;
        const pct = (v) => (v * 100).toFixed(2) + '%';
        log.push(`${turn}턴: [${unit.name}]이(가) 【${skill.name}】의 「${skill.name}」 효과를 발동합니다.`);
        if (cap > 1) log.push(`${turn}턴:   [${t.name}]의 「${skill.name}」이(가) ${stacks}스택 중첩됐습니다.`);
        log.push(`${turn}턴:   [${t.name}]의 【${key}】이(가) ${pct(Math.abs(amt))}(${pct(t.mods[key])}) ${amt >= 0 ? '증가' : '감소'}했습니다.`);
      }
    });
  });

  // 디버프 제거(dispel): "디버프 상태 N가지를 제거" 유형. 제어/비제어 이상상태를 앞에서부터 N개 걷어낸다.
  // (기능성 버프인 방어·피신 등은 디버프가 아니므로 제거 대상에서 제외)
  (eff.dispel || []).forEach(dp => {
    let targets = dp.target === 'self' ? [unit]
      : (resolveSpecial(dp.target) || selectTargets(unit, [dp.target], allUnits));
    targets.forEach(t => {
      let removed = 0;
      for (let i = t.statuses.length - 1; i >= 0 && removed < (dp.count || 1); i--) {
        const nm = t.statuses[i].name;
        if (CONTROL_DEBUFFS.includes(nm) || NON_CONTROL_DEBUFFS.includes(nm)) {
          t.statuses.splice(i, 1);
          removed++;
        }
      }
      if (removed && log) log.push(`${turn}턴:   [${t.name}]의 디버프 ${removed}가지가 제거되었습니다.`);
    });
  });

  (eff.statusEffects || []).forEach(entry => {
    // oneOf: "A 또는 B 중 한 가지를 부여한다" — 둘 다 걸면 과대평가되므로 매 시전 시 하나만 무작위 선택
    if (entry && entry.oneOf) {
      entry = { ...entry, name: pick(entry.oneOf) };
    }
    const se0 = typeof entry === 'string' ? { name: entry } : entry;
    if (se0.turnCond && !turnMatches(se0.turnCond, turn)) return;
    const se = typeof entry === 'string' ? { name: entry } : entry;
    let targets;
    if (se.target === 'self') targets = [unit];
    else if (se.target && resolveSpecial(se.target)) targets = resolveSpecial(se.target);
    else if (se.target) targets = selectTargets(unit, [se.target], allUnits);
    else targets = selectTargets(unit, targetCodes, allUnits);
    // FEAT-015 시전자 지정: "통솔이 가장 높은 우군이 … 조롱한다" (황월영〈기관술〉) — 조롱의 강제 공격 대상이 그 우군
    const caster = se.caster ? (selectTargets(unit, [se.caster], allUnits, true)[0] || unit) : unit;
    targets.forEach(t => {
      if (se.condition && !evalCondition(se.condition, { attacker: unit, target: t, self: unit })) return;
      if (!passChance(se)) return;
      // 용어 시트 24번: 방어는 최대 2스택까지만 보유한다.
      if (se.name === '방어' && t.statuses.filter(s => s.name === '방어').length >= 2) return;
      const already = t.statuses.some(s => s.name === se.name);
      // 지속시간: 전법 데이터에 duration이 있으면 그 값, 없으면 원문에서 "N턴 동안 지속되는 <상태>"를 읽는다.
      // (예전에는 무조건 2턴이었다 — 1턴짜리 제어기가 두 배로 오래 걸리던 문제)
      let dur = se.duration;
      if (dur == null && skill.raw) {
        const m = skill.raw.match(new RegExp('(\\d+)턴[^.]{0,12}지속되는\\s*' + se.name));
        if (m) dur = parseInt(m[1]);
      }
      if (dur == null) dur = 2;
      // 같은 이름의 상태이상은 중첩되지 않는다 (전략판 공통 규칙).
      //   · 지속시간이 더 길면 갱신(Refresh), 짧거나 같으면 무효 처리
      //   예전에는 중복 push라 위협이 3개씩 쌓여 받는피해가 +30%가 되기도 했다.
      // 탈주병은 '상태 부여'가 아니라 즉시 고정 피해다.
      if (se.name === '탈주병') {
        dealDesertionDamage(unit, [t], skill, coeffs, log, turn, contrib);
        return;
      }
      // 정신 회복: 제어 상태가 '걸리지 않는' 게 아니라, 걸리되 효과가 무효화된다.
      //   실제 전보: "[손권]의 「조롱」 효과가 갱신됐습니다" → "[손권]이(가) 정신 회복을(를)
      //   보유하여, 조롱이(가) 잠시 무효화됩니다" — 부여 로그가 먼저 찍힌다.
      //   따라서 statuses에는 넣되 isControlSuppressed()가 효과만 억제한다(제어 7종 전부).
      // FIX-004 방어는 스택형(1회 소모)이라 최대 2스택까지 따로 쌓인다 — 같은 상태 갱신 규칙에서 제외
      const exist = se.name === '방어' ? null : t.statuses.find(s => s.name === se.name);
      if (exist) {
        if (dur > exist.remain) { exist.remain = dur; exist.casterId = caster.id; exist.casterName = caster.name; }
      } else {
        t.statuses.push({ name: se.name, remain: dur, casterId: caster.id, casterName: caster.name, srcSkill: skill.name });
      }
      __T({ e: 'status', src: unit.id, dst: t.id, status: se.name, dur, refreshed: already, skill: skill.id });
      if (CONTROL_DEBUFFS.includes(se.name) && hasStatus(t, '정신 회복')) {
        log.push(`${turn}턴:   [${t.name}]이(가) 정신 회복을(를) 보유하여, ${se.name}이(가) 잠시 무효화됩니다.`);
      }
      log.push(`${turn}턴:   [${t.name}]의 「${se.name}」 효과가 ${already ? '갱신' : '발동'}됐습니다. (${dur}턴 지속)` +
        (unit !== t ? ` — ${unit.name}의 【${skill.name}】` : ''));
      log.push(`${turn}턴:   [${t.name}]이(가) 「${se.name}」 상태를 획득했습니다. (${skill.name})`);
      // '디버프 부여 후' 트리거는 특수 디버프 12종에만 반응한다.
      // (정신 회복 같은 버프에 주유 기지의 승리가 반응하던 문제)
      if (SPECIAL_DEBUFFS.includes(se.name)) {
        emitDebuffEvent({ caster: unit, target: t, abnormal: true, statusName: se.name }, allUnits, coeffs, log, turn, contrib);
      }
    });
  });

  // FEAT-003 효과 부여: "~가 결사 획득: 행동 전 …" 처럼 받은 무장이 직접 발동하는 효과
  (eff.grants || []).forEach(g => {
    let targets;
    if (g.target === 'self') targets = [unit];
    else if (g.target && resolveSpecial(g.target)) targets = resolveSpecial(g.target);
    else targets = selectTargets(unit, [g.target || 'random_ally_n'], allUnits);
    targets.forEach(t => {
      if (!t.alive) return;
      const id = `${skill.id}>${g.key}`;
      const expires = g.duration ? turn + g.duration : 999;
      const exist = t.skills.find(x => x.id === id);
      if (exist) { exist.expires = Math.max(exist.expires, expires); return; }
      t.skills.push({ ...JSON.parse(JSON.stringify(g.skill)), id, name: `${skill.name}·${g.key}`, type: g.skill.type || '패시브', procRate: '100%', raw: g.raw || skill.raw, isManual: true, granted: true, grantedBy: unit.id, expires });
      log.push(`${turn}턴:   [${t.name}]이(가) 「${g.key}」을(를) 획득했습니다. — ${unit.name}의 【${skill.name}】`);
      __T({ e: 'status', src: unit.id, dst: t.id, status: g.key, dur: g.duration || 999, refreshed: false, skill: skill.id });
    });
  });

  // FEAT-007 보호 상태 부여: 보호자가 다음에 행동을 마칠 때까지 우군을 보호한다
  if (eff.guardAllies) {
    const cfg = eff.guardAllies;
    unit._allies = allUnits.filter(a => a.side === unit.side);
    if (cfg.unyielding && !unit._unyielding) unit._unyielding = { decay: cfg.unyielding.decay, n: 0, skill: skill.id };
    unit._allies.forEach(a => {
      if (a === unit || !a.alive) return;
      a._guard = { by: unit, cfg, count: (a._guard && a._guard.by === unit) ? a._guard.count : {}, skill: skill.id };
      log.push(`${turn}턴:   [${a.name}]의 「${skill.name}」 효과가 발동했습니다.`);
      __T({ e: 'status', src: unit.id, dst: a.id, status: skill.name, dur: 1, refreshed: false, skill: skill.id });
    });
    unit._guarding = true;
  }
  if (!(skill.id in contrib)) contrib[skill.id] = 0;
  contrib[skill.id] += value;
  // 발동 횟수도 함께 집계한다 (기여도 0%인데 자주 터지는 버프성 전법을 구분하기 위함)
  contrib.__counts = contrib.__counts || {};
  if (!__noCount) contrib.__counts[skill.id] = (contrib.__counts[skill.id] || 0) + 1;
}

function procRateOf(skill, unit) {
  const m = (skill.procRate || '100%').match(/(\d+(?:\.\d+)?)%/g);
  let base = 1;
  if (m) {
    const nums = m.map(s => parseFloat(s) / 100);
    base = nums[nums.length - 1]; // 만렙 기준 마지막 수치 사용
  }
  // "액티브 전법 발동률 +N%"는 그 무장이 가진 액티브 전법의 실제 발동률에 더해진다.
  // (예전에는 '주는 피해 증가'로 근사하고 있어서 전혀 다른 효과가 되고 있었음)
  if (unit && skill.type === '액티브') {
    base += (unit.mods.액티브발동률 || 0);
  }
  if (unit && skill.type === '추격') base += (unit.mods.추격발동률 || 0);   // FEAT-001 (허저·태사자 금병법)
  if (unit && skill.isUnique && unit.uniqueProcAdd) base += unit.uniqueProcAdd; // FEAT-001 (고유 전법 발동률 +N%)
  return clamp(base, 0, 1);
}
// 감사용: 전투 중 증감(액티브 발동률 버프·디버프)을 빼고 전법 자체의 발동률
function procBaseOf(skill, unit) {
  const m = (skill.procRate || '100%').match(/(\d+(?:\.\d+)?)%/g);
  let base = m ? parseFloat(m[m.length - 1]) / 100 : 1;
  if (unit && skill.isUnique && unit.uniqueProcAdd) base += unit.uniqueProcAdd;
  return clamp(base, 0, 1);
}

// ---------- 턴 처리 ----------
// 반격 (용어 시트 22번): 일반 공격을 받은 후, 일정 확률로 공격자에게 강력한 일반 공격 1회 시전.
// 추격 전법은 발동되지 않으며(dealDamage의 isBasic=false로 보장), 턴마다 최대 5회로 제한된다.
// 기본 확률은 0이고 위기의 결전(skill_65)·고대의 악래(uskill_9) 같은 전법으로만 얻는다.
// 확인 필요: 실전 전보에서 해당 전법이 없는 하후돈도 반격을 시전한 사례가 있어, 위치(전열)나
// 성향(방어) 등에 따른 기본 반격 확률이 별도로 있을 가능성이 있음 — 사용자 확인 대기 중.
// 반격: 적의 '일반공격'을 받았을 때만 발동한다.
// 액티브·추격·지속 피해로는 트리거되지 않으므로, 이 함수는 일반공격/연타 직후에만 호출한다.
// 탈주병: 특수 피해 유형 — 공격자 속성에만 영향을 받는 고정 피해.
//   · 방어(스택) 무시, 피신으로 회피 불가, 허약·감뎀·통솔 전부 무관
//   · 공격자의 증뎀도 적용되지 않음 (중국 커뮤니티 검증)
//   · 관우 실측 공식: 무력 × 2.4 − 330
//   · 정욱은 지력 기반이나 계수 미검증 — 관우와 같은 형태로 근사(desertionCoef/Base로 노출)
function dealDesertionDamage(attacker, targets, skill, coeffs, log, turn, contrib) {
  const stat = skill.desertionStat === '지력' ? '지력' : '무력';
  const a = effStat(attacker, stat);
  const raw = a * (skill.desertionCoef || 2.4) - (skill.desertionBase || 330);
  targets.forEach(t => {
    if (!t.alive || t.troops <= 0) return;
    // FEAT-001: 탈주병 수 증가 (정욱 지용, 관우 오상 — 병력이 자신보다 높은 목표)
    const boost = 1 + (attacker.mods.탈주병증가 || 0) + (t.troops > attacker.troops ? (attacker.mods.탈주병증가_병력우위 || 0) : 0);
    const dmg = Math.max(1, Math.round(raw * boost));
    t.troops = Math.max(0, t.troops - dmg);
    t.wounded = (t.wounded || 0) + Math.round(dmg * DEFAULT_COEFFS.woundedRate);
    if (t.troops <= 0) t.alive = false;
    attacker.dmgDealt += dmg;
    if (contrib) {
      if (!(skill.id in contrib)) contrib[skill.id] = 0;
      contrib[skill.id] += dmg;
      contrib.__counts = contrib.__counts || {};
      contrib.__counts[skill.id] = (contrib.__counts[skill.id] || 0) + 1;
    }
    log.push(`${turn}턴:   [${t.name}]이(가) 「탈주병」을(를) 생성해 병력이 ${dmg}(${t.troops}) 손실됐습니다. (${attacker.name}의 ${stat} ${a.toFixed(1)} 기준 고정 피해)`);
  });
}

// 피해 전달: 특수 피해 유형.
//   "해당 피해는 최초 피해의 영향만 받으며, 여러 번 전달할 수 없다"(인게임 설명)
//   → 방어·받는피해·회심 등을 다시 계산하지 않고, 원래 낸 피해값 × 비율을 그대로 꽂는다.
//   → 전달로 발생한 피해는 추격·반격·연쇄 전달을 유발하지 않는다.
function dealTransferDamage(attacker, targets, srcDamage, ratio, skill, log, turn, contrib) {
  targets.forEach(t => {
    if (!t.alive || t.troops <= 0) return;
    const dmg = Math.max(1, Math.round(srcDamage * ratio));
    t.troops = Math.max(0, t.troops - dmg);
    t.wounded = (t.wounded || 0) + Math.round(dmg * DEFAULT_COEFFS.woundedRate);
    if (t.troops <= 0) t.alive = false;
    attacker.dmgDealt += dmg;
    if (contrib) {
      if (!(skill.id in contrib)) contrib[skill.id] = 0;
      contrib[skill.id] += dmg;
      contrib.__counts = contrib.__counts || {};
      contrib.__counts[skill.id] = (contrib.__counts[skill.id] || 0) + 1;
    }
    log.push(`${turn}턴:   [${t.name}]은(는) [${attacker.name}]의 【${skill.name}】 피해 전달로 병력이 ${dmg}(${t.troops}) 손실됐습니다.`);
  });
}

function maybeCounterAttack(defender, attacker, coeffs, log, allUnits, turn, contrib) {
  if (!defender.alive || !attacker.alive) return;
  const chance = clamp(defender.mods.반격확률 || 0, 0, 1);
  if (chance <= 0) return;
  defender.counterUsedThisTurn = defender.counterUsedThisTurn || 0;
  if (defender.counterUsedThisTurn >= 5) return;
  if (__rng() >= chance) return;
  defender.counterUsedThisTurn++;
  // 반격 피해는 평타 100%가 아니라 반격을 부여한 전법의 고유 배율을 따른다.
  // 위기의 결전·고대의 악래 계열은 대체로 30~60% 선이라 기본 0.5로 두고,
  // 「반격피해」 mod(고대의 악래의 +20% 등)를 곱한다.
  const ratio = (coeffs.counterRatio != null ? coeffs.counterRatio : 0.5)
    * (1 + (defender.mods.반격피해 || 0));
  const { dmg, crit } = dealDamage(defender, attacker, ratio, '병기', coeffs, log, allUnits, turn, contrib, false, 'basic');
  defender.dmgDealt += dmg;
  log.push(`${turn}턴: [${defender.name}]이(가) 반격을 실시합니다.`);
  if (crit) log.push(`${turn}턴:   [${defender.name}] 회심 발동. 회심 피해는 ${Math.round(coeffs.critMult * 100)}%입니다.`);
  log.push(`${turn}턴:   [${attacker.name}]의 병력이 ${dmg}(${attacker.troops}) 손실됐습니다.`);
}

// "전투 시작 시/후" 형태로 1회만 발동하는 지휘·패시브인지 판별.
// 실제 전보에서 이런 전법은 "1번째 턴" 표시보다 앞(포진 단계)에서 찍힌다.
// 반대로 "매 턴 시작 시 / 매 턴 행동 시 / 턴 시작 시" 유형은 매 턴 자기 차례에 찍힌다.
function isBattleStartOnly(skill) {
  if (!skill || (skill.type !== '지휘' && skill.type !== '패시브')) return false;
  if (skill.trigger) return false;              // 조건 발동형은 제외
  const raw = skill.raw || '';
  // 매 턴/행동 시 형태면 턴 안에서 발동한다.
  //   "턴 시작 시", "일반 공격 전/후", "피해를 받으면/받기 직전", "N번째 턴 시작 시" 등도
  //   전부 반복 발동형이다. 예전에는 이 패턴을 못 걸러서 백전불태·전쟁 종식·세금 과징수·
  //   수전의 제왕·백리의성이 포진 단계에서 1회만 켜지고 전투 내내 한 번도 발동하지 않았다.
  if (/매\s*턴|턴\s*시작\s*시|턴\s*종료\s*시|행동\s*시|일반\s*공격\s*(?:전|후)|피해를\s*받(?:은|으면|기)|\d+번째\s*턴/.test(raw)) return false;
  if (/전투\s*시작/.test(raw)) return true;
  // 지휘(指揮)는 타이밍 문구가 없어도 전투 시작 시 1회 적용되는 상시 버프다.
  // (예: 순욱 [인재 등용] — "전체 아군의 묘책과 간파가 증가한다"에 시점 문구가 없어
  //  예전에는 순욱 차례에 발동했는데, 실제 전보에서는 1턴 표시보다 앞서 찍힌다)
  if (skill.type === '지휘') return true;
  return false;
}

// 무장 행동 시작 시점의 상태 스냅샷을 로그에 남긴다.
// 실제 게임에서 로그의 무장 이름을 누르면 뜨는 툴팁과 같은 정보:
//   현재 스탯(버프/디버프 반영값) · 각종 증감률 · 걸려 있는 상태와 남은 턴 · 스택 현황
// "로그에 없으면 반영 안 된 것"이라는 원칙을 검수 가능하게 만드는 장치다.
// 툴팁용 구조화 스냅샷 — 로그의 무장 이름을 눌렀을 때 그 시점 상태를 보여주기 위함.
// battleState.snapshots["<turn>:<이름>"] 에 저장한다.
const SNAP_MODS = [   // 게임 툴팁 표기 순서
  ['주는피해','주는 피해'], ['받는피해','받는 피해'],
  ['주는병기피해','주는 병기 피해'], ['받는병기피해','받는 병기 피해'],
  ['주는책략피해','주는 책략 피해'], ['받는책략피해','받는 책략 피해'],
  ['회유','회유'], ['심리공격','심리 공격'],
  ['주는액티브피해','액티브 전법 피해'], ['받는액티브피해','받는 액티브 전법 피해'],
  ['주는일반공격피해','주는 일반 공격 피해'], ['받는일반공격피해','받는 일반 공격 피해'],
  ['추격전법피해','추격 전법 피해'], ['받는추격피해','받는 추격 전법 피해'],
  ['회심','회심 확률'], ['묘책','묘책 확률'], ['회심피해','회심/묘책 피해'],
  ['연타확률','연타율'], ['반격확률','반격률'], ['반격피해','반격 피해'],
  ['피신','피신'], ['간파','간파'], ['방어관통','방어 관통'],
  ['액티브발동률','액티브 전법 발동률'], ['받는회복량','받는 치유 효과'],
];
function captureSnapshot(unit, battleState, turn) {
  if (!battleState) return;
  battleState.snapshots = battleState.snapshots || {};
  const mods = [];
  SNAP_MODS.forEach(([k, label]) => {
    const v = unit.mods[k] || 0;
    if (Math.abs(v) > 1e-9) mods.push({ label, value: v });
  });
  const sup = isControlSuppressed(unit);
  battleState.snapshots[`${turn}:${unit.name}`] = {
    name: unit.name, side: unit.side, unitType: unit.unitType, position: unit.position,
    stats: { 무력: effStat(unit, '무력'), 지력: effStat(unit, '지력'),
             통솔: effStat(unit, '통솔'), 선공: effStat(unit, '선공') },
    troops: unit.troops, maxTroops: unit.maxTroops,
    mods,
    statuses: unit.statuses.map(s => ({
      name: s.name, remain: s.remain, caster: s.casterName || null,
      // 색상 기준: 그 효과를 준 무장이 어느 편인지 (아군=파랑, 적군=빨강)
      casterSide: s.casterName
        ? ((battleState._sideOf && battleState._sideOf[s.casterName]) || unit.side)
        : unit.side,
      suppressed: sup && CONTROL_DEBUFFS.includes(s.name),
    })),
  };
}

// FEAT-016 전보 툴팁: 그 줄이 찍히는 순간의 무장 상태 (게임 전보에서 무장 이름을 누르면 나오는 툴팁과 같은 항목)
function snapUnit(u, units) {
  const mods = [];
  SNAP_MODS.forEach(([k, label]) => { const v = u.mods[k] || 0; if (Math.abs(v) > 1e-9) mods.push([label, Math.round(v * 10000) / 10000]); });
  const sup = isControlSuppressed(u);
  const wounded = Math.max(0, Math.min(Math.round(u.wounded || 0), u.maxTroops - u.troops));
  const sideOf = name => { const c = units.find(x => x.name === name); return c ? c.side : ''; };
  // 게임 툴팁 끝줄 "[전법], N턴---시전자": 상태이상 + 전법이 건 능력치·증감 효과(같은 전법은 한 줄)
  const effects = u.statuses.map(st => [st.name + (sup && CONTROL_DEBUFFS.includes(st.name) ? '(무효화)' : ''), st.remain, st.casterName || '', sideOf(st.casterName || '')]);
  const seen = new Set(effects.map(e => e[0]));
  [...(u.buffs || []), ...(u.statBuffs || [])].filter(b => b.remain > 0 && b.remain < 90 && b.srcId).forEach(b => {
    const sid = String(b.srcId).split(':')[0];
    let owner = null, sk = null;
    for (const x of units) { const f = x.skills.find(k => k.id === sid); if (f) { owner = x; sk = f; break; } }
    const name = sk ? String(sk.name).replace(/^금병법〈(.*)〉$/, '병법-<$1>') : sid;
    if (seen.has(name)) return;
    seen.add(name);
    effects.push([name, b.remain, owner ? owner.name : '', owner ? owner.side : '']);
  });
  return {
    side: u.side, unitType: u.unitType || '', troops: u.troops, maxTroops: u.maxTroops, wounded, dead: Math.max(0, u.maxTroops - u.troops - wounded), alive: u.alive && u.troops > 0,
    stats: ['무력', '지력', '통솔', '선공'].map(k => Math.round(effStat(u, k) * 100) / 100),
    mods, effects,
  };
}
function snapLine(line, units) {
  const out = {};
  for (const m of String(line).matchAll(/\[([^\]]+)\]/g)) {
    const u = units.find(x => x.name === m[1]);
    if (u && !out[u.name]) out[u.name] = snapUnit(u, units);
  }
  return Object.keys(out).length ? out : null;
}

function logUnitSnapshot(unit, log, turn) {
  const st = ['무력','지력','통솔','선공']
    .map(k => `${k} ${effStat(unit, k).toFixed(2)}`).join(' / ');
  log.push(`${turn}턴:   └[상태] ${unit.name} — 병력 ${unit.troops}/${unit.maxTroops} · ${st}`);

  // 증감률 계열 (0이 아닌 것만)
  const MODS = ['주는피해','받는피해','주는병기피해','받는병기피해','주는책략피해','받는책략피해',
    '받는일반공격피해','받는액티브피해','받는추격피해','추격전법피해','액티브발동률',
    '연타확률','반격확률','반격피해','피신','회유','심리공격','회심','묘책','간파','방어관통',
    '받는회복량','주는회복량','회심피해'];
  const shown = MODS.filter(k => Math.abs(unit.mods[k] || 0) > 1e-9)
    .map(k => `${k} ${(unit.mods[k] * 100).toFixed(2)}%`);
  if (shown.length) log.push(`${turn}턴:     ${shown.join(' · ')}`);

  // 걸려 있는 상태이상/버프 — 남은 턴과 시전자
  if (unit.statuses.length) {
    const sup = isControlSuppressed(unit);
    const ss = unit.statuses.map(s => {
      const off = sup && CONTROL_DEBUFFS.includes(s.name) ? '(무효화)' : '';
      return `${s.name}${off} ${s.remain}턴${s.casterName ? '—' + s.casterName : ''}`;
    });
    log.push(`${turn}턴:     [상태이상] ${ss.join(' · ')}`);
  }

  // 스택형 버프 현황 (원문사극·천군 소탕 등) — 같은 출처별 개수
  const stacks = {};
  const bump = b => {
    if (!b.srcId) return;
    const sid = String(b.srcId).split(':')[0];      // "skill_55:추격전법피해" → "skill_55"
    const s = unit.skills.find(x => x.id === sid);
    const key = (s ? s.name : sid) + '·' + b.stat;
    stacks[key] = (stacks[key] || 0) + 1;
  };
  unit.buffs.forEach(bump);
  unit.statBuffs.forEach(bump);
  const sk = Object.entries(stacks).filter(([, n]) => n > 1).map(([k, n]) => `${k} ${n}스택`);
  if (sk.length) log.push(`${turn}턴:     [스택] ${sk.join(' · ')}`);
}

function applyAlwaysOnOnce(unit, allUnits, coeffs, log, turn, contrib) {
  unit._alwaysOnDone = unit._alwaysOnDone || {};
  unit.skills.forEach(skill => {
    if (!skill.trigger || !skill.alwaysOnBuffs || unit._alwaysOnDone[skill.id]) return;
    unit._alwaysOnDone[skill.id] = true;
    applySkillEffects(unit, { ...skill, effects: { damage: [], heal: [], statMods: [], statusEffects: [], targets: ['self'], buffs: skill.alwaysOnBuffs.map(b => ({ ...b, duration: b.duration != null ? b.duration : 999 })) } },
      allUnits, coeffs, log, turn, contrib);
  });
}
function resolveUnitTurn(unit, allUnits, coeffs, log, turn, contrib, battleState) {
  if (!unit.alive) return;
  __phase = 'action';
  // v1.11 W05: 보유자 행동 기준 지속 감소(잠정)
  if ((coeffs.durationMode || DEFAULT_COEFFS.durationMode) === 'holder') tickHolderBuffs(unit);
  // trigger가 있는 스킬, 또는 특정 턴에만 발동하는 스킬(onlyTurns) 조건 확인 후 고정 슬롯에서 발동
  const byType = t => unit.skills.filter(s => s.type === t && !s.trigger && skillTiming(s) === 'action' && (!s.onlyTurns || s.onlyTurns.includes(turn)));
  // 트리거 전법이 "상시 버프 + 조건부 발동"을 함께 가진 경우(예: 칠진칠출의 피신 확률 증가),
  // 상시 버프까지 트리거에 갇히면 조건 자체가 영원히 성립하지 않는다.
  // alwaysOn으로 표시된 버프는 매 턴 고정 슬롯에서 따로 적용한다.
  // v1.12b W57: 상시 효과는 포진에서 한 번만 적용한다(전투 종료까지 유지).
  //   예전엔 행동마다 다시 적용돼 인게임 전보에 없는 "효과를 발동합니다" 줄이 반복됐다.
  applyAlwaysOnOnce(unit, allUnits, coeffs, log, turn, contrib);
  // 사용자 확인 순서: 선공 → 지휘 → 패시브 → 액티브 → 추격 (기존엔 패시브가 먼저였음)
  ['지휘', '패시브'].forEach(type => {
    byType(type).forEach(skill => {
      if (!unit.alive) return;   // FIX-001
      applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib);
    });
  });
  // FIX-001: 자기 지휘·패시브가 유발한 반격·연계로 전사하면 그 자리에서 행동을 끝낸다.
  //   (v1.12b: 병력 0 인 동탁이 이어서 행동하고 천하평론까지 발동 — 감사 E05 로 발견)
  if (!unit.alive) return;
  // 준비 턴(prepTurns): "1턴 동안 준비 후 ~" 전법은 발동에 성공해도 즉시 터지지 않고
  // 다음 턴에 실행된다. 실제 전보에도 "【방화범】 발동 준비 중입니다"가 별도 줄로 찍힌다.
  // 준비 중 예약분은 위협/침묵의 영향을 받지 않고 예정대로 발동한다(이미 시전을 시작했으므로).
  log.push(`${turn}턴: [${unit.name}] 행동 시작`);
  __phase = 'action';
  __T({ e: 'action', unit: unit.id, statuses: unit.statuses.map(s => s.name) });
  logUnitSnapshot(unit, log, turn);
  captureSnapshot(unit, battleState, turn);
  unit.pendingSkills = unit.pendingSkills || [];
  const readyNow = unit.pendingSkills.filter(p => p.fireOnTurn <= turn);
  unit.pendingSkills = unit.pendingSkills.filter(p => p.fireOnTurn > turn);
  // 준비 중에 공포/침묵(침묵)을 맞으면 예약된 액티브는 발동하지 못하고 무효화된다.
  if (readyNow.length && statusFlag(unit, 'blockActive')) {
    const why = hasStatus(unit, '공포') ? '공포' : (hasStatus(unit, '침묵') ? '침묵' : '침묵');
    readyNow.forEach(p => log.push(`${turn}턴: [${unit.name}]의 준비 중이던 【${p.skill.name}】이(가) 「${why}」 상태로 무효화됐습니다.`));
    readyNow.length = 0;
  }
  readyNow.forEach(p => {
    if (!unit.alive) return;   // FIX-001
    log.push(`${turn}턴: [${unit.name}]이(가) 【${p.skill.name}】 준비를 마치고 발동합니다.`);
    applySkillEffects(unit, p.skill, allUnits, coeffs, log, turn, contrib);
  });

  // 고요한 제압류: 전법 자체가 부과하는 행동 제약 (홀수 턴 평타 금지 / 짝수 턴 액티브 금지)
  let selfBlockBasic = false, selfBlockActive = false;
  unit.skills.forEach(sk => {
    if (!sk.selfRestrict) return;
    if (sk.selfRestrict.oddNoBasic && turn % 2 === 1) selfBlockBasic = true;
    if (sk.selfRestrict.evenNoActive && turn % 2 === 0) selfBlockActive = true;
  });

  // 액티브 전법: 위협/침묵에 막힘
  const blockActive = statusFlag(unit, 'blockActive') || selfBlockActive;
  if (blockActive) {
    const why = selfBlockActive ? '고요한 제압(짝수 턴)'
      : hasStatus(unit, '공포') ? '공포' : '침묵';
    log.push(`${turn}턴: [${unit.name}]은(는) 「${why}」(으)로 액티브 전법을 발동하지 못했습니다.`);
    __T({ e: 'blocked', unit: unit.id, what: '액티브', why });
  } else {
    byType('액티브').forEach(skill => {
      if (!unit.alive) return;   // FIX-001
      const __p = procRateOf(skill, unit);
      const rolled = __rng() < __p;
      __T({ e: 'roll', unit: unit.id, skill: skill.id, kind: '액티브', p: __p, base: procBaseOf(skill, unit), ok: rolled });
      if (!rolled) {
        log.push(`${turn}턴: [${unit.name}]이(가) 확률로 인해 전법【${skill.name}】을(를) 발동하지 못했습니다.`);
      }
      if (rolled) {
        log.push(`${turn}턴: [${unit.name}]이(가) 전법 [${skill.name}]을(를) 발동했습니다.`);
        if (skill.prepTurns) {
          // 발동 판정에는 성공했으나 준비가 필요한 전법 → 예약만 하고 이번 턴엔 효과 없음
          unit.pendingSkills.push({ skill, fireOnTurn: turn + skill.prepTurns });
          log.push(`${turn}턴: [${unit.name}]이(가) 【${skill.name}】 발동 준비 중입니다.`);
        } else {
          applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib);
        }
        // 액티브 재발동 (곽가 [주도면밀]): 액티브 발동에 성공하면 확률로 1회 더 발동.
        // "추가로 전법 준비할 필요 없음" → 준비턴 전법이라도 재발동분은 즉시 터진다.
        const reChance = clamp(unit.mods.액티브재발동 || 0, 0, 1);
        if (reChance > 0 && __rng() < reChance) {
          log.push(`${turn}턴: [${unit.name}]이(가) 【${skill.name}】을(를) 1회 추가 발동합니다. (주도면밀)`);
          applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib);
        }
      }
    });
  }
  // 일반 공격: 위협/무장 해제에 막힘
  let basicAttackTarget = null, basicLanded = false;
  const blockBasic = statusFlag(unit, 'blockBasic') || selfBlockBasic;
  if (blockBasic) {
    const why = selfBlockBasic ? '고요한 제압(홀수 턴)'
      : hasStatus(unit, '공포') ? '공포'
      : hasStatus(unit, '무장 해제') ? '무장 해제' : '위협';
    log.push(`${turn}턴: [${unit.name}]은(는) 「${why}」(으)로 일반 공격을 발동하지 못했습니다.`);
    __T({ e: 'blocked', unit: unit.id, what: '일반 공격', why });
    // 완벽한 사격: 평타 불가 상태였다면 확률로 축력 1스택을 더 얻는다
    const csk = unit.skills.find(s => s.special === 'charge_shot');
    if (csk) {
      unit._charge = unit._charge || 0;
      if (unit._charge < (csk.chargeMax || 10) && __rng() < (csk.chargeChance || 0.5)) {
        unit._charge++;
        log.push(`${turn}턴:   [${unit.name}]의 「축력」이(가) ${unit._charge}스택 중첩됐습니다. (공격 불가 보상)`);
      }
    }
  }
  // FEAT-010 일반 공격 전: 평타를 할 수 있을 때 그 직전에 발동하는 지휘·패시브 (감녕 금병법〈산림탈기〉 등)
  if (unit.alive && !blockBasic) {
    unit.skills.filter(s => (s.type === '지휘' || s.type === '패시브') && !s.trigger && s._timing === 'beforeBasic').forEach(skill => {
      if (!unit.alive || !allUnits.some(u => u.alive && u.side !== unit.side)) return;
      if (skill.chance != null && __rng() >= skill.chance) return;
      __phase = 'beforeBasic';
      applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib);
    });
  }
  if (unit.alive && !blockBasic) {
    const enemies = allUnits.filter(u => u.alive && u.side !== unit.side);
    if (enemies.length) {
      // 조롱: 시전자를 강제 공격 / 혼란: 목표 랜덤화 (진형 가중치 무시)
      const tauntCaster = tauntTargetFor(unit, allUnits);
      const confused = statusFlag(unit, 'randomizeTarget');
      let target;
      // 조롱과 혼란이 동시에 걸리면 '혼란'이 우선한다 (무작위 타겟팅이 강제 타겟을 덮어씀).
      if (confused) {
        target = pick(allUnits.filter(u => u.alive && u !== unit));   // FEAT-019(R-026): 혼란 — 자신을 뺀 적·아군 전체에서 무작위
        log.push(`${turn}턴: [${unit.name}]은(는) 「혼란」 효과로 목표가 무작위화됩니다.`);
      } else if (tauntCaster) {
        target = tauntCaster;
        log.push(`${turn}턴: [${unit.name}]은(는) 「조롱」 효과로 [${target.name}]을(를) 강제 공격합니다.`);
      } else {
        target = unit.forcedTargetId
          ? allUnits.find(u => u.id === unit.forcedTargetId && u.alive) || weightedPickByPosition(enemies)
          : weightedPickByPosition(enemies);
      }
      basicAttackTarget = target;
      unit.inBasicPhase = true;
      unit._basicSeq = (unit._basicSeq || 0) + 1;   // FEAT-003: 평타마다 '일반 공격 후' 판정 1번
      __phase = 'basic';
      __T({ e: 'basic', unit: unit.id, dst: target.id, statuses: unit.statuses.map(s => s.name) });
      unit._pursuitDoneThisHit = {};   // 이번 일반 공격에 대한 추격 판정 기록 초기화
      // ※ 로그 순서 주의: dealDamage 안에서 추격 전법 트리거(원문사극 등)가 즉시 발동하며
      //   자기 로그를 push한다. 따라서 "일반 공격을 발동했습니다" 줄을 dealDamage 호출 뒤에 쓰면
      //   추격 로그가 먼저 찍혀 "일반공격도 안 했는데 추격이 나간다"처럼 보인다(실제 순서는 정상).
      //   → 공격 선언 줄을 먼저 쓰고, 피해량 줄만 나중에 채운다.
      log.push(`${turn}턴: [${unit.name}]이(가) [${target.name}]에게 일반 공격을 발동했습니다.`);
      const basicLineIdx = log.length;
      log.push('');
      const { dmg, crit, evaded } = dealDamage(unit, target, 1.0, '병기', coeffs, log, allUnits, turn, contrib, true, 'basic');
      if (!evaded) basicLanded = true;   // FIX-009(R-027): 피신당한 일반 공격 뒤에는 추격 판정이 없다
      unit.dmgDealt += dmg;
      log[basicLineIdx] = (crit ? `${turn}턴:   [${unit.name}] 회심 발동. 회심 피해는 ${Math.round(coeffs.critMult * 100)}%입니다.\n` : '')
        + `${turn}턴:   [${target.name}]의 병력이 ${dmg}(${target.troops}) 손실됐습니다.`;
      if (log._resnap) log._resnap(basicLineIdx);
      // 피해 전달 전법(일인천군·강습): 방금 낸 일반 공격 피해를 다른 대상에게 그대로 전달
      unit.skills.forEach(sk => {
        const tr = sk.transfer;
        if (!tr) return;
        if (tr.chance != null && __rng() >= tr.chance) return;
        let tgts;
        if (tr.target === 'target_allies') {
          // "공격 목표의 우군 2명" = 방금 때린 대상을 제외한 같은 편 2명
          tgts = allUnits.filter(u => u.alive && u.side === target.side && u !== target).slice(0, tr.count || 2);
        } else {
          tgts = selectTargets(unit, [tr.target || 'random_enemy_1'], allUnits)
            .filter(u => u.alive).slice(0, tr.count || 1);
        }
        if (!tgts.length) return;
        log.push(`${turn}턴: [${unit.name}]이(가) 【${sk.name}】의 피해 전달을 발동합니다.`);
        dealTransferDamage(unit, tgts, dmg, tr.ratio, sk, log, turn, contrib);
      });
      maybeCounterAttack(target, unit, coeffs, log, allUnits, turn, contrib);
      // 완벽한 사격: 평타 성공 후 축력을 전부 소모해 스택 수만큼 추가 평타.
      // 추가 평타도 정식 일반공격이라 추격 전법 판정 기회를 새로 받는다.
      const chg = unit.skills.find(s => s.special === 'charge_shot');
      if (chg && (unit._charge || 0) > 0 && unit.alive) {
        const n = unit._charge;
        unit._charge = 0;
        log.push(`${turn}턴: [${unit.name}]이(가) 「축력」 ${n}스택을 소모해 추가 일반 공격 ${n}회를 시전합니다.`);
        for (let q = 0; q < n && unit.alive; q++) {
          const tg = allUnits.filter(u => u.alive && u.side !== unit.side);
          if (!tg.length) break;
          const t2 = weightedPickByPosition(tg);
          unit._pursuitDoneThisHit = {}; unit._basicSeq = (unit._basicSeq || 0) + 1;
          log.push(`${turn}턴: [${unit.name}]이(가) [${t2.name}]에게 일반 공격을 발동했습니다. (축력)`);
          const idx2 = log.length; log.push('');
          const ex = dealDamage(unit, t2, 1.0, '병기', coeffs, log, allUnits, turn, contrib, true, 'basic');
          if (!ex.evaded) basicLanded = true;
          unit.dmgDealt += ex.dmg;
          log[idx2] = (ex.crit ? `${turn}턴:   [${unit.name}] 회심 발동. 회심 피해는 ${Math.round(coeffs.critMult*100)}%입니다.\n` : '')
            + `${turn}턴:   [${t2.name}]의 병력이 ${ex.dmg}(${t2.troops}) 손실됐습니다.`;
          maybeCounterAttack(t2, unit, coeffs, log, allUnits, turn, contrib);
        }
      }
      // 연타: 확률로 일반 공격 1회 추가. 여러 연타 버프가 겹쳐도 턴당 최대 1회(총 평타 2회)로 제한된다.
      // 연타로 나가는 평타는 '정식 일반공격'이라 추격 전법 판정 기회를 새로 부여한다(반격과 다름).
      if (unit.alive && target.alive && __rng() < clamp(unit.mods.연타확률 || 0, 0, 1)) {
        log.push(`${turn}턴: [${unit.name}]이(가) 연타를 발동했습니다.`);
        const extraIdx = log.length;
        log.push('');
        unit._pursuitDoneThisHit = {}; unit._basicSeq = (unit._basicSeq || 0) + 1;   // 연격도 별도의 일반 공격 → 판정 기회 새로 부여
        const extra = dealDamage(unit, target, 1.0, '병기', coeffs, log, allUnits, turn, contrib, true, 'basic');
        if (!extra.evaded) basicLanded = true;
        unit.dmgDealt += extra.dmg;
        log[extraIdx] = (extra.crit ? `${turn}턴:   [${unit.name}] 회심 발동. 회심 피해는 ${Math.round(coeffs.critMult * 100)}%입니다.\n` : '')
          + `${turn}턴:   [${target.name}]의 병력이 ${extra.dmg}(${target.troops}) 손실됐습니다.`;
      if (log._resnap) log._resnap(extraIdx);
        maybeCounterAttack(target, unit, coeffs, log, allUnits, turn, contrib);
      }
      // 허저 백병 혈전: 아군 전체 일반공격 누적 카운트, 4의 배수마다 팀 전체 방어관통 소폭 증가
      // (스킬 전체를 재실행하지 않고 이 버프만 직접 적용 — 자기강화 효과가 중복 누적되는 것을 방지)
      if (battleState) {
        battleState.basicAttackCount[unit.side] = (battleState.basicAttackCount[unit.side] || 0) + 1;
        if (battleState.basicAttackCount[unit.side] % 4 === 0) {
          const hasHook = allUnits.some(u => u.alive && u.side === unit.side && u.skills.some(sk => sk.special === 'team_basic_attack_stack'));
          if (hasHook) {
            allUnits.filter(u => u.alive && u.side === unit.side).forEach(u => { u.mods.방어관통 = (u.mods.방어관통 || 0) + 0.015; });
            log.push(`${turn}턴: [백병 혈전] 아군 일반공격 누적 ${battleState.basicAttackCount[unit.side]}회 달성 — 전체 방어관통 소폭 증가`);
          }
        }
      }
    }
  }
  __phase = 'pursuit';
  byType('추격').forEach(skill => {
    if (!(unit.alive && !blockBasic && basicAttackTarget && basicLanded)) return;
    const __p = procRateOf(skill, unit);
    const __ok = __rng() < __p;
    __T({ e: 'roll', unit: unit.id, skill: skill.id, kind: '추격', p: __p, base: procBaseOf(skill, unit), ok: __ok });
    if (!__ok) {
      log.push(`${turn}턴: [${unit.name}]이(가) 확률로 인해 전법【${skill.name}】을(를) 발동하지 못했습니다.`);
    } else {
      log.push(`${turn}턴: [${unit.name}]이(가) 전법 [${skill.name}]을(를) 발동했습니다.`);
      // 추격은 방금 일반 공격이 맞춘 대상을 "trigger_defender"로 참조할 수 있게 컨텍스트 전달
      applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib, { attacker: unit, defender: basicAttackTarget });
    }
  });
  unit.inBasicPhase = false; // 일반공격/추격 단계 종료
  // FEAT-008 행동 종료 시: 일반 공격·추격까지 끝난 뒤 발동하는 지휘·패시브 (요새 함락 등, 전보 확인)
  if (unit.alive) {
    __phase = 'actionEnd';
    unit.skills.filter(s => (s.type === '지휘' || s.type === '패시브') && !s.trigger && s._timing === 'actionEnd' && (!s.onlyTurns || s.onlyTurns.includes(turn))).forEach(skill => {
      if (!unit.alive) return;
      applySkillEffects(unit, skill, allUnits, coeffs, log, turn, contrib);
    });
  }
  // FEAT-007: 보호자의 행동이 끝나면 우군의 보호 상태가 사라진다 (전보: 주태 행동 뒤 「불굴의 의지」 효과가 사라졌습니다)
  if (unit._guarding) {
    unit._guarding = false;
    allUnits.forEach(a => { if (a._guard && a._guard.by === unit) { delete a._guard; log.push(`${turn}턴:   [${a.name}]의 보호 상태가 사라졌습니다.`); } });
  }
}

// ---------- 전체 전투 시뮬레이션 (1판) ----------
function simulateOneBattle(armyA, armyB, coeffs) {
  const units = [...armyA, ...armyB];
  const log = [];
  const contrib = {};
  const troopHistory = [];
  const battleState = { basicAttackCount: { A: 0, B: 0 }, snapshots: {}, _sideOf: {} };
  const lineSnaps = [];
  if (__detail) {
    const rawPush = Array.prototype.push;
    log.push = function (...ls) { ls.forEach(l => lineSnaps.push(snapLine(l, units))); return rawPush.apply(this, ls); };
    log._resnap = i => { lineSnaps[i] = snapLine(log[i], units); };
  }
  units.forEach(u => { battleState._sideOf[u.name] = u.side; }); // 허저 백병혈전 등 팀 단위 누적 카운트

  // ---- 준비(포진) 단계 로그 ----
  // 실제 게임 전보처럼, 전투 시작 전에 확정되는 항목을 먼저 보여준다.
  // (공급·건물기술·장비·병법·승급은 계정별 변수라 시뮬 범위 밖 — 그 사실도 함께 표기)
  log.push('0턴: ── 포진 ──');
  log.push('0턴: ※ 엔진 v1.12 — 실측 공식(병기·책략 기초식, 절대 병력 계수, 병종 상성, 부상병 상한 회복, 선공 병합) 적용');
  // 부대 생성 시점에 모아둔 진영/병종 보너스 적용 내역을 그대로 옮겨 적는다
  const seenPrep = new Set();
  units.forEach(u => {
    if (!u.prepLog || seenPrep.has(u.prepLog)) return;
    seenPrep.add(u.prepLog);
    u.prepLog.forEach(l => log.push(l));
  });
  ['A', 'B'].forEach(side => {
    const team = units.filter(u => u.side === side);
    if (!team.length) return;
    log.push(`0턴: [${side === 'A' ? '아군' : '적군'}] 진영 ${team[0].formation ? team[0].formation.name : '-'} / ` +
      team.map(u => `${u.name}(${u.position === 'front' ? '전열' : '후열'})`).join(' · '));
    team.forEach(u => {
      log.push(`0턴:   [${u.name}] 무 ${u.stats.무력.toFixed(0)} 지 ${u.stats.지력.toFixed(0)} ` +
        `통 ${u.stats.통솔.toFixed(0)} 선 ${u.stats.선공.toFixed(0)}` +
        (u.mods.주는피해 ? ` / 주는피해 ${(u.mods.주는피해 * 100).toFixed(2)}%` : '') +
        (u.mods.받는피해 ? ` / 받는피해 ${(u.mods.받는피해 * 100).toFixed(2)}%` : ''));
      // 지휘·패시브 중 전투 시작 시점에 이미 켜져 있는 상시 효과 표기
      u.skills.filter(s => s.type === '지휘' || s.type === '패시브').forEach(s => {
        log.push(`0턴:     └ [${s.name}] (${s.type}) 대기 — ${s.trigger ? '조건 발동형' : '상시/매 턴형'}`);
      });
      if (u.uniqueSkill) {
        log.push(`0턴:     └ [${u.uniqueSkill.name}] (고유·${u.uniqueSkill.type})`);
      }
    });
  });
  // ---- 포진 단계에서 "전투 시작 시" 1회성 지휘/패시브 발동 ----
  // 실제 전보에서도 "1번째 턴" 표시보다 앞에 찍힌다.
  __turn = 0; __phase = 'battleStart';
  __T({ e: 'battle', units: units.map(u => ({ id: u.id, side: u.side, name: u.name, generalId: u.generalId, troops: u.troops, maxTroops: u.maxTroops, skills: u.skills.map(s => s.id) })) });
  // FEAT-018(R-024): 준비 단계 전법은 선공과 무관하게 배치 순(아군 1번 → 적군 1번 → 아군 2번 …)으로 지휘 → 패시브
  const startOrder = units.filter(u => u.alive).sort((a, b) => (slotIdx(a) - slotIdx(b)) || (a.side === 'A' ? -1 : 1));
  ['지휘', '패시브'].forEach(type => {
    startOrder.forEach(u => {
      const all = [...(u.skills || []), u.uniqueSkill].filter(Boolean);
      all.filter(s => s.type === type && skillTiming(s) === 'battleStart').forEach(skill => {
        log.push(`0턴: [${u.name}]이(가) 전법 [${skill.name}]을(를) 발동했습니다.`);
        applySkillEffects(u, skill, units, coeffs, log, 0, contrib);
      });
    });
  });
  // v1.12b: 트리거 전법의 상시 효과(초선차전 심리 공격·칠진칠출 피신 등)도 포진에서 적용
  units.forEach(u => { if (u.alive) applyAlwaysOnOnce(u, units, coeffs, log, 0, contrib); });
  log.push('0턴: ※ 공급·건물기술·장비·병법·전법 승급은 계정별 변수라 시뮬에 반영되지 않습니다.');
  const MAX_TURN = 8;
  let turn = 1;
  let winner = null;

  for (; turn <= MAX_TURN; turn++) {
    __turn = turn; __phase = 'turnStart';
    __T({ e: 'turn' });
    units.forEach(u => { if (u.skills.some(s => s.granted)) u.skills = u.skills.filter(s => !s.granted || s.expires >= turn); });   // FEAT-003
    units.forEach(u => { u.triggerCounts = {}; u.counterUsedThisTurn = 0; }); // 연계 전법·반격 매 턴 상한 초기화
    // 용어 시트 4번: 양측 선공 차이가 70을 초과하면 높은 쪽이 '반드시' 먼저 행동한다.
    // 70 이내의 접전에서는 난수가 개입한다(동률 시 무작위).
    // v1.12 W31: 인게임 규칙 — 아군끼리는 선공 순 고정, 양측 선두끼리 비교해 차례로 병합.
    //   선공 차 70 초과면 확정 선행, 이내면 격차에 비례해 선행 확률 상승(잠정: 0.5 + 격차/140)
    const order = mergeActionOrder(units, coeffs);
    // 실제 게임의 "행동 순서 판단 완료 [판단 결과]"에 대응 — 선공 기준 행동 순서를 매 턴 표기
    log.push(`${turn}턴: ── ${turn}번째 턴 ──`);
    // 짐독: 턴 시작 시 (60% × 스택수)의 책략 피해. 피해는 짐독을 건 이유의 지력으로 계산한다.
    units.forEach(u => {
      if (!u.alive) return;
      const st = u.statuses.filter(s => s.name === '짐독');
      if (!st.length) return;
      const n = Math.min(st.length, 5);
      const caster = units.find(x => x.id === st[0].casterId) || u;
      const res = dealDamage(caster, u, 0.6 * n, '책략', coeffs, log, units, turn, contrib, false, 'dot');
      caster.dmgDealt += res.dmg;
      log.push(`${turn}턴: [${u.name}]이(가) 「짐독」 ${n}스택으로 병력이 ${res.dmg}(${u.troops}) 손실됐습니다.`);
    });

    // 태사자 [완벽한 사격]: 매 턴 시작 시 확률로 축력 1스택 (최대 10)
    units.forEach(u => {
      if (!u.alive) return;
      const sk = u.skills.find(s => s.special === 'charge_shot');
      if (!sk) return;
      u._charge = u._charge || 0;
      if (u._charge < (sk.chargeMax || 10) && __rng() < (sk.chargeChance || 0.5)) {
        u._charge++;
        log.push(`${turn}턴: [${u.name}]의 「축력」이(가) ${u._charge}스택 중첩됐습니다.`);
      }
    });
    // FIX-010: 지속 감소 대상 표시는 각 무장이 행동을 마친 뒤(markHolderSeen)에 한다 — 턴 시작 표시는 폐지
    // v1.11 W02: 턴 시작 단계 — "턴 시작 시" 지휘·패시브를 행동 순서 판정 전에 선공 순으로 처리
    runPhaseSkills('turnStart', units, coeffs, log, turn, contrib);
    units.forEach(u => { if (u.alive) captureSnapshot(u, battleState, turn); });
    log.push(`${turn}턴: 행동 순서 판단 완료 — ` +
      order.map((u, i) => `${i + 1}.${u.name}(선공 ${effStat(u, '선공').toFixed(0)})`).join('  '));
    for (const u of order) {
      resolveUnitTurn(u, units, coeffs, log, turn, contrib, battleState);
      if (u.alive) markHolderSeen(u);
      const aAlive = units.some(x => x.side === 'A' && x.alive);
      const bAlive = units.some(x => x.side === 'B' && x.alive);
      if (!aAlive || !bAlive) { winner = aAlive ? 'A' : (bAlive ? 'B' : 'draw'); break; }
    }
    // v1.11 W02: 턴 종료 단계 — "턴 종료 시" 지휘·패시브
    if (!winner) {
      runPhaseSkills('turnEnd', units, coeffs, log, turn, contrib, order);
      const aAliveE = units.some(x => x.side === 'A' && x.alive);
      const bAliveE = units.some(x => x.side === 'B' && x.alive);
      if (!aAliveE || !bAliveE) winner = aAliveE ? 'A' : (bAliveE ? 'B' : 'draw');
    }
    // 용어 시트 5번: 지휘 전법은 '무장 전사 시 효과를 잃는다'.
    // 시전자가 쓰러지면 그가 건 지휘 전법 버프를 모두 걷어낸다.
    units.forEach(u => {
      if (u.alive) return;
      const cmdIds = new Set((u.skills || []).filter(s => s.type === '지휘').map(s => s.id));
      if (!cmdIds.has(u.uniqueSkill && u.uniqueSkill.type === '지휘' ? u.uniqueSkill.id : null)
          && u.uniqueSkill && u.uniqueSkill.type === '지휘') cmdIds.add(u.uniqueSkill.id);
      if (!cmdIds.size || u._cmdCleared) return;
      u._cmdCleared = true;
      units.forEach(t => {
        let removed = 0;
        // mods/stats에서 해당 버프의 기여분을 되돌린 뒤 목록에서 제거한다
        t.buffs = t.buffs.filter(b => {
          if (!cmdIds.has(String(b.srcId || '').split(':')[0])) return true;
          t.mods[b.stat] = (t.mods[b.stat] || 0) - b.value;
          removed++; return false;
        });
        t.statBuffs = t.statBuffs.filter(b => {
          if (!cmdIds.has(String(b.srcId || '').split(':')[0])) return true;
          t.stats[b.stat] = Math.max(0, (t.stats[b.stat] || 0) - b.value);
          removed++; return false;
        });
        if (removed) log.push(`${turn}턴: [${u.name}] 전사로 지휘 전법 효과 ${removed}건이 [${t.name}]에게서 사라졌습니다.`);
      });
    });

    // 버프/상태 잔여 턴 감소 — 전략판 규칙에 맞춰 '턴 종료'에서 처리한다.
    // (지속피해 정산은 별도 구현 없음: 천하결전의 홍수/화공/폭풍은 스탯 감소형이라 틱 데미지가 없다)
    units.forEach(u => {
      if ((coeffs.durationMode || DEFAULT_COEFFS.durationMode) !== 'holder') {
        u.buffs = u.buffs.filter(b => { b.remain--; if (b.remain <= 0) { u.mods[b.stat] -= b.value; return false; } return true; });
        u.statBuffs = u.statBuffs.filter(b => { b.remain--; if (b.remain <= 0) { u.stats[b.stat] = Math.max(0, u.stats[b.stat] - b.value); return false; } return true; });
      }
      if ((coeffs.durationMode || DEFAULT_COEFFS.durationMode) !== 'holder') u.statuses = u.statuses.filter(s => { s.remain--; return s.remain > 0; });
    });
    const aTroops = units.filter(u => u.side === 'A').reduce((s, u) => s + u.troops, 0);
    const bTroops = units.filter(u => u.side === 'B').reduce((s, u) => s + u.troops, 0);
    troopHistory.push({ turn, A: aTroops, B: bTroops });
    if (winner) break;
  }
  if (!winner) {
    // 8턴 만기: 양쪽 모두 생존 → 무승부(R-009). 재교전 여부는 simulateBattle 이 정한다.
    // 재교전을 쓰지 않는 호출(drawRule 'troops')만 예전처럼 남은 병력으로 승패를 가린다.
    if ((coeffs.drawRule || DEFAULT_COEFFS.drawRule) === 'troops') {
      const aTroops = units.filter(u => u.side === 'A').reduce((s, u) => s + u.troops, 0);
      const bTroops = units.filter(u => u.side === 'B').reduce((s, u) => s + u.troops, 0);
      winner = aTroops === bTroops ? 'draw' : (aTroops > bTroops ? 'A' : 'B');
    } else winner = 'timeout';
  }
  // for 루프가 정상 종료되면 turn이 MAX_TURN+1이 된 상태이므로 실제 진행 턴으로 되돌린다.
  // (8턴 만기 전투가 "9턴"으로 보고되던 버그)
  const actualTurns = Math.min(turn, MAX_TURN);
  __T({ e: 'end', winner, turns: actualTurns });
  return { snapshots: battleState.snapshots, lineSnaps: __detail ? lineSnaps : null,
    winner, turns: actualTurns, log: __detail ? [...log] : log, contrib, troopHistory, units };
}

// ============================================================
// FEAT-005 재교전 (사용자 확인 R-009)
// 8턴이 끝나도 양쪽 모두 살아 있으면 무승부 → 병력이 0이 되어 전사한 무장을 빼고
// 남은 무장끼리 새 전투를 시작한다. 병력·부상병은 이어받고, 진형·진영·인연·전투 시작 효과는
// 남은 무장 기준으로 다시 적용된다(rebuildFn 이 부대를 새로 만든다). 한쪽이 전멸할 때까지 반복,
// coeffs.maxRounds(기본 10)를 넘으면 무승부.
// ============================================================
function simulateBattle(armyA, armyB, coeffs, rebuildFn) {
  let res = simulateOneBattle(armyA, armyB, coeffs);
  if (res.winner !== 'timeout') return { ...res, rounds: 1 };   // lineSnaps 는 res 에 그대로 실림
  const maxRounds = coeffs.maxRounds || DEFAULT_COEFFS.maxRounds;
  const lineSnaps = res.lineSnaps ? [...res.lineSnaps] : null;
  const log = [...res.log], troopHistory = [...res.troopHistory], contrib = { ...res.contrib, __counts: { ...(res.contrib.__counts || {}) } };
  const fallen = res.units.filter(u => !u.alive || u.troops <= 0);
  let turns = res.turns, round = 1;
  while (res.winner === 'timeout' && rebuildFn && round < maxRounds) {
    round++;
    const prev = res.units;
    const aliveIds = side => prev.filter(u => u.side === side && u.alive && u.troops > 0).map(u => u.generalId);
    const [na, nb] = rebuildFn(aliveIds('A'), aliveIds('B'));
    [...na, ...nb].forEach(u => {
      const p = prev.find(x => x.side === u.side && x.generalId === u.generalId);
      if (!p) return;
      u.id = p.id;   // 전보·감사에서 같은 무장을 같은 id 로 본다
      // FIX-005 전보 확인(조황화 무승부 이후): 재교전은 남은 병력이 새 최대 병력이 되고 부상병은 넘어가지 않는다
      u.troops = p.troops; u.maxTroops = p.troops; u.wounded = 0;
      u.dmgDealt = p.dmgDealt; u.healDone = p.healDone;
    });
    const offset = turns;
    if (lineSnaps) lineSnaps.push(null);
    log.push(`${offset}턴: ── 8턴 무승부 → ${round}차 교전 (생존 무장끼리 다시 전투: ` +
      `${na.map(u => u.name).join('·')} vs ${nb.map(u => u.name).join('·')}) ──`);
    __turnOffset = offset;
    try { res = simulateOneBattle(na, nb, coeffs); } finally { __turnOffset = 0; }
    // 전보 턴 번호를 앞 교전 뒤에 잇는다 (2차 교전 1턴 = ${offset + 1}턴)
    res.log.forEach(l => log.push(l.replace(/^(\d+)턴:/, (m, n) => `${+n + offset}턴:`)));
    if (lineSnaps) lineSnaps.push(...(res.lineSnaps || res.log.map(() => null)));
    res.troopHistory.forEach(p => troopHistory.push({ ...p, turn: p.turn + offset }));
    Object.entries(res.contrib).forEach(([k, v]) => {
      if (k === '__counts') Object.entries(v).forEach(([sk, n]) => { contrib.__counts[sk] = (contrib.__counts[sk] || 0) + n; });
      else contrib[k] = (contrib[k] || 0) + v;
    });
    fallen.push(...res.units.filter(u => !u.alive || u.troops <= 0));
    turns += res.turns;
  }
  const winner = res.winner === 'timeout' ? 'draw' : res.winner;
  if (res.winner === 'timeout') { log.push(`${turns}턴: ── ${round}차 교전까지 결판이 나지 않아 무승부 ──`); if (lineSnaps) lineSnaps.push(null); }
  const units = [...res.units.filter(u => u.alive && u.troops > 0), ...fallen.filter((u, i, arr) => arr.findIndex(x => x.side === u.side && x.generalId === u.generalId) === i)];
  return { snapshots: res.snapshots, lineSnaps, winner, turns, log, contrib, troopHistory, units, rounds: round };
}

// ============================================================
// 몬테카를로 러너 + 분석 리포트
// ============================================================

function firstNTurnSkillFlags(log, mySide, myUnitNames, N) {
  // "이 스킬이 N턴 이내에 발동했는가" 플래그 집합 (승패 갈림 요인 분석용, 원인계만 사용)
  const flags = new Set();
  for (const line of log) {
    const m = line.match(/^(\d+)턴: (\S+)의 \[(.+?)\]/);
    if (!m) continue;
    const turn = parseInt(m[1]);
    const caster = m[2];
    const skillName = m[3];
    if (turn <= N && myUnitNames.has(caster)) {
      flags.add(skillName);
    }
  }
  return flags;
}

function buildArmyFn(baseArmyA, baseArmyB, cloneFn) {
  return () => [cloneFn(baseArmyA, 'A'), cloneFn(baseArmyB, 'B')];
}

function runMonteCarlo(freshArmyPairFn, coeffs, runs, rebuildFn) {
  const results = [];
  const skillContribA = {}; // skillId -> total value (아군)
  const procCountA = {}; const procCountB = {}; // skillId -> 총 발동 횟수
  const skillContribB = {}; // skillId -> total value (적군)
  const skillNameOfId = {};
  const troopCurvesWin = []; // per-run troopHistory when A wins
  const troopCurvesLose = [];
  const earlySkillFlagsWin = []; // Set per run when A wins
  const earlySkillFlagsLose = [];
  let winA = 0, winB = 0, draw = 0, turnSum = 0, roundSum = 0;

  for (let i = 0; i < runs; i++) {
    const [armyA, armyB] = freshArmyPairFn();
    const myUnitNames = new Set(armyA.map(u => u.name));
    const res = simulateBattle(armyA, armyB, coeffs, rebuildFn);
    results.push(res);
    roundSum += res.rounds || 1;
    turnSum += res.turns;
    if (res.winner === 'A') winA++; else if (res.winner === 'B') winB++; else draw++;

    // 전법 기여도: 아군(A)·적군(B)을 각각 집계해 좌우로 비교할 수 있게 한다
    armyA.forEach(u => { u.skills.forEach(s => { skillNameOfId[s.id] = s.name; }); });
    armyB.forEach(u => { u.skills.forEach(s => { skillNameOfId[s.id] = s.name; }); });
    const counts = res.contrib.__counts || {};
    Object.entries(counts).forEach(([sid, n]) => {
      if (armyA.some(u => u.skills.some(s => s.id === sid))) procCountA[sid] = (procCountA[sid] || 0) + n;
      else if (armyB.some(u => u.skills.some(s => s.id === sid))) procCountB[sid] = (procCountB[sid] || 0) + n;
    });
    Object.entries(res.contrib).forEach(([skillId, val]) => {
      if (skillId === '__counts') return;
      const belongsToA = armyA.some(u => u.skills.some(s => s.id === skillId));
      const belongsToB = armyB.some(u => u.skills.some(s => s.id === skillId));
      if (belongsToA) skillContribA[skillId] = (skillContribA[skillId] || 0) + val;
      // 양쪽이 같은 전법을 들고 있으면 A 우선(중복 가산 방지)
      else if (belongsToB) skillContribB[skillId] = (skillContribB[skillId] || 0) + val;
    });

    const flags = firstNTurnSkillFlags(res.log, 'A', myUnitNames, 3);
    if (res.winner === 'A') {
      troopCurvesWin.push(res.troopHistory);
      earlySkillFlagsWin.push(flags);
    } else if (res.winner === 'B') {
      troopCurvesLose.push(res.troopHistory);
      earlySkillFlagsLose.push(flags);
    }
  }

  // 전법 기여도 정규화
  const totalContrib = Object.values(skillContribA).reduce((a, b) => a + b, 0) || 1;
  const totalContribB = Object.values(skillContribB).reduce((a, b) => a + b, 0) || 1;
  const contributionB = Object.entries(skillContribB)
    .map(([id, val]) => ({ id, name: skillNameOfId[id] || id, value: val, pct: val / totalContribB,
      procs: procCountB[id] || 0, procsPerRun: (procCountB[id] || 0) / runs }))
    .sort((a, b) => b.value - a.value);
  const contribution = Object.entries(skillContribA)
    .map(([id, val]) => ({ id, name: skillNameOfId[id] || id, value: val, pct: val / totalContrib,
      procs: procCountA[id] || 0, procsPerRun: (procCountA[id] || 0) / runs }))
    .sort((a, b) => b.value - a.value);

  // 승패 갈림 요인: win-set 발동률 - lose-set 발동률 (원인계만, 델타 큰 순)
  const allSkillNames = new Set();
  earlySkillFlagsWin.forEach(f => f.forEach(n => allSkillNames.add(n)));
  earlySkillFlagsLose.forEach(f => f.forEach(n => allSkillNames.add(n)));
  const decisiveFactors = [...allSkillNames].map(name => {
    const winRate = earlySkillFlagsWin.length ? earlySkillFlagsWin.filter(f => f.has(name)).length / earlySkillFlagsWin.length : 0;
    const loseRate = earlySkillFlagsLose.length ? earlySkillFlagsLose.filter(f => f.has(name)).length / earlySkillFlagsLose.length : 0;
    return { name, winRate, loseRate, delta: winRate - loseRate };
  }).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 8);

  // 결정적 턴: 승리군 평균 병력차 vs 패배군 평균 병력차 곡선에서 갭 최대 턴
  function avgCurve(curves) {
    const byTurn = {};
    curves.forEach(c => c.forEach(p => {
      if (!byTurn[p.turn]) byTurn[p.turn] = { A: 0, B: 0, n: 0 };
      byTurn[p.turn].A += p.A; byTurn[p.turn].B += p.B; byTurn[p.turn].n++;
    }));
    return Object.entries(byTurn).map(([turn, v]) => ({ turn: +turn, A: v.A / v.n, B: v.B / v.n, gap: (v.A - v.B) / v.n }))
      .sort((a, b) => a.turn - b.turn);
  }
  const winCurve = avgCurve(troopCurvesWin);
  let decisiveTurn = null, maxGapDelta = -Infinity;
  winCurve.forEach(p => { if (p.gap > maxGapDelta) { maxGapDelta = p.gap; decisiveTurn = p.turn; } });

  return {
    runs, winA, winB, draw,
    winRateA: winA / runs, winRateB: winB / runs,
    avgTurns: turnSum / runs,
    avgRounds: roundSum / runs,
    contribution,
    contributionB,
    decisiveFactors,
    decisiveTurn,
    troopCurveWin: winCurve,
    troopCurveAll: avgCurve([...troopCurvesWin, ...troopCurvesLose]),
    results,
  };
}

// ---------- 상대 덱 프로파일 & 카운터 추천 ----------
const COUNTER_KEYWORDS = [
  { tag: '치유 감소/차단', match: /치유|회복/, recTags: [/치유.*감소|회복.*감소|회복.*무효|디버프/] },
  { tag: '군중 이상상태 다수', match: /군량 고갈|공포|폭풍|위협|무장 해제|침묵|혼란|허약|화공|홍수/, recTags: [/정신 회복|이상 상태.*제거|디버프.*제거/] },
  { tag: '단일 버스트(책략)', match: /책략 피해/, recTags: [/받는.*피해.*감소|방어|간파.*감소/] },
  { tag: '단일 버스트(병기)', match: /병기 피해/, recTags: [/받는.*피해.*감소|방어|회유/] },
  { tag: '선공/속도 의존', match: /선공/, recTags: [/선공.*증가|선공.*포인트/] },
  { tag: '광역기 의존', match: /전체 적군/, recTags: [/받는.*피해.*감소|방어|치유/] },
];

function profileDeck(unitSkillTexts) {
  const joined = unitSkillTexts.join(' ');
  const dmgPhys = (joined.match(/병기 피해/g) || []).length;
  const dmgMagic = (joined.match(/책략 피해/g) || []).length;
  const healCount = (joined.match(/치유|회복/g) || []).length;
  const tags = COUNTER_KEYWORDS.filter(k => k.match.test(joined));
  return { dmgPhys, dmgMagic, healCount, tags, physRatio: dmgPhys / Math.max(1, dmgPhys + dmgMagic) };
}

function recommendCounters(opponentUnitSkillTexts, myUnusedSkills) {
  const profile = profileDeck(opponentUnitSkillTexts);
  const recs = [];
  profile.tags.forEach(tagInfo => {
    myUnusedSkills.forEach(skill => {
      const raw = skill.raw || '';
      if (tagInfo.recTags.some(re => re.test(raw))) {
        recs.push({ skill: skill.name, reason: `상대 특징: ${tagInfo.tag} → 대응 전법`, raw: skill.raw });
      }
    });
  });
  // 중복 제거
  const seen = new Set();
  const uniq = recs.filter(r => { if (seen.has(r.skill)) return false; seen.add(r.skill); return true; });
  return { profile, recommendations: uniq.slice(0, 6) };
}

// ---------- 인연(부대 시너지) 적용 ----------
// 엑셀 인연 탭 원본 데이터 기반. 부대 내 무장 이름 목록을 보고 조건(N명 포함)을
// 만족하는 인연을 찾아, 파싱 가능한 것만 전투 시작 시 영구 버프/스탯으로 적용한다.
// (조건부/트리거형 인연은 시뮬레이션에는 반영하지 않고 UI 표시용으로만 남겨둠 — bonds_parsed.json의 simulatable 플래그 참고)
function findActiveBonds(unitNames, bondCatalog) {
  return bondCatalog.filter(b => {
    const count = b.membersInRoster.filter(n => unitNames.includes(n)).length;
    return count >= b.required;
  });
}
// 진형 특성 적용 — 진형은 부대 전체가 공유하되, 효과는 전열/후열 배치에 따라 다르게 걸린다.
// (기존에는 hitRate만 쓰고 특성 텍스트는 무시하고 있었음)
function applyFormationEffects(units, log) {
  const announced = new Set();
  units.forEach(u => {
    const f = u.formation;
    if (!f || !f.effects) return;
    if (log && !announced.has(f.name + u.side)) {
      announced.add(f.name + u.side);
      log.push(`0턴: [${u.name}] 부대에서 【진형-${f.name}】 강화 효과를 획득했습니다.`);
    }
    const row = u.position === 'back' ? 'back' : 'front'; // mid는 전열 취급
    f.effects.forEach(e => {
      if (e.row !== row) return;
      if (e.mod) {
        u.mods[e.mod] = (u.mods[e.mod] || 0) + e.value;
        if (log) log.push(`0턴:   [${u.name}]의 【${e.mod}】이(가) ${(Math.abs(e.value)*100).toFixed(2)}%(${(u.mods[e.mod]*100).toFixed(2)}%) ${e.value>=0?'증가':'감소'}했습니다.`);
      }
      if (e.stat) {
        u.stats[e.stat] = Math.max(0, (u.stats[e.stat] || 0) + e.value);
        if (log) log.push(`0턴:   [${u.name}]의 【${e.stat}】이(가) ${Math.abs(e.value).toFixed(2)}(${u.stats[e.stat].toFixed(2)}) ${e.value>=0?'증가':'감소'}했습니다.`);
      }
    });
  });
}

// 손권 [강동 호거]: 전투 시작 시점에 "자신이 보유한 액티브/비액티브 전법 수"를 세어
// 그 수만큼 아군 전체를 강화한다. 전법 교체는 주성에서만 가능하므로 전투 중에는 고정값.
function applyLoadoutSynergies(units) {
  units.forEach(u => {
    const hook = u.skills.find(s => s.special === 'loadout_count_buff');
    if (!hook) return;
    // "학습한" 전법만 센다 — 무장 고유전법(강동 호거 자신 포함)은 제외. 항상 합계 2개.
    const learned = u.skills.filter(s => !s.isUnique);
    const activeN = learned.filter(s => s.type === '액티브').length;
    const otherN = learned.filter(s => s.type !== '액티브').length;
    const allies = units.filter(x => x.side === u.side);
    allies.forEach(a => {
      a.mods.액티브발동률 = (a.mods.액티브발동률 || 0) + 0.07 * activeN;
      a.mods.받는병기피해 = (a.mods.받는병기피해 || 0) - 0.05 * activeN;
      a.mods.연타확률 = (a.mods.연타확률 || 0) + 0.28 * otherN;
      a.mods.받는책략피해 = (a.mods.받는책략피해 || 0) - 0.05 * otherN;
    });
  });
}

// 진영(국가)·병종 조합 보너스 — 엑셀 용어탭 '조합' 항목 근거로 신규 추가.
// 국가: 힛파 스프레드시트에 없던 항목이라 중국 커뮤니티 정보로 교차검증함 —
//   "동일 국가 3명이면 3명 전원이 전속성 +10%, 2명(+1명 다른국가)이면 3명 전원이 +5%"
//   즉 매칭 안 된 세 번째 무장도 함께 버프를 받는 "팀 단위" 보너스임 (개별 무장 버프 아님).
// 병종: 용어탭에 정확한 수치가 있으나 "팀 전체 적용"인지 "해당 병종 무장에만 적용"인지는
//   확인된 자료가 없어 병종 무장 본인에게만 적용하는 쪽으로 우선 구현함 (불확실 — 검증 필요).
function applyTeamCompositionBonuses(units, log, opts) {
  const sides = [...new Set(units.map(u => u.side))];
  sides.forEach(side => {
    const teamUnits = units.filter(u => u.side === side);
    // --- 진영(국가) 보너스: 팀 전체에 적용 ---
    const countryCounts = {};
    teamUnits.forEach(u => { countryCounts[u.country] = (countryCounts[u.country] || 0) + 1; });
    let topCountry = null, topCount = 0;
    Object.entries(countryCounts).forEach(([c, n]) => { if (n > topCount) { topCount = n; topCountry = c; } });
    // FEAT-001: "국가 진영 보너스를 활성화하지 않았으면 진영 보너스-촉이 100% 적용" (유비 국지한서, 원소 세가)
    const override = teamUnits.find(u => u._factionOverride);
    if (topCount < 2 && override) { topCount = 3; topCountry = override._factionOverride; }
    if (topCount >= 2) {
      const pct = topCount >= 3 ? 0.10 : 0.05;
      if (log) log.push(`0턴: [${teamUnits[0].name}] 부대에서 【${topCountry}】 강화 효과를 획득하여, 속성이 ${(pct*100).toFixed(0)}% 증가했습니다.`);
      teamUnits.forEach(u => {
        ['무력', '지력', '통솔', '선공'].forEach(stat => {
          const before = u.stats[stat];
          u.stats[stat] = before * (1 + pct);
          if (log) log.push(`0턴:   [${u.name}]의 【${stat}】이(가) ${(u.stats[stat]-before).toFixed(2)}(${u.stats[stat].toFixed(2)}) 증가했습니다.`);
        });
      });
    }
    // --- 병종 보너스: 실측 전보 확인 — "[하후돈] 부대에서 병종 강화 효과를 획득했습니다"로
    // 부대 전원(병종이 다른 무장 포함)에게 동일하게 적용된다. 국가 보너스와 같은 팀 단위 규칙.
    // 실측값(기병 3명): 주는피해 +1.40%, 받는피해 -2.10%. 나머지 병종은 같은 비율(엑셀값 ×0.7)로 추정.
    const typeCounts = {};
    teamUnits.forEach(u => { typeCounts[u.unitType] = (typeCounts[u.unitType] || 0) + 1; });
    const UNIT_TYPE_RULES = {
      '방패병': { 2: { 받는피해: -0.0245 }, 3: { 받는피해: -0.035 } },
      '궁병': { 2: { 주는피해: 0.0245 }, 3: { 주는피해: 0.035 } },
      '창병': { 2: { 주는피해: 0.0147, 받는피해: -0.0098 }, 3: { 주는피해: 0.021, 받는피해: -0.014 } },
      '기병': { 2: { 주는피해: 0.0098, 받는피해: -0.0147 }, 3: { 주는피해: 0.014, 받는피해: -0.021 } },
    };
    let topType = null, topTypeN = 0;
    Object.entries(typeCounts).forEach(([t, n]) => { if (n > topTypeN) { topTypeN = n; topType = t; } });
    const rule = opts && opts.troopEffects ? UNIT_TYPE_RULES[topType] : null;   // R-015: 병종 강화 제외가 기본
    if (rule && topTypeN >= 2) {
      const tier = topTypeN >= 3 ? rule[3] : rule[2];
      if (log) log.push(`0턴: [${teamUnits[0].name}] 부대에서 병종 강화 효과를 획득했습니다. (${topType} ${topTypeN}명)`);
      teamUnits.forEach(u => {
        Object.entries(tier).forEach(([mod, val]) => {
          u.mods[mod] = (u.mods[mod] || 0) + val;
          if (log) log.push(`0턴:   [${u.name}]의 【${mod}】이(가) ${(Math.abs(val)*100).toFixed(2)}%(${((u.mods[mod])*100).toFixed(2)}%) ${val>=0?'증가':'감소'}했습니다.`);
        });
      });
    }
  });
}

function applyBondBonuses(units, bondCatalog, log) {
  const names = units.map(u => u.name);
  const active = findActiveBonds(names, bondCatalog);
  active.forEach(b => {
    if (!b.simulatable) return;
    const memberCount = b.membersInRoster.filter(n => names.includes(n)).length;
    const targets = units.filter(u => b.membersInRoster.includes(u.name));
    if (log && targets.length) {
      log.push(`0턴: 【인연-${b.name}】 발동 (${targets.map(u => u.name).join(' · ')}) — ${b.effect}`);
    }
    units.forEach(u => {
      if (!b.membersInRoster.includes(u.name)) return;
      (b.parsed.buffs || []).forEach(buff => {
        u.mods[buff.stat] = (u.mods[buff.stat] || 0) + buff.value;
        if (log) log.push(`0턴:   [${u.name}]의 【${buff.stat}】이(가) ${(Math.abs(buff.value)*100).toFixed(2)}%(${(u.mods[buff.stat]*100).toFixed(2)}%) ${buff.value>=0?'증가':'감소'}했습니다.`);
      });
      (b.parsed.statMods || []).forEach(sm => {
        u.stats[sm.stat] = Math.max(0, (u.stats[sm.stat] || 0) + sm.value);
        if (log) log.push(`0턴:   [${u.name}]의 【${sm.stat}】이(가) ${Math.abs(sm.value).toFixed(2)}(${u.stats[sm.stat].toFixed(2)}) ${sm.value>=0?'증가':'감소'}했습니다.`);
      });
      (b.parsed.pctStatMods || []).forEach(sm => {
        const before = u.stats[sm.stat];
        u.stats[sm.stat] = Math.max(0, before * (1 + sm.pct));
        if (log) log.push(`0턴:   [${u.name}]의 【${sm.stat}】이(가) ${(u.stats[sm.stat]-before).toFixed(2)}(${u.stats[sm.stat].toFixed(2)}) 증가했습니다.`);
      });
      if (b.parsed.highestStatBoost) {
        const stats = ['무력', '지력', '통솔', '선공'];
        const top = stats.reduce((a, c) => (u.stats[c] > u.stats[a] ? c : a), stats[0]);
        u.stats[top] += b.parsed.highestStatBoost;
      }
      if (b.parsed.perMemberScale) {
        const amt = b.parsed.perMemberScale.perCount * memberCount;
        b.parsed.perMemberScale.stats.forEach(stat => { u.mods[stat] = (u.mods[stat] || 0) + amt; });
      }
    });
  });
  return active;
}

return {
  ENGINE_FIXES,
  setRng: (f) => { __rng = f; },
  setTrace: (f) => { __traceFn = f; },
  setDetail: (v) => { __detail = !!v; },
  setSkillLevel: (lv) => { SKILL_LEVEL = lv; },
  skillTiming, effStat, hasStatus, selectTargets, mergeActionOrder, calcDamage, calcHeal,
  tickHolderBuffs, markHolderSeen,
  DEFAULT_COEFFS, buildUnit, simulateOneBattle, simulateBattle, procRateOf,
  getDebugDamageLog: () => DEBUG_DAMAGE_LOG,
  setDebugDamageLog: (v) => { DEBUG_DAMAGE_LOG = !!v; },
  runMonteCarlo, profileDeck, recommendCounters, findActiveBonds, applyBondBonuses,
  applyFormationEffects, applyLoadoutSynergies, applyTeamCompositionBonuses,
};


}
