# Laytime (Lay-Z Check · Lay Mong)

LayLay 쇼핑몰 안에 들어갈 **Laytime** 영역 MVP입니다.  
Lay-Z Check(게으름 지수)랑 Lay Mong(꿈 해몽) 두 가지가 한 허브 화면에서 갈라집니다.

이 폴더 통째로 넘기시면 됩니다. PHP로 옮기실 때는 귀사 구조 환경에 따라주셔도 됩니다.  `site/`

---

## 폴더 구조

```
layaly_dev/
├── site/                 ← 실제 화면 (여기가 메인)
│   ├── index.html
│   └── assets/
│       ├── css/layz.css
│       ├── js/
│       │   ├── app.js          화면 전환, 버튼, AI 호출 타이밍
│       │   ├── data.js         8문항, 모드 구간, AI 안 될 때 쓰는 고정 문구
│       │   ├── layz-ai.js      Lay-Z 프롬프트 ★
│       │   ├── laymong-ai.js   Lay Mong 프롬프트 ★
│       │   ├── laymong-feed.js 도감
│       │   └── html-to-image.js 공유 이미지 저장
│       └── *.svg
├── netlify/functions/openai-dev-chat.js   ← AI API (PHP로 바꿀 부분)
├── docs/DEVELOPER.md       ← 자세한 설명은 여기
├── netlify.toml
└── package.json
```

---

## 로컬에서 돌려보기

```bash
npm install
cp .env.example .env    # OPENAI_API_KEY 넣기
npm run dev             # http://localhost:8888
```

`index.html`을 브라우저에서 file로만 열면 AI가 안 됩니다. 꼭 위처럼 서버 띄워서 확인해 주세요.

---

## 배포 참고 (지금은 Netlify 기준)

- 정적 파일: `site`
- API: `netlify/functions`
- 환경변수: `OPENAI_API_KEY`

실서비스는 PHP 쪽 API로 갈아끼우실 거라, 이건 **동작 확인용**이라고 보시면 됩니다.

---

## 이미지 파일 (`site/assets/`)

- `logo.svg` — 헤더, 공유 카드
- `hub-layz-illust.svg` / `hub-laymong-illust.svg` — 메인 허브
- `hero-character.svg` — Lay-Z 시작 화면
- `loading-character.svg` — Lay-Z 로딩
- `result-character.svg` — 결과, 공유
- `laymong-character.svg` — Lay Mong 입력·로딩
- `laymong-bg-pattern.svg` — Lay Mong 배경 패턴
- `chevron.svg` — 아코디언 화살표

---

더 자세한 건 `docs/DEVELOPER.md` 봐주세요.  
특히 **AI 프롬프트**는 `layz-ai.js`, `laymong-ai.js` — 이거 건드리실 때 저희랑 한번 맞추는 게 좋습니다.
