# 삼국지 천하결전 무한무투 — 작업 안내

삼국지 천하결전 덱 전투 시뮬레이터. 목표는 **실제 게임과 가장 가까운 전투 재현**이다.
시즌은 약 2개월마다 바뀌고 무장·고유 전법·전법이 계속 추가된다. 사용자는 공유 구글 시트 주소나
인게임 녹화·캡처를 올리고, Claude 가 데이터·엔진·게시판·배포를 갱신한다.

## 사이트의 목적 (사용자 지정 — 잊지 말 것)
1. **덱 실험**: 사용자가 구상한 덱을 바로 넣어 돌려 보는 시뮬
2. **최상의 덱 자동 추천**: 사용자가 가진 무장·전법으로 이번 시즌 최상의 덱을 자동으로 뽑는 기능

모든 작업(엔진 정확도·검증 녹화·데이터 갱신)은 이 두 기능을 더 정확하게 만들기 위한 것이다.

## 원칙
- 한국판 용어만 쓴다 (병기/책략/피신/묘책/금병법). 해외 표기는 `data/common/term-map.json` 으로 바꾼다.
- 게임 규칙의 근거는 사용자 확인(`data/common/confirmed-rules.json`, R-xxx)과 한국판 원문이다. 추측으로 확정하지 않는다.
- 근사로 처리한 해석은 반드시 `data/verification/` 검증 대기 목록에 남긴다(R-007). 시뮬 결과에도 근사 효과가 표시된다.
- 모든 변경은 업데이트 게시판(`data/changelog/*.json`)에 날짜·시즌·분류·**변경 파일**과 함께 기록한다.
- 엔진 버그를 고치면 `ENGINE_FIXES`(core.js)·게시판·테스트에 남긴다. `core-v1.12b.js` 는 원본 동등성 검증용 고정본이라 수정하지 않는다.

## 구조
- `data/kr/` 엑셀 원본 → `data/engine/` 엔진 정의(v1.12b 변환, `overrides.json` 검수 수정, `authored.json` 직접 작성, `manuals.json` 금병법, `clause-review.json`) → `data/patches/` 게임 확인 정보
- `packages/engine` 전투 엔진 · `packages/audit` 규칙 감사 · `packages/recommender` 덱 추천 · `packages/data-tools` 가져오기·번들·단일 파일
- `apps/web` 웹 · `apps/mcp-server` MCP 도구(`.mcp.json`)

## 명령
```bash
pnpm test                 # 엔진 동등성·감사·금병법·추천·데이터 무결성
pnpm audit                # 전체 규칙 감사 (~30초) → data/audit/latest.json
pnpm build:bundle         # 웹 데이터
pnpm build:standalone     # 단일 HTML → apps/web/dist-standalone/muhanmutu(.artifact).html
```

## 시즌·데이터 업데이트 절차
`.claude/skills/season-update/SKILL.md` 를 따른다.
