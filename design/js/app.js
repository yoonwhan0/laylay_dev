if (!window.LayData) {
  console.error("[LayLay] js/data.js 로드 실패");
  document.getElementById("app")?.insertAdjacentHTML(
    "beforeend",
    '<p style="padding:24px;text-align:center;color:#c00">스크립트 로드에 실패했습니다. index.html과 js 폴더가 같은 위치인지 확인해주세요.</p>'
  );
}

const {
  QUESTIONS = [],
  RESULT_COPY = {},
  MOOD_OPTIONS = [],
  pickFortune = () => ({}),
  getMode = () => ({}),
  getResultDetails = () => ({}),
  calcScore = () => 0,
  getHistory = () => [],
  saveResult = () => {},
  getMongHistory = () => [],
  saveMongResult = () => {},
  MONG_DEMO_HISTORY = [],
  FORTUNES = [],
} = window.LayData || {};

const app = document.getElementById("app");
const pageBody = document.querySelector(".page-body");
const modal = document.getElementById("info-modal");
const modalClose = document.getElementById("modal-close");
const shareModal = document.getElementById("share-modal");

let state = {
  answers: [],
  currentQ: 0,
  lastScore: null,
  lastMode: null,
  laymong: { gender: "남성", mood: "", dream: "", agreed: false, noticeOpen: false },
  lastFortune: null,
  laymongLoadingStep: 0,
};

const LAYMONG_LOADING_MESSAGES = [
  { main: "꿈 해몽하는 중 · · ·", sub: "" },
  { main: "꿈에서 느낀 감정 분석 중 · · ·", sub: "" },
  { main: "레이몽 리포트 완성 중 · · ·", sub: "" },
  {
    main: "오늘의 레이몽 리포트가 완성됐어요!",
    sub: "꿈이 전하는 메시지를 확인해보세요",
  },
];

function getActiveFortune() {
  return state.lastFortune || FORTUNES.find((x) => x.keyword === "default");
}

function openShareModal() {
  const f = getActiveFortune();
  const scoreEl = document.getElementById("share-score");
  const badgeEl = document.getElementById("share-badge");
  const summaryEl = document.getElementById("share-summary");
  if (scoreEl) scoreEl.textContent = f.score;
  if (badgeEl) badgeEl.textContent = f.badge;
  if (summaryEl) summaryEl.textContent = f.summary;
  shareModal?.classList.add("open");
  shareModal?.setAttribute("aria-hidden", "false");
}

function closeShareModal() {
  shareModal?.classList.remove("open");
  shareModal?.setAttribute("aria-hidden", "true");
}

async function saveShareImage() {
  const card = document.getElementById("share-card-capture");
  if (!card) return;

  if (typeof htmlToImage === "undefined") {
    alert("이미지 저장을 준비하지 못했어요. 화면을 길게 눌러 저장해주세요.");
    return;
  }

  try {
    const blob = await htmlToImage.toBlob(card, {
      pixelRatio: 2,
      backgroundColor: "#2c2545",
      cacheBust: true,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laymong-report-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[LayLay] share image save failed", err);
    alert("이미지 저장에 실패했어요. 화면을 길게 눌러 저장해주세요.");
  }
}

async function shareKakao() {
  const f = getActiveFortune();
  const text = `Lay Mong Report\n${f.badge} (${f.score}점)\n${f.summary}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Lay Mong 결과",
        text,
        url: location.href,
      });
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text}\n\n${location.href}`);
      alert("공유 문구가 복사됐어요. 카카오톡에 붙여넣어 공유해주세요.");
      return;
    } catch (_) {
      /* clipboard blocked */
    }
  }

  window.prompt("아래 문구를 복사해 카카오톡에 공유하세요:", `${text}\n\n${location.href}`);
}

function formatDate(iso) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}년 ${m}월 ${day}일 (${days[d.getDay()]})`;
}

function navigate(hash) {
  if (hash !== location.hash) location.hash = hash;
  render();
}

function formatRelativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(iso);
}

function renderAnalysisStarsInline(analysis = []) {
  return analysis
    .map(
      (a) =>
        `<span class="mong-inline-stat"><em>${a.label}</em>${renderStars(a.stars)}</span>`
    )
    .join("");
}

function renderStars(count) {
  const n = Math.min(5, Math.max(0, count));
  return `<span class="mong-stars"><span class="mong-stars-on">${"★".repeat(n)}</span><span class="mong-stars-off">${"★".repeat(5 - n)}</span></span>`;
}

function renderHub() {
  return `
    <section class="hub-main">
      <div class="hub-col hub-col--left">
        <h1 class="hub-title">Lay-Z Check</h1>
        <div class="hub-desc">
          <p>오늘 유난히 눕고 싶은 데는 이유가 있을지도 몰라요.</p>
          <p>8가지 질문으로 나의 게으름 지수를 확인해보세요.</p>
        </div>
        <button type="button" class="hub-btn" data-action="layz-intro">오늘의 Lay-Z 지수 확인하기</button>
        <div class="hub-illust hub-illust--layz">
          <img src="assets/hub-layz-illust.svg" alt="Lay-Z Check 일러스트" />
        </div>
      </div>
      <div class="hub-col">
        <h1 class="hub-title">Lay Mong</h1>
        <div class="hub-desc">
          <p>기억에 남는 꿈이 있나요?</p>
          <p>꿈에 담긴 의미를 해석하고 오늘의 운세까지 읽어드릴게요</p>
        </div>
        <button type="button" class="hub-btn" data-action="laymong">꿈으로 오늘의 운세 보기</button>
        <div class="hub-illust hub-illust--mong">
          <img src="assets/hub-laymong-illust.svg" alt="Lay Mong 일러스트" />
        </div>
      </div>
    </section>
  `;
}

function renderLayzIntro() {
  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--tall">
        <h1 class="title-layz title-layz--intro">Lay-Z Check</h1>
        <p class="subtitle-bold">오늘 나의 게으름 지수는?</p>
        <p class="subtitle">8가지 질문으로 오늘의 Lay-Z 지수를 확인해보세요</p>

        <div class="hero-illust">
          <img src="assets/hero-character.svg" alt="매트리스 위에서 자는 캐릭터 일러스트" />
        </div>

        <p class="landing-note">약 1분이면 충분해요!</p>
        <div class="btn-stack">
          <button class="btn btn-primary" data-action="start">지금 바로 시작하기</button>
          <button class="btn btn-outline btn-outline--sm" data-action="info">Lay-Z Check란?</button>
        </div>
        <a href="#" class="landing-footer-link" data-action="notice">
          이용 전 확인해주세요
          <img src="assets/chevron.svg" alt="" />
        </a>
      </section>
    </div>
  `;
}

function renderLaymong() {
  const moods = MOOD_OPTIONS.map((m) => {
    const val = `${m.emoji} ${m.label}`;
    return `<button type="button" class="laymong-mood ${state.laymong.mood === val ? "selected" : ""}" data-action="mood" data-mood="${val}"><span>${m.emoji}</span> ${m.label}</button>`;
  }).join("");

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--laymong">
        <div class="laymong-toggle">
          <button type="button" class="laymong-toggle-tab active" data-action="laymong">내 꿈 해몽하기</button>
          <button type="button" class="laymong-toggle-tab laymong-toggle-tab--sub" data-action="laymong-encyclopedia">레이몽 도감</button>
        </div>

        <div class="laymong-hero">
          <h1>Lay Mong</h1>
          <p>꿈으로 보는 오늘의 운세</p>
        </div>

        <div class="laymong-character">
          <img src="assets/laymong-character.svg" alt="레이몽 캐릭터" />
        </div>

        <div class="laymong-form panel-inner">
          <div class="laymong-field">
            <span class="laymong-label">성별</span>
            <div class="laymong-gender-row">
              <button type="button" class="laymong-chip ${state.laymong.gender === "남성" ? "selected" : ""}" data-action="gender" data-gender="남성">남성</button>
              <button type="button" class="laymong-chip ${state.laymong.gender === "여성" ? "selected" : ""}" data-action="gender" data-gender="여성">여성</button>
            </div>
          </div>

          <div class="laymong-field">
            <div class="laymong-label-row">
              <span class="laymong-label">생년월일</span>
              <span class="laymong-info-icon">i</span>
            </div>
            <div class="laymong-date-row">
              <select class="laymong-select"><option>양/음력</option><option>양력</option><option>음력</option></select>
              <select class="laymong-select"><option>년</option><option>1990</option><option>1995</option><option>2000</option></select>
              <select class="laymong-select"><option>월</option><option>1</option><option>6</option><option>12</option></select>
              <select class="laymong-select"><option>일</option><option>1</option><option>15</option><option>28</option></select>
            </div>
          </div>

          <div class="laymong-field">
            <span class="laymong-label">태어난 시간</span>
            <select class="laymong-select"><option>선택</option><option>자시 (23:30~01:29)</option><option>오시 (11:30~13:29)</option><option>모름</option></select>
          </div>

          <div class="laymong-field">
            <span class="laymong-label">꿈에서 느낀 기분</span>
            <div class="laymong-mood-row">${moods}</div>
          </div>

          <div class="laymong-field">
            <span class="laymong-label">꿈 내용(최대 300자)</span>
            <textarea class="laymong-textarea" id="dream-input" maxlength="300" placeholder="기억나는 장면, 사람, 장소, 감정을 자유롭게 적어주세요. 짧게 써도 괜찮아요.">${state.laymong.dream}</textarea>
            <p class="laymong-example">예) 낯선 바닷가에서 흰 고양이를 따라 걷고 있었어요. 마음이 편안했어요.</p>
          </div>

          <label class="laymong-check">
            <input type="checkbox" id="privacy-check" ${state.laymong.agreed ? "checked" : ""} />
            [필수] 개인정보 수집 · 이용에 동의합니다.
          </label>

          <button class="btn-laymong" data-action="laymong-submit">꿈으로 오늘의 운세 보기</button>
          <button class="btn-laymong-outline" data-action="laymong-history">지난 꿈 기록 보기</button>
        </div>

        <div class="laymong-notice-block">
          <button type="button" class="laymong-notice ${state.laymong.noticeOpen ? "open" : ""}" data-action="toggle-notice">
            이용 전 확인해주세요
            <img src="assets/chevron.svg" alt="" />
          </button>
          ${
            state.laymong.noticeOpen
              ? `<div class="laymong-notice-body">
            <p>Lay Mong은 오락 목적의 꿈 해몽·운세 콘텐츠입니다. 의학·법률·재정 등 전문적 조언을 대체하지 않습니다.</p>
            <p>입력하신 꿈 내용은 해몽 결과 생성에만 사용되며, 서비스 품질 개선 목적으로 활용될 수 있습니다.</p>
          </div>`
              : ""
          }
        </div>
      </section>
    </div>
  `;
}

function renderLaymongEncyclopedia() {
  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--laymong">
        <div class="laymong-toggle">
          <button type="button" class="laymong-toggle-tab" data-action="laymong">내 꿈 해몽하기</button>
          <button type="button" class="laymong-toggle-tab laymong-toggle-tab--sub active" data-action="laymong-encyclopedia">레이몽 도감</button>
        </div>

        <div class="laymong-hero">
          <h1>Lay Mong</h1>
          <p>다른 사람들의 꿈 해몽을 구경해보세요</p>
        </div>

        <div class="laymong-search panel-inner">
          <input type="search" class="laymong-search-input" placeholder="백호랑 산책하는 꿈" />
          <span class="laymong-search-icon" aria-hidden="true">⌕</span>
        </div>

        <p class="laymong-empty panel-inner">비슷한 꿈을 찾지 못했어요.</p>

        <button class="btn-laymong panel-inner" data-action="laymong">내 꿈으로 오늘 운세 보기</button>
      </section>
    </div>
  `;
}

function renderLaymongResult() {
  const f = state.lastFortune || FORTUNES.find((x) => x.keyword === "default");
  const analysis = (f.analysis || [])
    .map(
      (a) => `
      <div class="mong-analysis-item">
        <div class="mong-analysis-left">
          <span class="mong-analysis-label">${a.label}</span>
          <span class="mong-analysis-badge">${a.level}<span class="mong-analysis-stars">${renderStars(a.stars)}</span></span>
        </div>
        <img src="assets/chevron.svg" class="mong-chevron" alt="" />
      </div>`
    )
    .join("");

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--laymong center-panel--laymong-result">
        <div class="panel-inner">
          <p class="laymong-report-label">Lay Mong Report</p>
          <h2 class="laymong-result-title">꿈으로 본 오늘 나의 운세는?</h2>

          <div class="laymong-score-row">
            <span class="laymong-score">${f.score}</span><span class="laymong-score-unit">점</span>
          </div>

          <div class="laymong-badge-wrap">
            <div class="laymong-badge">${f.badge}</div>
          </div>
          <p class="laymong-result-summary">${f.summary}</p>

          <div class="laymong-character laymong-character--result">
            <img src="assets/result-character.svg" alt="레이몽 캐릭터" />
          </div>

          <h3 class="laymong-section-title">오늘의 운세 분석</h3>
          <div class="mong-analysis-list">${analysis}</div>

          <h3 class="laymong-section-title">오늘의 행운</h3>
          <div class="mong-lucky-grid">
            <div class="mong-lucky-box"><dt>행운의 색</dt><dd>${f.lucky.color}</dd></div>
            <div class="mong-lucky-box"><dt>행운의 숫자</dt><dd>${f.lucky.number}</dd></div>
            <div class="mong-lucky-box"><dt>행운의 물건</dt><dd>${f.lucky.item}</dd></div>
          </div>

          <h3 class="laymong-section-title">오늘의 총평</h3>
          <p class="mong-overview">${f.overview}</p>

          <div class="btn-stack">
            <button class="btn-laymong" data-action="laymong-share">꿈 해몽 공유하기</button>
            <div class="btn-row-2">
              <button class="btn-laymong-outline" data-action="laymong">다시 꿈 해몽하기</button>
              <button class="btn-laymong-outline" data-action="laymong-history">레이몽 도감 보러가기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderQuiz() {
  const q = QUESTIONS[state.currentQ];
  const progress = ((state.currentQ + 1) / QUESTIONS.length) * 100;
  const num = String(state.currentQ + 1).padStart(2, "0");
  const nav =
    state.currentQ === 0
      ? `<button data-action="layz-intro">메인으로 돌아가기</button>`
      : `<div class="quiz-nav-split">
          <button data-action="layz-intro">메인으로</button>
          <span>｜</span>
          <button data-action="prev">이전 질문</button>
        </div>`;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--tall">
        <div class="panel-inner">
          <h2 class="title-layz title-layz--sm">Lay-Z Check</h2>
          <p class="quiz-subtitle">오늘 나의 게으름 지수는?</p>

          <div class="quiz-progress">
            <div class="quiz-progress-num"><strong>${num}</strong> / 08</div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width:${progress}%"></div>
            </div>
          </div>

          <h3 class="quiz-question">${q.text.replace(/\n/g, "<br />")}</h3>
          <div class="quiz-options">
            ${q.options
              .map(
                (opt, i) => `
              <button class="quiz-option" data-action="answer" data-index="${i}">${opt.label}</button>
            `
              )
              .join("")}
          </div>
          <div class="quiz-nav">${nav}</div>
        </div>
      </section>
    </div>
  `;
}

function renderLoading(kind = "layz") {
  const isLaymong = kind === "laymong";
  if (!isLaymong) {
    return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--loading">
        <div class="loading-panel">
          <p class="loading-text">8개의 답변을 차근차근 살펴보는 중 · · ·</p>
          <div class="loading-illust">
            <img src="assets/loading-character.svg" alt="분석 중 일러스트" />
          </div>
        </div>
      </section>
    </div>
  `;
  }

  const step = LAYMONG_LOADING_MESSAGES[state.laymongLoadingStep] || LAYMONG_LOADING_MESSAGES[0];
  const isFinal = state.laymongLoadingStep >= LAYMONG_LOADING_MESSAGES.length - 1;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--laymong center-panel--laymong-loading">
        <div class="loading-panel">
          <p class="loading-text loading-text--light ${isFinal ? "loading-text--final" : ""}">${step.main}</p>
          ${step.sub ? `<p class="loading-sub loading-text--light">${step.sub}</p>` : ""}
          <div class="loading-illust loading-illust--laymong">
            <img src="assets/laymong-character.svg" alt="분석 중 일러스트" />
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderResult() {
  const score = state.lastScore;
  const mode = state.lastMode;
  const copy = RESULT_COPY[mode.name];
  const details = getResultDetails(mode.name);
  const pointerPct = Math.min(100, Math.max(0, score));
  const modeIndex = ["Active", "Easy", "Slow", "Lazy", "LayLay"].indexOf(mode.name);
  const pointerLeft = modeIndex >= 0 ? (modeIndex / 4) * 100 : pointerPct;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--result">
        <div class="panel-inner">
          <div class="result-hero">
            <div class="result-card-label">Lay-Z Report</div>
            <div class="result-card-title">오늘 나의 게으름 지수는?</div>
            <div class="result-score">${score}</div>

            <div class="mode-scale">
              <div class="mode-pointer-wrap" style="left:${pointerLeft}%">
                <div class="mode-pointer"></div>
              </div>
              <div class="mode-track mode-track--border">
                <div class="mode-fill mode-fill--segment" style="width:${Math.max(12, pointerLeft + 8)}%"></div>
              </div>
              <div class="mode-labels">
                <span class="${mode.name === "Active" ? "active" : ""}">Active</span>
                <span class="${mode.name === "Easy" ? "active" : ""}">Easy</span>
                <span class="${mode.name === "Slow" ? "active" : ""}">slow</span>
                <span class="${mode.name === "Lazy" ? "active" : ""}">Lazy</span>
                <span class="${mode.name === "LayLay" ? "active" : ""}">LayLay</span>
              </div>
            </div>

            <div class="mode-badge-wrap">
              <span class="mode-badge">${mode.label}</span>
            </div>

            <div class="result-message">
              <h3>${copy.title}</h3>
              <p>${copy.desc}</p>
            </div>

            <div class="result-tags">
              ${copy.tags.map((t) => `<span class="tag tag--orange">${t}</span>`).join("")}
            </div>

            <div class="result-illust">
              <img src="assets/result-character.svg" alt="결과 일러스트" />
            </div>

            <div class="btn-stack">
              <button class="btn btn-primary" data-action="share">나의 상태 공유하기</button>
              <button class="btn btn-outline btn-outline--sm" data-action="retry">다시 테스트하기</button>
            </div>
          </div>

          <h3 class="section-title section-title--center">오늘 나의 상태 요약</h3>
          <div class="stats-grid">
            <div class="stat-box"><dt>멘탈</dt><dd>정상</dd></div>
            <div class="stat-box"><dt>수면 상태</dt><dd>만족</dd></div>
            <div class="stat-box"><dt>수면 부족</dt><dd>0시간</dd></div>
          </div>
          <p class="result-summary">${details.summary}</p>

          <h3 class="section-title section-title--center">오늘 컨디션에 맞는 행동 추천</h3>
          <div class="recommend-list">
            ${details.recommends
              .map(
                (r) => `
              <article class="recommend-card recommend-card--full">
                <span class="badge">${r.badge}</span>
                <h4>${r.title}</h4>
                <p>${r.desc}</p>
              </article>`
              )
              .join("")}
          </div>

          <div class="sleep-guide">
            <p class="sleep-guide-label">레이레이 수면 가이드</p>
            <h3>편안한 밤을 위한 팁</h3>
            <div class="guide-list">
              <div class="guide-item">
                <span class="guide-num">01</span>
                <div>
                  <strong>정해진 시간에 잠자기</strong>
                  <p>매일 같은 시간에 자고 일어나면 몸이 리듬을 찾을 수 있어.</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-num">02</span>
                <div>
                  <strong>스마트폰 멀리하기</strong>
                  <p>잠들기 1시간 전에는 스마트폰을 멀리해보자. 더 깊은 잠을 도와줄 거야.</p>
                </div>
              </div>
              <div class="guide-item">
                <span class="guide-num">03</span>
                <div>
                  <strong>편안한 수면 환경 만들기</strong>
                  <p>어두운 방과 적절한 온도를 유지하면 더욱 편안한 수면을 누릴 수 있어.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="btn-stack result-bottom-btns">
            <button class="btn btn-primary" data-action="share">나의 상태 공유하기</button>
            <div class="btn-row-2">
              <button class="btn btn-outline btn-outline--sm" data-action="retry">다시 테스트하기</button>
              <button class="btn btn-outline btn-outline--sm" data-action="history">내 기록 보러가기</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderHistory() {
  const history = getHistory();
  const demo = history.length === 0;

  const records = demo
    ? [
        {
          mode: "Easy",
          modeLabel: "Easy Mode",
          title: "슬슬 ... 레이지해지는 중",
          tags: ["뇌 셔터 내림", "퇴근 구색중", "현관 탈주 불가형"],
          score: 33,
          date: "2024-06-25T00:00:00",
        },
        {
          mode: "Slow",
          modeLabel: "Slow Mode",
          title: "집에 가고 싶어 미칠 것 같음",
          tags: ["뇌 셔터 내림", "업무 과부하", "어딘가 아픈 것 같아"],
          score: 60,
          date: "2024-06-27T00:00:00",
        },
      ]
    : history;

  const chartData = [null, null, null, 33, 60, null, null];
  const days = ["월", "화", "수", "목", "금", "토", "일"];

  const avg =
    records.length > 0
      ? Math.round(records.reduce((s, r) => s + r.score, 0) / records.length)
      : 0;
  const max = records.length > 0 ? Math.max(...records.map((r) => r.score)) : 0;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--history">
        <div class="panel-inner">
          <h2 class="title-layz title-layz--sm">나의 Lay-Z 지수</h2>
          <p class="history-subtitle">최근 7일간의 Lay-Z 지수 변화를 확인해보세요.</p>

          <div class="chart-legend">
            <span class="legend-dot legend-dot--orange">Active · Easy</span>
            <span class="legend-dot legend-dot--blue">Slow · Lazy · LayLay</span>
          </div>

          <div class="chart-wrap">
            <div class="chart-bars">
              ${chartData
                .map((val, i) => {
                  if (val == null)
                    return `<div class="chart-bar-col"><span class="chart-bar-score"></span><div class="chart-bar" style="height:0"></div></div>`;
                  const h = Math.round((val / 99) * 140);
                  const cls = val <= 39 ? "chart-bar--orange" : "chart-bar--blue";
                  return `<div class="chart-bar-col"><span class="chart-bar-score">${val}</span><div class="chart-bar ${cls}" style="height:${h}px"></div></div>`;
                })
                .join("")}
            </div>
            <div class="chart-days">${days.map((d) => `<span>${d}</span>`).join("")}</div>
          </div>

          <dl class="summary-stats">
            <div class="summary-stat"><dt>누적 측정</dt><dd><span class="stat-num">${records.length}</span>회</dd></div>
            <div class="summary-stat"><dt>평균 지수</dt><dd><span class="stat-num">${avg}</span>점</dd></div>
            <div class="summary-stat"><dt>최고 지수</dt><dd><span class="stat-num">${max}</span>점</dd></div>
          </dl>

          <div class="history-header">
            <h2>지난 기록</h2>
            <div class="history-actions">
              <button data-action="clear-one">기록 삭제</button>
              <span>｜</span>
              <button data-action="clear-all">전체기록 삭제</button>
            </div>
          </div>

          ${records
            .map((r) => {
              const modeClass = r.mode === "Easy" ? "easy" : r.mode === "Slow" ? "slow" : "easy";
              return `
          <article class="record-card record-card--figma">
            <div class="record-card-body">
              <div class="record-mode record-mode--${modeClass}">${r.modeLabel || r.mode + " Mode"}</div>
              <div class="record-title">${r.title}</div>
              <div class="record-tags">${r.tags.map((t) => `<span class="record-tag record-tag--${modeClass}">${t}</span>`).join("")}</div>
              <div class="record-date">${formatDate(r.date)}</div>
            </div>
            <div class="record-score-col">
              <span class="record-score-label">Lay-Z 지수</span>
              <span class="record-score record-score--${modeClass}">${r.score}</span>
            </div>
          </article>`;
            })
            .join("")}

          <a href="#/" class="back-link">메인으로 돌아가기</a>
        </div>
      </section>
    </div>
  `;
}

function render() {
  if (!window.LayData || !app || !pageBody) return;
  const route = location.hash.slice(1) || "/";
  const isHub = route === "/" || route === "";
  const isLaymong = route.startsWith("/laymong");
  pageBody.classList.toggle("page-body--hub", isHub);
  pageBody.classList.toggle("page-body--laymong", isLaymong);

  if (isHub) {
    app.innerHTML = renderHub();
  } else if (route === "/layz") {
    app.innerHTML = renderLayzIntro();
  } else if (route === "/quiz") {
    app.innerHTML = renderQuiz();
  } else if (route === "/loading") {
    app.innerHTML = renderLoading("layz");
  } else if (route === "/result") {
    app.innerHTML = renderResult();
  } else if (route === "/history") {
    app.innerHTML = renderHistory();
  } else if (route === "/laymong") {
    app.innerHTML = renderLaymong();
  } else if (route === "/laymong/encyclopedia") {
    app.innerHTML = renderLaymongEncyclopedia();
  } else if (route === "/laymong/loading") {
    app.innerHTML = renderLoading("laymong");
  } else if (route === "/laymong/result") {
    app.innerHTML = renderLaymongResult();
  } else if (route === "/laymong/history") {
    app.innerHTML = renderLaymongHistory();
  } else {
    navigate("#/");
  }
}

function renderLaymongHistory() {
  const history = getMongHistory();
  const records = history.length > 0 ? history : MONG_DEMO_HISTORY;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--laymong center-panel--laymong-history">
        <div class="panel-inner">
          <h2 class="laymong-history-title">My Mong</h2>
          <div class="laymong-history-head">
            <p class="laymong-history-sub">지난 꿈 기록들을 확인해보세요</p>
            <div class="laymong-history-actions">
              <button data-action="mong-clear-one">기록 삭제</button>
              <span>｜</span>
              <button data-action="mong-clear-all">전체기록 삭제</button>
            </div>
          </div>

          ${records
            .map(
              (r, i) => `
          <article class="mong-history-card">
            <div class="mong-history-card-head">
              <span class="mong-history-card-label">Lay Mong Report</span>
              <span class="mong-history-card-time">${formatRelativeTime(r.date)}</span>
              <button type="button" class="mong-history-close" data-action="mong-clear-one" data-index="${i}" aria-label="닫기">×</button>
            </div>

            <div class="mong-history-section">
              <p class="mong-history-label">꿈 내용</p>
              <h4 class="mong-history-heading">${r.dreamTitle || r.title}</h4>
              <p class="mong-history-text">${r.dreamDetail || r.summary || ""}</p>
            </div>

            <div class="mong-history-section">
              <p class="mong-history-label">운세 요약</p>
              <h4 class="mong-history-heading">${r.badge}</h4>
              <p class="mong-history-text">${r.summary}</p>
              <div class="mong-history-stars">${renderAnalysisStarsInline(r.analysis || [])}</div>
            </div>

            <button class="btn-laymong btn-laymong--card" data-action="mong-view" data-index="${i}">자세히 보기</button>
          </article>`
            )
            .join("")}

          <button class="btn-laymong" data-action="laymong">꿈 해몽하러 가기</button>
          <a href="#/" class="back-link back-link--light">메인으로 돌아가기</a>
        </div>
      </section>
    </div>
  `;
}

function handleClick(e) {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  if (btn.tagName === "A" || btn.tagName === "BUTTON") {
    e.preventDefault();
  }

  if (!window.LayData) return;

  const action = btn.dataset.action;

  switch (action) {
    case "layz-intro":
      navigate("#/layz");
      break;
    case "laymong":
      navigate("#/laymong");
      break;
    case "laymong-submit": {
      const dream = document.getElementById("dream-input")?.value?.trim() || "";
      const agreed = document.getElementById("privacy-check")?.checked;
      if (!dream) {
        alert("꿈 내용을 입력해주세요.");
        return;
      }
      if (!agreed) {
        alert("개인정보 수집 · 이용에 동의해주세요.");
        return;
      }
      state.laymong.dream = dream;
      state.laymong.agreed = agreed;
      state.laymongLoadingStep = 0;
      navigate("#/laymong/loading");
      LAYMONG_LOADING_MESSAGES.forEach((_, i) => {
        setTimeout(() => {
          state.laymongLoadingStep = i;
          if (i < LAYMONG_LOADING_MESSAGES.length - 1) {
            render();
            return;
          }
          state.lastFortune = pickFortune(dream);
          saveMongResult(state.lastFortune, dream);
          navigate("#/laymong/result");
        }, (i + 1) * 1100);
      });
      break;
    }
    case "laymong-encyclopedia":
      navigate("#/laymong/encyclopedia");
      break;
    case "toggle-notice":
      state.laymong.noticeOpen = !state.laymong.noticeOpen;
      render();
      break;
    case "mong-view": {
      const history = getMongHistory();
      const records = history.length > 0 ? history : MONG_DEMO_HISTORY;
      const idx = Number(btn.dataset.index) || 0;
      const r = records[idx];
      if (r) {
        state.lastFortune = {
          score: r.score,
          badge: r.badge,
          title: r.title || r.badge,
          summary: r.summary,
          analysis: r.analysis,
          lucky: r.lucky || { color: "파란색", number: 27, item: "노트" },
          overview: r.overview || r.summary,
        };
        navigate("#/laymong/result");
      }
      break;
    }
    case "laymong-history":
      navigate("#/laymong/history");
      break;
    case "laymong-share":
      openShareModal();
      break;
    case "share-close":
      closeShareModal();
      break;
    case "share-save":
      saveShareImage();
      break;
    case "share-kakao":
      shareKakao();
      break;
    case "gender":
      state.laymong.gender = btn.dataset.gender;
      render();
      break;
    case "mood":
      state.laymong.mood = btn.dataset.mood;
      render();
      break;
    case "start":
      state.answers = [];
      state.currentQ = 0;
      navigate("#/quiz");
      break;
    case "info":
      modal.classList.add("open");
      break;
    case "notice":
      e.preventDefault();
      alert("Lay-Z Check는 오락 목적의 콘텐츠입니다. 의학적 진단이 아닙니다.");
      break;
    case "home":
      navigate("#/");
      break;
    case "prev":
      if (state.currentQ > 0) {
        state.currentQ--;
        state.answers.pop();
        render();
      }
      break;
    case "answer": {
      const idx = Number(btn.dataset.index);
      state.answers.push(QUESTIONS[state.currentQ].options[idx].score);
      if (state.currentQ < QUESTIONS.length - 1) {
        state.currentQ++;
        render();
      } else {
        navigate("#/loading");
        setTimeout(() => {
          const score = calcScore(state.answers);
          const mode = getMode(score);
          state.lastScore = score;
          state.lastMode = mode;
          saveResult(score, mode);
          navigate("#/result");
        }, 1800);
      }
      break;
    }
    case "retry":
      state.answers = [];
      state.currentQ = 0;
      navigate("#/quiz");
      break;
    case "history":
      navigate("#/history");
      break;
    case "share":
      if (navigator.share) {
        navigator.share({
          title: "Lay-Z Check 결과",
          text: `오늘 나의 Lay-Z 지수는 ${state.lastScore}점! (${state.lastMode?.label})`,
          url: location.href,
        });
      } else {
        alert(`나의 Lay-Z 지수: ${state.lastScore}점 (${state.lastMode?.label})`);
      }
      break;
    case "clear-all":
      if (confirm("모든 Lay-Z 기록을 삭제할까요?\n삭제한 기록은 다시 복구할 수 없어요.")) {
        localStorage.removeItem("layz_history");
        render();
      }
      break;
    case "clear-one":
      if (confirm("이 Lay-Z 기록을 삭제할까요?\n삭제한 기록은 다시 복구할 수 없어요.")) {
        const h = getHistory();
        h.shift();
        localStorage.setItem("layz_history", JSON.stringify(h));
        render();
      }
      break;
    case "mong-clear-all":
      if (confirm("모든 꿈 기록을 삭제할까요?")) {
        localStorage.removeItem("laymong_history");
        render();
      }
      break;
    case "mong-clear-one": {
      if (!confirm("이 꿈 기록을 삭제할까요?")) break;
      const h = getMongHistory();
      if (h.length === 0) break;
      const idx = btn.dataset.index != null ? Number(btn.dataset.index) : 0;
      h.splice(idx, 1);
      localStorage.setItem("laymong_history", JSON.stringify(h));
      render();
      break;
    }
  }
}

function boot() {
  if (!window.LayData || !app || !pageBody) return;

  modalClose?.addEventListener("click", () => modal.classList.remove("open"));
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  shareModal?.addEventListener("click", (e) => {
    if (e.target === shareModal) closeShareModal();
  });

  document.addEventListener("click", handleClick);
  window.addEventListener("hashchange", render);
  render();
}

boot();
