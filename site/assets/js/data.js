(function () {
const QUESTIONS = [
  {
    id: 1,
    text: "오늘 아침, 알람이 울리고\n실제로 일어나기까지 걸린 시간은?",
    options: [
      { label: "알람 울리자마자 바로", score: 0 },
      { label: "5~10분? 한번만 더 눈 감았다가 일어남", score: 1 },
      { label: "30분은 뒤척임. 알람도 여러 번 껐음", score: 2 },
      { label: "솔직히 기억 없음. 어떻게 일어난 건지도 모름", score: 3 },
    ],
  },
  {
    id: 2,
    text: "오늘 오전, 내 머릿속 상태를\n가장 잘 표현한 건?",
    options: [
      { label: "맑음. 바로 업무/일정에 집중 가능", score: 0 },
      { label: "약간 멍함. 커피 한 잔이면 괜찮음", score: 1 },
      { label: "안개 낀 느낌. 생각이 느리게 움직임", score: 2 },
      { label: "완전 오프라인. 뇌가 휴가 중", score: 3 },
    ],
  },
  {
    id: 3,
    text: "오늘 점심 후,\n가장 하고 싶은 건?",
    options: [
      { label: "산책이나 가벼운 운동", score: 0 },
      { label: "카페에서 잠깐 쉬기", score: 1 },
      { label: "소파나 침대에 눕기", score: 2 },
      { label: "아무것도 하기 싫음. 눈 감고 싶음", score: 3 },
    ],
  },
  {
    id: 4,
    text: "오늘 해야 할 일 목록을 보면?",
    options: [
      { label: "할 만하다. 바로 시작할 수 있음", score: 0 },
      { label: "좀 많긴 한데, 하나씩 하면 됨", score: 1 },
      { label: "벌써 지친다. 미루고 싶음", score: 2 },
      { label: "목록 자체를 보기 싫음", score: 3 },
    ],
  },
  {
    id: 5,
    text: "오늘 몸의 무게감은?",
    options: [
      { label: "가볍다. 활동하기 좋은 날", score: 0 },
      { label: "평소와 비슷함", score: 1 },
      { label: "몸이 무겁고 움직이기 귀찮음", score: 2 },
      { label: "중력이 2배인 것 같음", score: 3 },
    ],
  },
  {
    id: 6,
    text: "오늘 사람 만나는 것에 대해?",
    options: [
      { label: "만나도 괜찮음. 에너지 있음", score: 0 },
      { label: "필요하면 만남", score: 1 },
      { label: "가급적 혼자 있고 싶음", score: 2 },
      { label: "아무도 만나기 싫음. 연락도 무시하고 싶음", score: 3 },
    ],
  },
  {
    id: 7,
    text: "오늘 저녁, 집에 가면?",
    options: [
      { label: "운동이나 취미 활동", score: 0 },
      { label: "밥 먹고 가볍게 쉬기", score: 1 },
      { label: "바로 눕기", score: 2 },
      { label: "문 닫고 세상과 단절", score: 3 },
    ],
  },
  {
    id: 8,
    text: "지금 이 순간, 가장 끌리는 건?",
    options: [
      { label: "뭔가 productive한 일", score: 0 },
      { label: "가벼운 휴식", score: 1 },
      { label: "깊은 잠", score: 2 },
      { label: "영원한 누움", score: 3 },
    ],
  },
];

const MODES = [
  { min: 0, max: 19, name: "Active", label: "Active 모드", color: "#4caf50" },
  { min: 20, max: 39, name: "Easy", label: "Easy 모드", color: "#ff5e04" },
  { min: 40, max: 59, name: "Slow", label: "Slow 모드", color: "#7eb8d4" },
  { min: 60, max: 79, name: "Lazy", label: "Lazy 모드", color: "#9c27b0" },
  { min: 80, max: 99, name: "LayLay", label: "LayLay 모드", color: "#e91e63" },
];

const RESULT_COPY = {
  Active: {
    title: "오늘은 활력 충전 완료!",
    desc: "에너지가 넘치는 날이야. 이 기세로 가보자!",
    tags: ["아침형 인간", "생산성 MAX", "오늘의 MVP"],
  },
  Easy: {
    title: "슬슬... 레이지해지는 중",
    desc: "오늘은 정말 느긋하게 지나가는 날이야!",
    tags: ["뇌 셔터 내림", "피곤 구독중", "현관 탈주 불가형"],
    summary:
      "알람이 울리면 5~10분 더 잠에 빠져드는 너, 오늘은 그럴만한 날이야.\n머릿속은 셔터 내리고 피곤함이 가득한 것 같고 어깨와 목은 뭉쳐있어.\n딱히 힘든 일은 없지만 그냥 하루를 버티며 지나가는 느낌이야. 오늘은 좀 느리게 흘러가도 괜찮아, 너 자신에게 여유를 줘.",
    recommends: [
      {
        badge: "휴식",
        title: "소파에서 잠깐 휴식 취하기",
        desc: "소파에 누워서 잠깐의 휴식을 취해보는 건 어때? 짧은 낮잠이 뇌의 피로를 풀어줄 수 있어.\n몸이 느리게 움직일 때, 이런 작은 휴식이 큰 도움이 돼! 잠깐의 휴식으로 다시 에너지를 충전해보자.",
      },
      {
        badge: "활동",
        title: "가벼운 스트레칭하기",
        desc: "하루가 느리게 지나간다고 해서 움직이지 말라는 법은 없어! 짧은 시간이라도 가벼운 스트레칭으로 몸을 풀어보자.\n혈액순환이 좋아지면 피로감도 덜 느낄 수 있으니, 잠깐의 운동이 큰 도움이 될 거야!",
      },
      {
        badge: "마음 챙김",
        title: "짧은 명상 시간 가지기",
        desc: "잠깐의 고요함이 필요할 때, 명상은 정말 좋은 선택이야. 5분만이라도 조용한 곳에 앉아 호흡에 집중해 보면 마음이 한결 편해질 거야.\n마음이 가벼워지면 피로감도 줄어들 수 있으니, 시도해보길 추천해!",
      },
    ],
  },
  Slow: {
    title: "집에 가고 싶어 미칠 것 같음",
    desc: "천천히 가도 괜찮아. 오늘은 속도를 낮춰보자.",
    tags: ["에너지 절약 모드", "업무 과부하", "어딘가 아픈 것 같아"],
  },
  Lazy: {
    title: "오늘은 누움 전문가",
    desc: "무리하지 마. 충분한 휴식이 필요한 날이야.",
    tags: ["중력 2배", "이불 속 천국", "알람 무시형"],
  },
  LayLay: {
    title: "완전 LayLay 모드 달성",
    desc: "오늘은 세상과 잠시 이별해도 돼.",
    tags: ["영원한 누움", "연락 두절", "레이지 마스터"],
  },
};

function getMode(score) {
  return MODES.find((m) => score >= m.min && score <= m.max) || MODES[1];
}

const DEFAULT_RECOMMENDS = RESULT_COPY.Easy.recommends;
const DEFAULT_SUMMARY = RESULT_COPY.Easy.summary;

function getResultDetails(modeName) {
  const copy = RESULT_COPY[modeName] || RESULT_COPY.Easy;
  const prose = (text, singleLine) => {
    if (window.LayTextFormat) {
      return window.LayTextFormat.formatProse(text, singleLine ? { singleLine: true } : undefined);
    }
    return String(text || "").trim();
  };
  return {
    summary: prose(copy.summary || DEFAULT_SUMMARY),
    recommends: (copy.recommends || DEFAULT_RECOMMENDS).map((r) => ({
      badge: r.badge,
      title: r.title,
      desc: prose(r.desc),
    })),
  };
}

function calcScore(answers) {
  const raw = answers.reduce(
    (sum, a) => sum + (typeof a === "number" ? a : a && typeof a.score === "number" ? a.score : 0),
    0
  );
  const max = QUESTIONS.length * 3;
  return Math.round((raw / max) * 99);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem("layz_history") || "[]");
  } catch {
    return [];
  }
}

const MOOD_OPTIONS = [
  { emoji: "😌", label: "평온한" },
  { emoji: "🥰", label: "행복한" },
  { emoji: "😰", label: "불안한" },
  { emoji: "😱", label: "무서운" },
  { emoji: "🌀", label: "혼란스러운" },
];

const FORTUNES = [
  {
    keyword: "바다",
    score: 72,
    badge: "마음이 넓어지는 하루",
    title: "마음이 넓어지는 하루",
    summary: "꿈속 바다는 내면의 여유를 상징해요. 오늘은 큰 결정보다 흐름을 믿어도 좋아요.",
    detail: "물결처럼 잔잔하게 하루가 흘러가요. 주변 사람에게 먼저 안부를 건네면 좋은 기운이 돌아올 거예요.",
    analysis: [
      { label: "재물운", stars: 4, level: "좋음" },
      { label: "애정운", stars: 3, level: "보통" },
      { label: "건강운", stars: 4, level: "좋음" },
      { label: "직장운", stars: 3, level: "보통" },
    ],
    lucky: { color: "하늘색", number: 7, item: "우산" },
    overview:
      "오늘은 마음이 넓어지는 날이에요. 큰 결정보다 흐름을 믿고, 주변 사람에게 먼저 안부를 건네면 좋은 기운이 돌아올 거예요.",
  },
  {
    keyword: "고양이",
    score: 65,
    badge: "직감을 믿어보세요",
    title: "직감을 믿어보세요",
    summary: "고양이는 섬세한 감각의 신호예요. 오늘은 느낌이 맞는 선택이 결과로 이어질 수 있어요.",
    detail: "무리하게 움직이기보다 자신만의 속도를 지키는 게 좋아요. 작은 휴식이 오후 컨디션을 살려줄 거예요.",
    analysis: [
      { label: "재물운", stars: 3, level: "보통" },
      { label: "애정운", stars: 4, level: "좋음" },
      { label: "건강운", stars: 3, level: "보통" },
      { label: "직장운", stars: 3, level: "보통" },
    ],
    lucky: { color: "베이지", number: 14, item: "책" },
    overview:
      "섬세한 감각이 살아 있는 날이에요. 느낌이 맞는 선택을 믿어보세요. 무리하지 않고 자신만의 속도를 지키면 좋아요.",
  },
  {
    keyword: "default",
    score: 60,
    badge: "불안 뒤에 행운이 숨어 있는 날",
    title: "불안 뒤에 행운이 숨어 있는 날",
    summary: "꿈 속의 불안함이 여전히 마음에 남아있지만 작은 기적을 기대해보세요.",
    detail: "평소 미뤄둔 일 하나를 처리하면 마음이 한결 가벼워져요. 저녁에는 충분한 휴식을 챙겨보세요.",
    analysis: [
      { label: "재물운", stars: 3, level: "보통" },
      { label: "애정운", stars: 4, level: "좋음" },
      { label: "직장운", stars: 3, level: "보통" },
      { label: "건강운", stars: 2, level: "나쁨" },
    ],
    lucky: { color: "파란색", number: 27, item: "노트" },
    overview:
      "기분이 보통이라서 그런지, 가끔은 불안함이 느껴지기도 하고, 좋은 소식이 기다려지기도 해요. 이런 복잡한 감정이 당신의 마음속에 자리 잡고 있는 것 같아요. 모든 것이 잘 풀릴 것이라는 기대감을 가지고 조금 더 여유를 가지면 좋겠어요. 때로는 불안함이 우리의 삶을 더욱 풍부하게 만들기도 하니까요. 오늘은 혹시 모를 작은 기적을 기대해보세요!",
  },
];

const MONG_DEMO_HISTORY = [
  {
    id: 1,
    dreamTitle: "절벽에서 떨어지는 꿈",
    dreamDetail:
      "높은 절벽 끝에 서 있다가 발이 미끄러지면서 떨어지는 꿈을 꿨어요. 바닥이 보이지 않았고, 떨어지는 동안 숨이 멎는 느낌이었어요.",
    badge: "불안 뒤에 행운이 숨어 있는 날",
    summary: "꿈 속의 불안함이 여전히 마음에 남아있지만 작은 기적을 기대해보세요.",
    score: 60,
    analysis: [
      { label: "재물운", stars: 3, level: "보통" },
      { label: "애정운", stars: 4, level: "좋음" },
      { label: "직장운", stars: 3, level: "보통" },
      { label: "건강운", stars: 2, level: "나쁨" },
    ],
    date: new Date().toISOString(),
  },
  {
    id: 2,
    dreamTitle: "절벽에서 떨어지는 꿈",
    dreamDetail:
      "높은 절벽 끝에 서 있다가 발이 미끄러지면서 떨어지는 꿈을 꿨어요. 바닥이 보이지 않았고, 떨어지는 동안 숨이 멎는 느낌이었어요.",
    badge: "불안 뒤에 행운이 숨어 있는 날",
    summary: "꿈 속의 불안함이 여전히 마음에 남아있지만 작은 기적을 기대해보세요.",
    score: 60,
    analysis: [
      { label: "재물운", stars: 3, level: "보통" },
      { label: "애정운", stars: 4, level: "좋음" },
      { label: "직장운", stars: 3, level: "보통" },
      { label: "건강운", stars: 2, level: "나쁨" },
    ],
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 3,
    dreamTitle: "절벽에서 떨어지는 꿈",
    dreamDetail:
      "높은 절벽 끝에 서 있다가 발이 미끄러지면서 떨어지는 꿈을 꿨어요. 바닥이 보이지 않았고, 떨어지는 동안 숨이 멎는 느낌이었어요.",
    badge: "불안 뒤에 행운이 숨어 있는 날",
    summary: "꿈 속의 불안함이 여전히 마음에 남아있지만 작은 기적을 기대해보세요.",
    score: 60,
    analysis: [
      { label: "재물운", stars: 3, level: "보통" },
      { label: "애정운", stars: 4, level: "좋음" },
      { label: "직장운", stars: 3, level: "보통" },
      { label: "건강운", stars: 2, level: "나쁨" },
    ],
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

function pickFortune(dreamText) {
  const text = dreamText.toLowerCase();
  const base =
    FORTUNES.find((f) => f.keyword !== "default" && text.includes(f.keyword)) ||
    FORTUNES.find((f) => f.keyword === "default");
  return { ...base };
}

function getMongHistory() {
  try {
    return JSON.parse(localStorage.getItem("laymong_history") || "[]");
  } catch {
    return [];
  }
}

function saveMongResult(fortune, dreamText = "") {
  const record = {
    id: Date.now(),
    badge: fortune.badge,
    title: fortune.title,
    dreamTitle: dreamText.trim().split("\n")[0].slice(0, 40) || fortune.title,
    dreamDetail: dreamText.trim(),
    summary: fortune.summary,
    oneliner: fortune.oneliner || fortune.summary,
    score: fortune.score,
    analysis: fortune.analysis,
    fortuneCards: fortune.fortuneCards,
    lucky: fortune.lucky,
    overview: fortune.overview,
    tags: fortune.tags || [],
    date: new Date().toISOString(),
  };
  const history = getMongHistory();
  history.unshift(record);
  localStorage.setItem("laymong_history", JSON.stringify(history.slice(0, 20)));
  return record;
}

function saveResult(score, mode, aiUi) {
  const copy = RESULT_COPY[mode.name];
  const record = {
    id: Date.now(),
    score,
    mode: mode.name,
    modeLabel: mode.label,
    title: aiUi && aiUi.title ? aiUi.title : copy.title,
    tags: aiUi && aiUi.tags && aiUi.tags.length ? aiUi.tags : copy.tags,
    date: new Date().toISOString(),
  };
  const history = getHistory();
  history.unshift(record);
  localStorage.setItem("layz_history", JSON.stringify(history.slice(0, 20)));
  return record;
}

window.LayData = {
  QUESTIONS,
  MODES,
  RESULT_COPY,
  MOOD_OPTIONS,
  FORTUNES,
  MONG_DEMO_HISTORY,
  getMode,
  getResultDetails,
  calcScore,
  getHistory,
  pickFortune,
  getMongHistory,
  saveMongResult,
  saveResult,
};
})();
