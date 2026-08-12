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
  getMode = () => ({}),
  getResultDetails = () => ({}),
  calcScore = () => 0,
  getHistory = () => [],
  saveResult = () => {},
} = window.LayData || {};

const DIALECTS = [
  { id: "chungcheong", label: "충청도" },
  { id: "gyeongsang", label: "경상도" },
  { id: "jeolla", label: "전라도" },
];

function normalizeAiText(text, options) {
  if (window.LayTextFormat) return window.LayTextFormat.formatProse(text, options);
  if (text == null || text === "") return "";
  return String(text).replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}

function formatAiHtml(text, options) {
  if (window.LayTextFormat) return window.LayTextFormat.formatHtml(text, options);
  return normalizeAiText(text, options)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const app = document.getElementById("app");
const pageBody = document.querySelector(".page-body");
const modal = document.getElementById("info-modal");
const modalClose = document.getElementById("modal-close");
const shareModal = document.getElementById("share-modal");

let state = {
  productVersion: 1,
  dialect: null,
  answers: [],
  currentQ: 0,
  lastScore: null,
  lastMode: null,
  layzAi: null,
  mediaRec: null,
  promisResult: null,
  promisAi: null,
  layzNoticeOpen: false,
  shareKind: "layz",
};

function versionChipLabel() {
  if (state.productVersion === 2) return "사투리 버전";
  if (state.productVersion === 3) return "풍성 답변 + 콘텐츠 추천";
  if (state.productVersion === 4) return "PROMIS® 공신력 버전";
  return "기본 제품";
}

function activeQuestions() {
  if (state.productVersion === 4 && window.PromisData) return window.PromisData.QUESTIONS;
  return QUESTIONS;
}

const LAYZ_NOTICE_ITEMS = [
  "본 테스트는 재미와 브랜드 경험을 목적으로 제공되며, 의료 · 건강 · 심리 상태를 진단하기 위한 서비스가 아닙니다.",
  "테스트 결과는 참여자가 선택한 응답을 기준으로 산출됩니다.",
  "참여 시점과 컨디션, 응답 방식에 따라 결과가 달라질 수 있습니다.",
  "테스트 결과의 정확성은 보장하지 않으며 결과만을 근거로 건강 또는 생활과 관련된 중요한 결정을 내리지 않기를 권장합니다.",
  "지속적인 피로, 수면 문제 또는 신체적 · 심리적 불편이 있는 경우 테스트 결과와 관계없이 관련 전문가와 상담하시기 바랍니다.",
  "결과 카드를 외부 SNS 등에 공유하는 경우, 카드 또는 화면에 개인정보가 포함되어 있지 않은지 확인해 주세요.",
  "외부 플랫폼에 공유된 콘텐츠는 해당 플랫폼의 운영정책이 적용됩니다.",
  "테스트 문항, 결과 유형, 점수 산정 기준 및 운영 방식은 서비스 개선이나 당사 사정에 따라 사전 안내 후 변경될 수 있습니다.",
  "불가피한 경우 서비스가 일시 중단되거나 종료될 수 있습니다.",
  "테스트에 사용된 모든 문구, 캐릭터, 이미지 및 결과 카드의 저작권은 레이레이에 있습니다.",
  "당사의 사전 서면 동의 없이 콘텐츠를 복제 · 가공 · 배포하거나 상업적으로 이용하는 행위를 금지하며, 이를 위반할 경우 관련 법령에 따라 법적 조치를 취할 수 있습니다.",
];

function renderNoticeList(items) {
  return `<ul class="notice-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
}

function dialectLabel(id) {
  return DIALECTS.find((d) => d.id === id)?.label || "";
}

function resetQuizState() {
  state.answers = [];
  state.currentQ = 0;
  state.lastScore = null;
  state.lastMode = null;
  state.layzAi = null;
  state.mediaRec = null;
  state.promisResult = null;
  state.promisAi = null;
}

async function runPromisAiFlow() {
  if (!window.PromisData) {
    navigate("#/layz");
    return;
  }
  const scored = window.PromisData.scoreAnswers(state.answers);
  if (!scored) {
    alert("응답이 부족해 점수를 계산하지 못했어요. 다시 시도해 주세요.");
    navigate("#/layz");
    return;
  }
  state.promisResult = scored;
  state.promisAi = null;
  let ai = null;
  if (window.PromisAi) {
    try {
      ai = await window.PromisAi.fetchCopy(scored, state.answers, window.PromisData.QUESTIONS);
    } catch (e) {
      ai = null;
    }
  }
  state.promisAi = window.PromisAi
    ? window.PromisAi.mapToUi(ai, scored)
    : null;
  navigate("#/result");
}

async function runLayZAiFlow() {
  const score = calcScore(state.answers);
  const mode = getMode(score);
  state.lastScore = score;
  state.lastMode = mode;
  state.layzAi = null;
  state.mediaRec = null;
  const options = {};
  if (state.productVersion === 2 && state.dialect) options.dialect = state.dialect;
  if (state.productVersion === 3) options.rich = true;
  const hasOptions = Object.keys(options).length > 0;
  let ai = null;
  if (window.LayZAi) {
    try {
      ai = await window.LayZAi.fetchCopy(
        score,
        mode,
        state.answers,
        QUESTIONS,
        hasOptions ? options : undefined
      );
    } catch (e) {
      ai = null;
    }
  }
  state.layzAi = window.LayZAi
    ? window.LayZAi.mapToUi(ai, mode, RESULT_COPY, getResultDetails, {
        rich: state.productVersion === 3,
      })
    : getResultDetails(mode.name);

  if (state.productVersion === 3 && window.LayZMedia) {
    try {
      state.mediaRec = await window.LayZMedia.fetchRecommendations(score, mode);
    } catch (e) {
      state.mediaRec = null;
    }
  }

  saveResult(score, mode, state.layzAi);
  navigate("#/result");
}

function renderSleepGuide(rx, fallbackItems) {
  if (!rx || !rx.items || !rx.items.length) {
    return fallbackItems;
  }
  return `
    <p class="sleep-guide-label">레이레이 수면 가이드</p>
    <h3>${formatAiHtml(rx.title || "편안한 밤을 위한 팁", { singleLine: true })}</h3>
    <div class="guide-list">
      ${rx.items
        .map(
          (item, i) => `
        <div class="guide-item">
          <span class="guide-num">${String(i + 1).padStart(2, "0")}</span>
          <div>
            ${item.title ? `<strong>${formatAiHtml(item.title, { singleLine: true })}</strong>` : ""}
            <p>${formatAiHtml(item.text || item)}</p>
          </div>
        </div>`
        )
        .join("")}
    </div>`;
}

function layzAnswerStats(score) {
  const sleepFeel = score >= 55 ? "피곤" : "만족";
  const deficit = score >= 60 ? "2~3시간" : score >= 45 ? "1시간" : "0시간";
  return [
    { label: "혈압", value: "정상" },
    { label: "수면 상태", value: sleepFeel },
    { label: "수면 부족", value: deficit },
  ];
}

function openShareModal() {
  state.shareKind = "layz";
  const labelEl = document.querySelector(".share-card-label");
  const titleEl = document.getElementById("share-modal-title");
  const scoreEl = document.getElementById("share-score");
  const badgeEl = document.getElementById("share-badge");
  const summaryEl = document.getElementById("share-summary");
  const card = document.getElementById("share-card-capture");
  const score = state.lastScore;
  const mode = state.lastMode;
  const ai = state.layzAi;
  const copy = RESULT_COPY[mode?.name] || RESULT_COPY.Easy;
  const title = ai?.title || copy.title;
  const desc = ai?.desc || copy.desc;
  const shareDesc = window.LayTextFormat ? window.LayTextFormat.formatResultDesc(desc) : desc;
  if (labelEl) labelEl.textContent = "Lay-Z Report";
  if (titleEl) titleEl.textContent = "오늘 나의 게으름 지수는?";
  if (scoreEl) scoreEl.textContent = score ?? "";
  if (badgeEl) badgeEl.textContent = mode?.label || title;
  if (summaryEl) summaryEl.textContent = normalizeAiText(shareDesc);
  card?.classList.add("share-card--layz");
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
      backgroundColor: "#fff5ef",
      cacheBust: true,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `layz-report-${Date.now()}.png`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[LayLay] share image save failed", err);
    alert("이미지 저장에 실패했어요. 화면을 길게 눌러 저장해주세요.");
  }
}

async function shareKakao() {
  const mode = state.lastMode;
  const ai = state.layzAi;
  const copy = RESULT_COPY[mode?.name] || RESULT_COPY.Easy;
  const text = `Lay-Z Report\n${state.lastScore}점 · ${mode?.label || ""}\n${ai?.desc || copy.desc}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Lay-Z 결과",
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
  const target = hash.startsWith("#") ? hash : "#" + hash;
  if (target !== location.hash) {
    location.hash = target;
  } else {
    render();
  }
}

function syncVersionNav() {
  document.querySelectorAll(".erp-nav-item[data-version]").forEach((el) => {
    const v = Number(el.dataset.version);
    el.classList.toggle("is-active", v === state.productVersion);
  });
}

function renderDialectPicker() {
  return `
    <div class="dialect-picker">
      <p class="dialect-picker-label">어떤 사투리로 들을까요?</p>
      <div class="dialect-picker-grid">
        ${DIALECTS.map(
          (d) => `
          <button
            type="button"
            class="dialect-btn ${state.dialect === d.id ? "is-selected" : ""}"
            data-action="select-dialect"
            data-dialect="${d.id}"
          >
            <span class="dialect-btn-name">${d.label}</span>
          </button>`
        ).join("")}
      </div>
      ${
        state.dialect
          ? `<p class="dialect-picker-selected">${dialectLabel(state.dialect)} 말투로 결과가 나와요</p>`
          : `<p class="dialect-picker-selected dialect-picker-selected--muted">지역을 먼저 골라주세요</p>`
      }
    </div>
  `;
}

function renderLayzIntro() {
  const isDialectVersion = state.productVersion === 2;
  const isRichVersion = state.productVersion === 3;
  const isPromisVersion = state.productVersion === 4;
  const startDisabled = isDialectVersion && !state.dialect;
  const subtitle = isDialectVersion
    ? "동일한 8가지 문의로 측정하고, 고른 지역 말투로 결과를 들려드려요"
    : isRichVersion
      ? "기본과 같은 문의지만 답변이 더 풍성하고, 점수에 따라 유튜브·영화 추천까지 받아보세요"
      : isPromisVersion
        ? "NIH PROMIS® Global Health 문항으로 신체·정신 건강 T-score를 확인합니다"
        : "8가지 질문으로 오늘의 Lay-Z 지수를 확인해보세요";
  const title = isPromisVersion ? "PROMIS® Global Health" : "Lay-Z Check";
  const bold = isPromisVersion ? "공신력 있는 자기보고 건강 척도" : "오늘 나의 게으름 지수는?";
  const note = isPromisVersion ? "약 2분 · GPH-4 / GMH-4 8문항" : "약 1분이면 충분해요!";
  const infoLabel = isPromisVersion ? "출처·채점 기준 보기" : "Lay-Z Check란?";

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--tall ${isPromisVersion ? "center-panel--promis" : ""}">
        <p class="version-chip">${versionChipLabel()}</p>
        <h1 class="title-layz title-layz--intro">${title}</h1>
        <p class="subtitle-bold">${bold}</p>
        <p class="subtitle">${subtitle}</p>

        <div class="hero-illust">
          <img src="assets/hero-character.svg" alt="매트리스 위에서 자는 캐릭터 일러스트" />
        </div>

        ${isDialectVersion ? renderDialectPicker() : ""}
        ${isPromisVersion ? renderPromisSourceCard() : ""}

        <p class="landing-note">${note}</p>
        <div class="btn-stack">
          <button class="btn btn-primary ${startDisabled ? "is-disabled" : ""}" data-action="start" ${
            startDisabled ? "aria-disabled=\"true\"" : ""
          }>지금 바로 시작하기</button>
          <button class="btn btn-outline btn-outline--sm" data-action="${
            isPromisVersion ? "promis-info" : "info"
          }">${infoLabel}</button>
        </div>
        <div class="layz-notice-block">
          <button type="button" class="landing-footer-link layz-notice ${state.layzNoticeOpen ? "open" : ""}" data-action="toggle-layz-notice">
            이용 전 확인해주세요
            <img src="assets/chevron.svg" alt="" />
          </button>
          ${state.layzNoticeOpen ? `<div class="layz-notice-body">${renderNoticeList(LAYZ_NOTICE_ITEMS)}</div>` : ""}
        </div>
      </section>
    </div>
  `;
}

function renderPromisSourceCard() {
  const src = window.PromisData?.SOURCE;
  if (!src) return "";
  return `
    <div class="promis-source-card">
      <p class="promis-source-label">근거 문헌</p>
      <p class="promis-source-title">${src.title}</p>
      <p class="promis-source-meta">${src.authors} · ${src.journal} (${src.year})</p>
      <p class="promis-source-meta">DOI: ${src.doi} · ${src.pmcid}</p>
      <a class="promis-source-link" href="${src.url}" target="_blank" rel="noopener noreferrer">PMC 원문 보기</a>
    </div>
  `;
}

function renderQuiz() {
  const list = activeQuestions();
  const q = list[state.currentQ];
  const total = list.length;
  const progress = ((state.currentQ + 1) / total) * 100;
  const num = String(state.currentQ + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const isPromis = state.productVersion === 4;
  const dialectNote =
    state.productVersion === 2 && state.dialect
      ? `<p class="quiz-dialect-note">${dialectLabel(state.dialect)} 말투로 결과가 준비돼요</p>`
      : "";
  const promisNote = isPromis
    ? `<p class="quiz-dialect-note">${q.help || "PROMIS® Global Health"}</p>`
    : "";
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
      <section class="center-panel center-panel--tall ${isPromis ? "center-panel--promis" : ""}">
        <div class="panel-inner">
          <h2 class="title-layz title-layz--sm">${isPromis ? "PROMIS® Check" : "Lay-Z Check"}</h2>
          <p class="quiz-subtitle">${
            isPromis ? "신체 · 정신 글로벌 건강 문항" : "오늘 나의 게으름 지수는?"
          }</p>
          ${dialectNote}
          ${promisNote}

          <div class="quiz-progress">
            <div class="quiz-progress-num"><strong>${num}</strong> / ${totalLabel}</div>
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

function renderLoading() {
  const loadingText =
    state.productVersion === 4
      ? "PROMIS T-score와 해석 리포트를 준비하는 중 · · ·"
      : state.productVersion === 3
        ? "풍성한 리포트와 콘텐츠 추천을 찾는 중 · · ·"
        : "8개의 답변을 차근차근 살펴보는 중 · · ·";
  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--loading">
        <div class="loading-panel">
          <p class="loading-text">${loadingText}</p>
          <div class="loading-illust">
            <img src="assets/loading-character.svg" alt="분석 중 일러스트" />
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderMediaSection() {
  const media = state.mediaRec;
  if (!media || !Array.isArray(media.items) || !media.items.length) return "";
  const kindLabel = media.label || (media.kind === "movie" ? "영화 추천" : "유튜브 추천");
  const bandNote =
    media.scoreBand === "0-39"
      ? "0~39점 · 가벼운 활력 콘텐츠"
      : media.scoreBand === "40-69"
        ? "40~69점 · 위로·힐링 영화"
        : "70~99점 · 수면·이완 콘텐츠";

  return `
    <section class="media-rec">
      <p class="media-rec-kicker">SECTION 03 · ${kindLabel}</p>
      <h3 class="section-title section-title--center">${formatAiHtml(
        media.sectionTitle || `오늘 점수에 맞는 ${kindLabel}`,
        { singleLine: true }
      )}</h3>
      <p class="media-rec-sub">${bandNote}</p>
      <div class="media-rec-list">
        ${media.items
          .map((item, i) => {
            const kindText = item.kind === "movie" ? "영화" : "유튜브";
            const thumb = String(item.thumb || "").trim();
            const thumbHtml = thumb
              ? `<img class="media-rec-thumb-img" src="${thumb}" alt="${kindText} 썸네일" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('.media-rec-thumb').classList.add('is-fallback'); this.remove();" />`
              : "";
            return `
          <a class="media-rec-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
            <div class="media-rec-thumb ${thumb ? "" : "is-fallback"}">
              ${thumbHtml}
              <span class="media-rec-thumb-fallback">${kindText}</span>
              <span class="media-rec-num">${String(i + 1).padStart(2, "0")}</span>
            </div>
            <div class="media-rec-body">
              <span class="media-rec-kind">${kindText}</span>
              <h4>${formatAiHtml(item.title, { singleLine: true })}</h4>
              <p>${formatAiHtml(item.reason)}</p>
              <span class="media-rec-link">${
                item.kind === "movie"
                  ? "영화 정보 보기 →"
                  : item.videoId
                    ? "유튜브에서 재생 →"
                    : "유튜브 검색 →"
              }</span>
            </div>
          </a>`;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderPromisResult() {
  const r = state.promisResult;
  const ai = state.promisAi;
  if (!r) {
    return `<div class="center-panel-wrap"><section class="center-panel"><p>결과 데이터가 없습니다.</p><button class="btn btn-primary" data-action="layz-intro">돌아가기</button></section></div>`;
  }
  const src = r.source || window.PromisData?.SOURCE || {};
  const title = ai?.title || `신체 T ${r.physicalT} · 정신 T ${r.mentalT}`;
  const desc = ai?.desc || "";
  const summary = ai?.summary || "";
  const recommends = ai?.recommends || [];

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--result center-panel--promis">
        <div class="panel-inner">
          <div class="result-hero">
            <div class="result-card-label">PROMIS® Global Health Report</div>
            <div class="result-card-title">신체 · 정신 건강 T-score</div>
            <div class="promis-score-grid">
              <div class="promis-score-box">
                <span class="promis-score-label">GPH-4 신체</span>
                <strong class="promis-score-num">${r.physicalT}</strong>
                <span class="promis-score-band">${r.physicalBand.label}</span>
                <span class="promis-score-raw">raw ${r.physicalRaw}/20</span>
              </div>
              <div class="promis-score-box">
                <span class="promis-score-label">GMH-4 정신</span>
                <strong class="promis-score-num">${r.mentalT}</strong>
                <span class="promis-score-band">${r.mentalBand.label}</span>
                <span class="promis-score-raw">raw ${r.mentalRaw}/20</span>
              </div>
            </div>
            <p class="promis-ref-note">참고 GPH-2 T ${r.gph2T} · GMH-2 T ${r.gmh2T} · 결합 평균 T ${r.combinedT}</p>
            <p class="promis-ref-note">T=50은 미국 일반인구 평균, SD≈10 · 높을수록 해당 영역 건강이 더 좋음</p>

            <div class="result-message">
              <h3>${formatAiHtml(title)}</h3>
              <p>${formatAiHtml(desc)}</p>
            </div>

            <div class="btn-stack">
              <button class="btn btn-outline btn-outline--sm" data-action="retry">다시 측정하기</button>
            </div>
          </div>

          <h3 class="section-title section-title--center">해석 요약</h3>
          <p class="result-summary">${formatAiHtml(summary)}</p>

          <h3 class="section-title section-title--center">일상 제안</h3>
          <div class="recommend-list">
            ${recommends
              .map(
                (item) => `
              <article class="recommend-card recommend-card--full">
                <span class="badge">${item.badge}</span>
                <h4>${formatAiHtml(item.title)}</h4>
                <p>${formatAiHtml(item.desc)}</p>
              </article>`
              )
              .join("")}
          </div>

          <aside class="promis-citation">
            <h4>출처 / Source</h4>
            <p><strong>${src.title || ""}</strong></p>
            <p>${src.authors || ""}</p>
            <p>${src.journal || ""} (${src.year || ""})</p>
            <p>DOI: <a href="https://doi.org/${src.doi}" target="_blank" rel="noopener noreferrer">${src.doi}</a></p>
            <p>PMCID: ${src.pmcid || ""} · PMID: ${src.pmid || ""}</p>
            <p>Instrument: ${src.instrument || ""}</p>
            <p class="promis-citation-note">${src.note || ""}</p>
            <a class="promis-source-link" href="${src.url || "#"}" target="_blank" rel="noopener noreferrer">PMC 논문 원문</a>
          </aside>

          <div class="btn-stack result-bottom-btns">
            <button class="btn btn-primary" data-action="retry">다시 측정하기</button>
            <a href="#/layz" class="back-link" data-action="layz-intro">메인으로 돌아가기</a>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderResult() {
  if (state.productVersion === 4) return renderPromisResult();

  const score = state.lastScore;
  const mode = state.lastMode;
  const copy = RESULT_COPY[mode.name];
  const ai = state.layzAi;
  const details = ai && ai.recommends ? ai : getResultDetails(mode.name);
  const displayTitle = ai && ai.title ? ai.title : copy.title;
  const displayDesc = ai && ai.desc ? ai.desc : copy.desc;
  const displayTags = (ai && ai.tags && ai.tags.length ? ai.tags : copy.tags).slice(0, 3);
  const summaryText = ai && ai.summary ? ai.summary : details.summary;
  const recommends = ai && ai.recommends ? ai.recommends : details.recommends;
  const pointerPct = Math.min(100, Math.max(0, score));
  const modeIndex = ["Active", "Easy", "Slow", "Lazy", "LayLay"].indexOf(mode.name);
  const pointerLeft = modeIndex >= 0 ? (modeIndex / 4) * 100 : pointerPct;
  const stats = layzAnswerStats(score);
  const dialectBadge =
    state.productVersion === 2 && state.dialect
      ? `<span class="result-dialect-badge">${dialectLabel(state.dialect)} 말투</span>`
      : "";

  const fallbackSleep = `
    <p class="sleep-guide-label">레이레이 수면 가이드</p>
    <h3>편안한 밤을 위한 팁</h3>
    <div class="guide-list">
      <div class="guide-item"><span class="guide-num">01</span><div><strong>정해진 시간에 잠자기</strong><p>매일 같은 시간에 자고 일어나면 몸이 리듬을 찾을 수 있어요.</p></div></div>
      <div class="guide-item"><span class="guide-num">02</span><div><strong>스마트폰 멀리하기</strong><p>잠들기 1시간 전에는 스마트폰을 멀리해 보세요.\n더 깊은 잠을 도와드릴 거예요.</p></div></div>
      <div class="guide-item"><span class="guide-num">03</span><div><strong>편안한 수면 환경 만들기</strong><p>어두운 방과 적절한 온도를 유지하면\n더욱 편안한 수면을 누릴 수 있어요.</p></div></div>
    </div>`;

  return `
    <div class="center-panel-wrap">
      <section class="center-panel center-panel--result">
        <div class="panel-inner">
          <div class="result-hero">
            <div class="result-card-label">Lay-Z Report ${dialectBadge}</div>
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
              <h3>${formatAiHtml(displayTitle)}</h3>
              <p>${formatAiHtml(displayDesc)}</p>
            </div>

            <div class="result-tags">
              ${displayTags.map((t) => `<span class="tag tag--orange">${t}</span>`).join("")}
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
            ${stats.map((s) => `<div class="stat-box"><dt>${s.label}</dt><dd>${s.value}</dd></div>`).join("")}
          </div>
          <p class="result-summary">${formatAiHtml(summaryText)}</p>

          <h3 class="section-title section-title--center">오늘 컨디션에 맞는 행동 추천</h3>
          <div class="recommend-list">
            ${recommends
              .map(
                (r) => `
              <article class="recommend-card recommend-card--full">
                <span class="badge">${r.badge}</span>
                <h4>${formatAiHtml(r.title)}</h4>
                <p>${formatAiHtml(r.desc)}</p>
              </article>`
              )
              .join("")}
          </div>

          <div class="sleep-guide">
            ${renderSleepGuide(ai && ai.rx ? ai.rx : null, fallbackSleep)}
          </div>

          ${state.productVersion === 3 ? renderMediaSection() : ""}

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

          <a href="#/layz" class="back-link" data-action="layz-intro">메인으로 돌아가기</a>
        </div>
      </section>
    </div>
  `;
}

function normalizeRoute(hash) {
  const raw = (hash || location.hash || "#/").replace(/^#/, "");
  if (!raw || raw === "/") return "/";
  return raw.startsWith("/") ? raw : "/" + raw;
}

function syncPageBodyTheme() {
  if (!pageBody) return;
  pageBody.classList.remove("page-body--hub", "page-body--laymong");
}

function render() {
  if (!window.LayData || !app || !pageBody) return;
  const route = normalizeRoute(location.hash);
  syncPageBodyTheme();
  syncVersionNav();

  if (route === "/" || route === "/layz") {
    app.innerHTML = renderLayzIntro();
  } else if (route === "/quiz") {
    app.innerHTML = renderQuiz();
  } else if (route === "/loading") {
    app.innerHTML = renderLoading();
  } else if (route === "/result") {
    app.innerHTML = renderResult();
  } else if (route === "/history") {
    app.innerHTML = renderHistory();
  } else {
    navigate("#/layz");
  }
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
    case "set-version": {
      const next = Number(btn.dataset.version) || 1;
      if (next === state.productVersion && normalizeRoute(location.hash) === "/layz") {
        syncVersionNav();
        break;
      }
      state.productVersion = next;
      state.dialect = next === 2 ? state.dialect : null;
      resetQuizState();
      navigate("#/layz");
      break;
    }
    case "select-dialect":
      state.dialect = btn.dataset.dialect || null;
      render();
      break;
    case "layz-intro":
      navigate("#/layz");
      break;
    case "toggle-layz-notice":
      state.layzNoticeOpen = !state.layzNoticeOpen;
      render();
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
    case "start":
      if (state.productVersion === 2 && !state.dialect) {
        alert("충청도 / 경상도 / 전라도 중 하나를 먼저 골라주세요.");
        return;
      }
      if (state.productVersion === 4 && !window.PromisData) {
        alert("PROMIS 데이터 모듈을 불러오지 못했어요.");
        return;
      }
      state.answers = [];
      state.currentQ = 0;
      navigate("#/quiz");
      break;
    case "info":
      modal.classList.add("open");
      break;
    case "promis-info":
      alert(
        [
          "출처: Hays et al., J Patient Rep Outcomes. 2017;1:2",
          "DOI: 10.1186/s41687-017-0003-8 · PMCID: PMC5934936",
          "",
          "문항: PROMIS® Global Health v1.2",
          "점수: GPH-4 / GMH-4 raw(4–20) → T-score",
          "참고: 논문 초점 척도 GPH-2 / GMH-2도 함께 산출",
          "",
          "본 결과는 자기보고 스크리닝용이며 의료 진단이 아닙니다.",
        ].join("\n")
      );
      break;
    case "home":
      navigate("#/layz");
      break;
    case "prev":
      if (state.currentQ > 0) {
        state.currentQ--;
        state.answers.pop();
        render();
      }
      break;
    case "answer": {
      const list = activeQuestions();
      const idx = Number(btn.dataset.index);
      const q = list[state.currentQ];
      const opt = q.options[idx];
      if (state.productVersion === 4) {
        state.answers.push({
          id: q.id,
          domain: q.domain,
          value: opt.value,
          label: opt.label,
          qIndex: state.currentQ,
        });
      } else {
        state.answers.push({ score: opt.score, label: opt.label, qIndex: state.currentQ });
      }
      if (state.currentQ < list.length - 1) {
        state.currentQ++;
        render();
      } else {
        navigate("#/loading");
        if (state.productVersion === 4) runPromisAiFlow();
        else runLayZAiFlow();
      }
      break;
    }
    case "retry":
      state.answers = [];
      state.currentQ = 0;
      state.layzAi = null;
      state.mediaRec = null;
      state.promisResult = null;
      state.promisAi = null;
      if (state.productVersion === 2 || state.productVersion === 4) {
        navigate("#/layz");
      } else {
        navigate("#/quiz");
      }
      break;
    case "history":
      navigate("#/history");
      break;
    case "share":
      openShareModal();
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
