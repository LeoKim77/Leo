---
name: season-update
description: 천하결전 시뮬레이터에 새 시즌·무장·전법·밸런스 변경·전보 녹화를 반영하고 게시판에 기록한 뒤 사이트를 다시 배포한다. 사용자가 구글 시트 주소, 엑셀, 인게임 캡처·녹화, 패치 내용을 주며 "업데이트해줘/반영해줘"라고 할 때 쓴다.
---

# 시즌·데이터 업데이트

**순서: 기획 플랫폼 → 시뮬.** 규칙·해석이 걸린 변경은 먼저 기획 플랫폼(`data/design`, MCP `design_*`)에 규정·게시글로 남기고, 시뮬 엔진은 그 규정만 구현한다(커밋·게시판에 규정 번호).
입력 종류별로 처리하고, 마지막에 항상 **검증 → 게시판 → 배포(설계서 + 시뮬)**를 한다.

## 0. 기획 플랫폼 (정본 규정)
- 사용자가 규칙을 정해 주면: `design_resolve`(열린 질문에 답) 또는 `design_spec_update`(규정 수정, change·post 필수) + 필요하면 확정 규칙 R-번호(`confirmRule`).
- 애매한 해석이 생기면 바로 확정하지 말고 `design_post` 로 **질문**(ask 에 물을 것) 또는 **검증요청**(녹화·캡처 필요)을 올리고, 시뮬은 잠정값으로 두되 규정 상태를 '잠정'으로.
- 엔진을 고쳐 반영했으면 게시글을 `design_post_update` 로 '시뮬 반영'.
- 녹화·캡처로 검증을 마치면 `design_post` type '검증완료' 로 무엇을 확인했는지 + 사용자가 준 구글 드라이브 링크(`links`)를 남긴다. 역재현 파일(`data/replays/*.json`)의 source 에도 링크를 적는다.
- 페이지: `pnpm build:design` → `apps/design/dist/design.html` 을 `site.json` 의 `designUrl` 에 다시 게시. `docs/COMMON_RULES.md` 는 자동 생성(직접 고치지 않는다).

## 1. 입력 받기
- **구글 스프레드시트 주소** (복사·다운로드가 막힌 공유 시트도 '보기'만 되면 됨):
  1. `NODE_USE_ENV_PROXY=1 npx tsx packages/data-tools/src/import-gsheet.ts "<주소>" [탭 이름 일부…]` → `data/sources/gsheet/<시트id>/<gid>.json` (병합 칸 채움, 색칠 칸 기록). 네트워크 허용 도메인에 `docs.google.com`, `*.googleusercontent.com` 필요.
  2. 시즌 도감·티어덱 시트면 `data/seasons/<시즌>/name-map.json`(시트 이름 → id·한자·deck-lab id, 사람이 검토)을 만들거나 새 이름을 추가하고 `npx tsx packages/data-tools/src/import-season.ts <시즌>` → `data/seasons/<시즌>/{generals,skills,tier-decks}.json`. 시트 수치 "Lv1 → Lv2" 는 10레벨(Lv1×2)로 환산된다. 번들은 엑셀 원본 뒤에 시즌 층을 붙인다(같은 id 는 엑셀 우선).
  3. 공개 자료가 없는 값(능력치·병종·배치·발동률·이름)은 임시값 + `dataStatus` 로 남는다 → 검증 대기 목록의 `capture`(캡처로 확인)·`rate`(발동률) 항목. 캡처·공식 자료를 받으면 `data/seasons/<시즌>/name-map.json` 또는 MCP `data_patch` 로 채우고 `dataStatus` 를 지운다.
  - 열 구성이 엑셀 DB 와 같은 시트는 `.xlsx` 로 받아 `import-excel.ts` 를 써도 된다.
- **엑셀 DB 새 판**: `data/sources/` 에 넣고 `import-excel.ts` 실행. `git diff data/kr` 로 바뀐 무장·전법·수치를 확인한다.
- **인게임 캡처·녹화**: 화면의 원문(전법 설명, 스탯, 발동 확률)을 읽어 MCP `data_patch` 로 반영. 원문은 한국판 그대로 옮긴다.
- **전보 녹화**: MCP `verification_list` 에서 관련 항목을 찾아 대조하고 `verification_resolve` 로 확인/불일치를 기록한다. 불일치면 엔진 정의를 고친다(아래 3).
- 사용자 설명 중 게임 규칙이 있으면 `data/common/confirmed-rules.json` 에 R-번호로 추가한다.

## 2. 새 무장·전법 데이터
- 무장: 시즌(한국 서버 기준), 세력·위치·성향·병종, 50레벨 스탯, 고유 전법, 금병법.
- 전법: 유형(지휘/패시브/액티브/추격), 특성, 10레벨 발동 확률, 10레벨 원문.
- 해외 자료만 있으면 `overseas_lookup` + `term_normalize` 로 한국판 용어로 바꾸고 출처를 남긴다. 한국판 원문이 나오면 덮어쓴다.

## 3. 전투 엔진에 반영 (핵심) — 전법 = 함수 파일
전법·고유 전법은 하나에 파일 하나: `packages/engine/src/skills/<id>.ts` (**파일이 정본**). 공용 규칙은 기획 플랫폼 규정 `data/design/spec.json`(사본 `docs/COMMON_RULES.md`)·`data/common/confirmed-rules.json`.
1. **새 전법**: 데이터(`data/kr`·시즌 층·`data/patches`)에 원문이 들어간 뒤 `pnpm gen:skills` → 함수 파일이 없는 전법만 뼈대가 생긴다
   (JSON 원천 `data/engine/authored.json`·`skills.json`·`overrides.json` 에 정의가 있으면 그걸로, 없으면 `def: null`).
2. **원문 순서대로 run(c) 작성**: 절마다 원문을 `// 「…」` 주석으로 달고 부품을 부른다.
   - 부품: `c.damage` `c.heal` `c.buff` `c.status` `c.statMod` `c.dispel` `c.grant` `c.guard` · 대상 `c.targets(코드)` `c.tag(이름, 무장[])` → 항목 `target: 'tag:이름'` · `c.has` `c.chance` `c.stat` `c.pick` `c.friendsOf` `c.enemiesOf` `c.eventCtx`(트리거 사건).
   - 항목 형식은 `types.ts` 와 기존 파일 참고(조건 `condition`, 확률 `chance`/`chanceOnce`, 턴 조건 `turnCond`, 지속 `duration`/`untilTurnEnd`, 중첩 `maxStacks`, 스탯 영향 `inf`, 조건 배수 `conditionalBonusMult` 등).
   - 발동 시점·트리거·부속 효과는 `def` 의 `_timing`·`trigger`·`parts` 로. 확률이 대상 앞이면 1회 판정(R-021), '랜덤 N명'은 균등(R-020), 한 절의 대상은 공유(R-044).
3. **고칠 때**: 수정안 JSON(`{ id: { note, set, unset, clauses, run } }`)을 만들어 `pnpm skill:revise <수정안.json>` → 파일이 다시 쓰이고 `revised` 에 날짜·사유가 쌓인다. 손으로 파일을 고쳐도 되지만 `revised` 는 꼭 남긴다.
4. 없는 메커니즘이면 `core.js` 에 **일반화된 부품**으로 추가하고 `ENGINE_FIXES` 에 FEAT-번호로. 특정 전법 이름으로 분기하지 않는다. 함수 API 에 새 부품을 노출하면 `types.ts`(SkillApi)도 갱신.
5. 원문대로가 아니면 해당 절 `status: 'approx'` + 검증 대기(`data/verification/engine-assumptions.json`)에 해석을 남긴다.
6. 확인: `pnpm test`(전법 함수 구조·동등성 포함) → `pnpm audit` → MCP `sim_battle` 로 전보를 읽어 본다. 감사 문제는 오탐인지 엔진 문제인지 전보로 확인한 뒤 고친다.
7. 금병법도 함수 파일(`packages/engine/src/manuals/<id>.ts`)이 정본이다. 새 금병법은 `data/engine/manuals.json` 에 정의를 넣고 `pnpm gen:manuals` 로 파일을 만든 뒤 원문대로 손본다(`pnpm manual:revise`, 형식은 `manual-revise.ts` 머리말). 기존 금병법 수정도 `manual:revise` 로 — `revised` 에 날짜·사유가 남는다.

## 4. 게시판
MCP `board_post` (분류: 신규 무장/신규 전법/밸런스 조정/티어덱/전투 규칙/데이터 수정/엔진/기타). 본문에 무엇이 바뀌었는지, 근사·미지원 항목, 감사 결과를 적는다. `files` 는 생략하면 미커밋 변경 파일이 자동으로 들어간다. 커밋 후에는 해당 글에 `commit` 을 채운다.

## 5. 배포
1. `pnpm build:design` → `apps/design/dist/design.html` 을 **`site.json` 의 designUrl 에 다시 게시**(설계서: 규정·도감·감사·변경 기록).
2. `pnpm build:standalone` → `apps/web/dist-standalone/muhanmutu.artifact.html` 을 **`site.json` 의 artifactUrl 에 다시 게시**(시뮬 사이트: 시뮬레이션·덱 추천·보유·티어덱만). 새 주소를 만들지 않는다.
3. 사용자가 원하면 `muhanmutu.html` 도 파일로 보낸다(로컬 실행용).
4. 커밋·푸시.
