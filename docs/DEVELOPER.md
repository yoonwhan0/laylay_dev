# Laytime 개발 인계 메모

LayLay Laytime MVP 인계용 정리입니다.  
**Vanilla JS + 정적 HTML + Netlify Functions** 구조이며, PHP 이식 시 `site/` 화면과 `/api/*` 서버 부분만 맞춰 주시면 됩니다.

좌측 ERP형 버전 메뉴로 **01~04**를 전환하며 비교할 수 있습니다.

---

## 버전 개요

### 01 기본 제품
- 기존 Lay-Z Check 플로우
- 8문항 → 0~99점 → AI 결과(head/desc/summary/recs/rx)

### 02 사투리 버전
- 문의(퀴즈)는 01과 동일
- 첫 화면에서 **충청도 / 경상도 / 전라도**만 선택 (특징 문구는 UI에 노출하지 않음 — 지역감정 이슈 방지)
- AI 말투만 지역 화법 HARD/NUCLEAR 톤으로 분기 (`layz-ai.js` dialect 옵션)

### 03 풍성 + 추천
- 문의는 01과 동일
- AI 답변 분량 확대 + 줄바꿈 로직 유지 (`text-format.js`: `\\n` → `<br>`, 문장 자동 분리)
- 결과 **SECTION 03**: 점수 구간별 유튜브 또는 영화 추천 + 스냅샷 카드
  - `0–39`: 유튜브(활력·스트레칭)
  - `40–69`: 영화(힐링)
  - `70–99`: 유튜브(수면·이완)
- 유튜브는 Innertube 검색으로 **실제 `watch?v=` 링크 + 썸네일** 확보 (`media-recommend.js`)
- 선택: `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` 있으면 영화/보조 스냅샷에 네이버 이미지 검색 사용

### 04 PROMIS® 공신력 버전
- 문의·점수·결과 UI 전부 변경
- NIH **PROMIS® Global Health v1.2** 기반 8문항
  - **GPH-4**: Global03, Global06, Global07(통증 재코딩·역채점), Global08
  - **GMH-4**: Global02, Global04, Global05, Global10
- raw(4–20) → **T-score** (평균 50, SD 10, 높을수록 건강↑)
- 논문 초점 척도 **GPH-2 / GMH-2**도 참고 점수로 표시
- 결과 화면에 출처 고정 표기

### 공통 — 문항 뱃지 / WHY 모달 (01~04)
- 각 문항 상단: **카테고리 뱃지** + **왜 묻나요?** 버튼
- 버튼 클릭 시 `WHY THIS QUESTION?` 모달
  - 문항 제목
  - 설명 본문
  - 하단 `참고 근거/설계 원칙` 박스
- 메타 필드: `badge`, `lead`, `why.body`, `why.reference`
  - Lay-Z(01–03): `site/assets/js/data.js` → `QUESTIONS`
  - PROMIS(04): `site/assets/js/promis-data.js` → `QUESTIONS`
- 모달 마크업: `site/index.html` `#why-modal` / 로직: `app.js` `openWhyModal`

**출처**
- Hays RD, Schalet BD, Spritzer KL, Cella D.  
  *Two-item PROMIS® global physical and mental health scales.*  
  J Patient Rep Outcomes. 2017;1:2.  
  DOI: [10.1186/s41687-017-0003-8](https://doi.org/10.1186/s41687-017-0003-8)  
  PMCID: [PMC5934936](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5934936/)
- Instrument: PROMIS® Scale v1.2 — Global Health  
- 본 모듈은 자기보고 스크리닝 MVP이며 **의료 진단용이 아닙니다.** 정식 임상 채점은 HealthMeasures Scoring Service를 권장합니다.

---

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

- AI: `POST /api/openai-dev` → `netlify/functions/openai-dev-chat.js`
- 미디어 추천: `POST /api/media-recommend` → `netlify/functions/media-recommend.js`
- 키는 **서버(환경변수)에만** 둡니다.

---

## 화면 이동 (hash)

| 주소 | 화면 |
|------|------|
| `#/` / `#/layz` | 버전별 시작(인트로) |
| `#/quiz` | 문항 (01–03: Lay-Z 8문항 / 04: PROMIS 8문항) |
| `#/loading` | 분석 중 |
| `#/result` | 결과 (버전별 UI) |
| `#/history` | Lay-Z 기록 (01–03) |

버전 상태는 `app.js`의 `state.productVersion` (1~4) 입니다.

---

## 주요 파일

| 파일 | 역할 |
|------|------|
| `site/assets/js/app.js` | 버전 메뉴, 라우팅, 퀴즈/결과 렌더, AI 호출 타이밍 |
| `site/assets/js/data.js` | Lay-Z `QUESTIONS`(badge/lead/why), 모드, `RESULT_COPY` |
| `site/assets/js/layz-ai.js` | Lay-Z AI (`dialect` / `rich` 옵션) |
| `site/assets/js/layz-media.js` | v03 미디어 API 클라이언트 |
| `site/assets/js/promis-data.js` | PROMIS 문항(badge/lead/why)·raw→T 변환 |
| `site/assets/js/promis-ai.js` | PROMIS 해석 AI |
| `site/assets/js/text-format.js` | 줄바꿈·이스케이프·`<br>` |
| `netlify/functions/media-recommend.js` | Innertube/유튜브 썸네일, 영화 포스터, 네이버 이미지 보조 |

### AI 호출 타이밍
- **01–03:** `runLayZAiFlow()` → `LayZAi.fetchCopy(..., { dialect?, rich? })`
- **03 추가:** `LayZMedia.fetchRecommendations(score, mode)`
- **04:** `runPromisAiFlow()` → `PromisData.scoreAnswers()` + `PromisAi.fetchCopy()`

### localStorage
- `layz_history` — Lay-Z 기록 (01–03)

---

## 유튜브 링크 확보 (v03)

1. (선택) `YOUTUBE_API_KEY` Data API 검색  
2. **YouTube Innertube WEB 검색**으로 videoId 확보 (기본 경로)  
3. oEmbed로 제목·썸네일 검증  
4. 실패 시에만 검색 결과 URL로 폴백  

로컬/`netlify dev`에서 functions가 떠 있어야 `/api/media-recommend`가 동작합니다.

---

## 디자인 / 몰 연동

- 기존 Lay-Z 시안 톤을 유지하되, 버전 메뉴·PROMIS 결과·미디어 카드·문항 WHY 모달은 MVP용 추가 UI입니다.
- 문항 헤더 시안: 주황 카테고리 pill + 아웃라인 `왜 묻나요?` + 문항 + 회색 lead.
- WHY 모달 시안: 라운드 카드, 주황 `WHY THIS QUESTION?`, 원형 닫기, 연주황 참고 박스.
- 상단 Shop/Brand 등 GNB, 헤더·푸터는 메인 몰 연동 예정입니다 (`#` 스텁).

---

## PHP 이식 체크리스트

- [ ] `site/` 정적 화면·해시 라우팅 이식
- [ ] `/api/openai-dev` → PHP OpenAI 프록시 (키 서버 전용)
- [ ] `/api/media-recommend` → PHP에서 Innertube/유튜브 검색 동등 구현
- [ ] `layz-ai.js` / `promis-ai.js` 프롬프트·JSON 스키마 유지
- [ ] PROMIS 출처·비진단 고지 문구 유지
- [ ] 메인 몰 헤더/푸터/GNB 연동

---

## 아직 안 된 것

- 카카오 공유 SDK 연동 (버튼만 존재)
- 기록 삭제 UX (`confirm` 사용)
- Lay Mong 제품 재연결 (의도적으로 허브에서 제외)

문의 있으시면 편하게 연락 주세요.
