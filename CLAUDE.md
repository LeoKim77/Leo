# 삼국지 천하결전 무한무투 — 작업 안내

삼국지 천하결전 덱 전투 시뮬레이터. 목표는 **실제 게임과 가장 가까운 전투 재현**이다.
시즌은 약 2개월마다 바뀌고 무장·고유 전법·전법이 계속 추가된다. 사용자는 공유 구글 시트 주소나
인게임 녹화·캡처를 올리고, Claude 가 데이터·엔진·게시판·배포를 갱신한다.

## 사이트의 목적 (사용자 지정 — 잊지 말 것)
1. **덱 실험**: 사용자가 구상한 덱을 바로 넣어 돌려 보는 시뮬
2. **최상의 덱 자동 추천**: 사용자가 가진 무장·전법으로 이번 시즌 최상의 덱을 자동으로 뽑는 기능

모든 작업(엔진 정확도·검증 녹화·데이터 갱신)은 이 두 기능을 더 정확하게 만들기 위한 것이다.

## 작업 순서 (2026-10-05 사용자 지정)
**기획 플랫폼 → 시뮬.** 전투에 필요한 모든 요소(능력치·턴·행동 순서·전법 형태·병기/책략·버프/디버프·상태·진형·금병법·계수)의 규정은
기획 플랫폼(`data/design/` — categories·spec·posts, 페이지 `pnpm build:design`, `site.json` designUrl)이 정본이다.
대화에서 결정 → MCP `design_resolve`·`design_spec_update`·`design_post` 로 기록 → 시뮬 엔진은 그 규정만 구현(커밋·게시판에 규정 번호) → 두 사이트 재배포.
애매한 것은 확정하지 말고 질문·검증요청 게시글로 올리고 사용자에게 묻는다. 잠정 규정은 잠정값으로 돌리고 시뮬 결과에 표시한다.
시뮬 사이트(artifactUrl)에는 시뮬레이션·덱 추천·보유·티어덱만 둔다. 도감·감사·변경 기록은 설계서에 있다.

## 원칙
- 한국판 용어만 쓴다 (병기/책략/피신/묘책/금병법). 해외 표기는 `data/common/term-map.json` 으로 바꾼다.
- 게임 규칙의 근거는 사용자 확인(`data/common/confirmed-rules.json`, R-xxx)과 한국판 원문이다. 추측으로 확정하지 않는다.
- 근사로 처리한 해석은 반드시 `data/verification/` 검증 대기 목록에 남긴다(R-007). 시뮬 결과에도 근사 효과가 표시된다.
- 모든 변경은 업데이트 게시판(`data/changelog/*.json`)에 날짜·시즌·분류·**변경 파일**과 함께 기록한다.
- 엔진 버그를 고치면 `ENGINE_FIXES`(core.js)·게시판·테스트에 남긴다. `core-v1.12b.js` 는 원본 동등성 검증용 고정본이라 수정하지 않는다.

## 구조
- **전법 = 함수 파일**: `packages/engine/src/skills/<id>.ts` (전법·고유 전법 194개). `def`(발동 시점·트리거·대상·효과 항목) + `clauses`(한국판 원문 절별 구현 상태) + `run(c)`(공용 부품을 원문 순서대로 호출). **파일이 정본**이다 — 전법 수정·신규 전법은 이 파일을 고치거나 만든다. `data/engine/skills.json`·`overrides.json`·`authored.json` 은 파일을 처음 만들 때 쓰는 원천(`pnpm gen:skills` 는 없는 파일만 만든다, `--force <id>` 는 원천으로 덮어씀). 손본 파일은 `revised` 에 날짜·사유를 남긴다.
- **금병법 = 함수 파일**: `packages/engine/src/manuals/<id>.ts` (87개, id = `m-<무장 id>-<번호>`). `def`(parts·static·unit·uniquePatch) + `clauses` + `runs`(parts 번호별 실행 함수). 파일이 정본 — `data/engine/manuals.json` 은 생성 원천(`pnpm gen:manuals`), 수정은 `pnpm manual:revise <수정안.json>`.
- `data/kr/` 엑셀 원본 → `data/engine/` 엔진 정의(v1.12b 변환, `overrides.json` 검수 수정, `authored.json` 직접 작성, `manuals.json` 금병법, `clause-review.json`) → `data/patches/` 게임 확인 정보
- `packages/engine` 전투 엔진 · `packages/audit` 규칙 감사 · `packages/recommender` 덱 추천 · `packages/data-tools` 가져오기·번들·단일 파일
- `apps/design` 기획 플랫폼(설계서) · `apps/web` 시뮬 사이트 · `apps/mcp-server` MCP 도구(`.mcp.json`, 기획 플랫폼 쓰기 `design_*` 포함)

## 명령
```bash
pnpm test                 # 엔진 동등성·감사·금병법·추천·데이터 무결성
pnpm audit                # 전체 규칙 감사 (~30초) → data/audit/latest.json
pnpm build:bundle         # 웹 데이터
pnpm build:design         # 기획 플랫폼(설계서) → apps/design/dist/design.html + docs/COMMON_RULES.md
pnpm build:standalone     # 시뮬 사이트 단일 HTML → apps/web/dist-standalone/muhanmutu(.artifact).html
pnpm gen:skills           # 함수 파일이 없는 전법의 파일 생성 (신규 전법 추가 후)
pnpm gen:manuals          # 함수 파일이 없는 금병법의 파일 생성 (manuals.json 에 새 금병법 추가 후)
```

## 검증 원칙 (R-019)
확률 게임이다. 확률·랜덤 대상·진형 피격률은 원문 그대로 실행하고, 시뮬 수백 판 통계(감사 D04·D06)로 원문 확률에 근접하는지만 본다.
인게임 전보에 몇 번 나왔는지는 검증 대상이 아니다. 녹화로 확인할 것은 전투 로직(순서·시점·조건), 계수(피해·회복·스탯 영향 공식), 원문 구절이 모두 실행되는지다.

## 계수 검증 방법 (역재현 우선)
녹화 영상이 오면 전투를 그대로 재현해 숫자를 맞춘다: 양쪽 무장·전법·진형을 전보대로 세팅하고, 툴팁에 찍힌 스탯·병력·증감을
그 턴 상태로 덮어쓴 뒤, 전보의 피해·회복·효과 수치 한 건씩을 엔진 공식으로 다시 계산해 비교한다(`data/replays/*.json`,
`pnpm replay:check`). 발동·대상·피신 같은 확률 결과는 전보 그대로 고정하고 숫자만 엔진에 맡긴다. 오차가 큰 항목이 고칠 계수다.

## 시즌·데이터 업데이트 절차
`.claude/skills/season-update/SKILL.md` 를 따른다.
