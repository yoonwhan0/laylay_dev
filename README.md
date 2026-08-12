# Laytime — Lay-Z Check MVP (버전 메뉴)

LayLay 쇼핑몰 Laytime 영역용 **멀티 버전 MVP**입니다.  
좌측 ERP형 메뉴로 버전을 바꿔가며, 한정 예산 안에서 재미·공신력 방향을 빠르게 비교·판단할 수 있게 구성했습니다.

소스는 `site/` 가 메인입니다. PHP 이식 시에도 이 폴더 기준으로 옮기시면 됩니다.

---

## 버전 구성 (좌측 메뉴)

| 버전 | 이름 | 요약 |
|------|------|------|
| **01** | 기본 제품 | 기존 Lay-Z Check 8문항 → 게으름 지수 → AI 결과 |
| **02** | 사투리 버전 | 동일 문의 + 첫 화면에서 충청/경상/전라 선택 → 지역 화법으로 결과 |
| **03** | 풍성 + 추천 | 기본 플로우 + 더 풍성한 답변 + 점수별 유튜브/영화 추천(스냅샷·실제 링크) |
| **04** | PROMIS 공신력 | NIH PROMIS® Global Health 문항·T-score (GPH-4 / GMH-4), 출처 표기 |
| **05** | LAB OVERDRIVE | ADHD 머릿속 보드 · 그래프+탭/스티커 산만 UI · AI 5병렬 고토큰 |

공통: 모든 모듈 문항 상단에 **카테고리 뱃지 + 왜 묻나요?** → WHY 모달(설명·참고 근거).

> Lay Mong(꿈 해몽)은 현재 허브에서 제외된 상태입니다. 레거시 파일(`laymong-*.js`)은 남아 있을 수 있으나 메인 플로우에는 연결되지 않습니다.

---

## 폴더 구조

```
layaly_dev/
├── site/
│   ├── index.html
│   └── assets/
│       ├── css/layz.css
│       └── js/
│           ├── app.js           라우팅·버전 메뉴·화면
│           ├── data.js          Lay-Z 8문항·모드·폴백 카피
│           ├── layz-ai.js       Lay-Z AI (기본/사투리/풍성)
│           ├── layz-media.js    v03 미디어 추천 클라이언트
│           ├── promis-data.js   PROMIS 문항·T-score
│           ├── promis-ai.js     PROMIS 해석 AI
│           ├── lab-engine.js    v05 계측·SVG 그래프
│           ├── lab-ai.js        v05 고토큰 3병렬 AI
│           ├── text-format.js   줄바꿈·HTML 포맷
│           └── html-to-image.js 공유 이미지
├── netlify/functions/
│   ├── openai-dev-chat.js       OpenAI 프록시 → /api/openai-dev
│   └── media-recommend.js       유튜브/영화 추천 → /api/media-recommend
├── docs/DEVELOPER.md
├── netlify.toml
└── package.json
```

---

## 로컬 실행

```bash
npm install
cp .env.example .env    # OPENAI_API_KEY 필수
npm run dev             # http://localhost:8888
```

`index.html`을 file:// 로만 열면 API가 동작하지 않습니다. 반드시 `npm run dev`로 확인하세요.

### 환경변수

| 키 | 필수 | 설명 |
|----|------|------|
| `OPENAI_API_KEY` | ✅ | 결과 카피·미디어 큐레이션 |
| `YOUTUBE_API_KEY` | 선택 | 있으면 Data API 우선 (없어도 Innertube로 watch 링크 확보) |
| `OMDB_API_KEY` | 선택 | 영화 포스터 정확도 (없으면 iTunes 포스터) |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 선택 | 03모듈 스냅샷 보조(네이버 이미지 검색) |

---

## 배포 (Netlify 기준)

- Publish: `site`
- Functions: `netlify/functions`
- Redirects: `/api/openai-dev`, `/api/media-recommend`

---

## 문서

상세 인계·프롬프트·점수 로직은 [`docs/DEVELOPER.md`](docs/DEVELOPER.md) 를 보세요.
