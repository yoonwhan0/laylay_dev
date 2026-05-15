/* ── Stars ── */
(function(){
  const w=document.getElementById('sw');
  for(let i=0;i<170;i++){
    const el=document.createElement('div'); el.className='star';
    const sz=(Math.random()*2.1+0.4).toFixed(1),dur=(Math.random()*4+2).toFixed(1),
          dl=(Math.random()*7).toFixed(1),lo=(Math.random()*.12+.08).toFixed(2),hi=(Math.random()*.55+.45).toFixed(2);
    el.style.cssText=`left:${(Math.random()*100).toFixed(1)}%;top:${(Math.random()*100).toFixed(1)}%;width:${sz}px;height:${sz}px;--d:${dur}s;--dl:-${dl}s;--lo:${lo};--hi:${hi};`;
    w.appendChild(el);
  }
})();

window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-dev-sync')return;
  try{
    if(typeof d.apiKey==='string')sessionStorage.setItem('_laylay_shell_api',d.apiKey);
    if(typeof d.model==='string')sessionStorage.setItem('_laylay_shell_model',d.model||'');
  }catch(x){}
});
window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-highlight')return;
  var rid=d.regionId;
  if(!rid)return;
  document.querySelectorAll('.laylay-shell-highlight').forEach(function(n){n.classList.remove('laylay-shell-highlight');});
  var el=document.querySelector('[data-laylay-region="'+rid+'"]');
  if(!el)return;
  el.classList.add('laylay-shell-highlight');
  clearTimeout(window._laylayHlT);
  window._laylayHlT=setTimeout(function(){el.classList.remove('laylay-shell-highlight');},3200);
});
function laylayEffectiveApiKey(){
  try{
    var s=sessionStorage.getItem('_laylay_shell_api');
    if(s!==null)return String(s).trim();
    return(localStorage.getItem('laylay_dev_openai_key')||'').trim();
  }catch(e){return '';}
}
function laylayEffectiveModel(){
  try{
    var m=sessionStorage.getItem('_laylay_shell_model');
    if(m!==null&&String(m).trim())return String(m).trim();
    return sessionStorage.getItem('laylay_dev_openai_model')||'gpt-4o-mini';
  }catch(e){return 'gpt-4o-mini';}
}

/* ── Form init ── */
const byEl=document.getElementById('by'),bmEl=document.getElementById('bm'),bdEl=document.getElementById('bd');
for(let y=2006;y>=1950;y--) byEl.add(new Option(y+'년',y));
for(let m=1;m<=12;m++) bmEl.add(new Option(m+'월',m));
for(let d=1;d<=31;d++) bdEl.add(new Option(d+'일',d));
document.getElementById('dream').addEventListener('input',e=>{document.getElementById('cc').textContent=e.target.value.length;});

/* ── Mood ── */
let selMood='', selMoodEmoji='';
function pickMood(el,mood,emoji){
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel'); selMood=mood; selMoodEmoji=emoji;
}

/* ── Step ── */
function setStep(n){
  if (n !== 0) closeDreamGallery();
  document.getElementById('s-form').style.display   = n===0?'block':'none';
  document.getElementById('s-load').style.display   = n===1?'block':'none';
  document.getElementById('s-result').style.display = n===2?'block':'none';
  ['d0','d1','d2'].forEach((id,i)=>{
    document.getElementById(id).className='dot'+(i<n?' done':i===n?' active':'');
  });
}

/* ── Tabs ── */
function switchTab(n){
  ['tb0','tb1'].forEach((id,i)=>document.getElementById(id).className='tab-btn'+(i===n?' active':''));
  ['tp0','tp1'].forEach((id,i)=>document.getElementById(id).className='tab-pane'+(i===n?' show':''));
}

/* ── Loading msgs ── */
const MSGS=['별자리 운세를 분석하고 있어요','꿈 속 상징을 해석하는 중이에요','오늘의 기운을 계산하고 있어요','달의 위상을 확인하는 중이에요','행운의 키워드를 찾고 있어요'];
let mTimer;
function startMsgs(){let i=0;mTimer=setInterval(()=>{document.getElementById('ls').textContent=MSGS[i++%MSGS.length];},2000);}
function stopMsgs(){clearInterval(mTimer);}

/* ── Loading (시간 웨이팅 표시) ── */
let mongWaitTimer = null;
let mongWaitStartAt = null;
function startMongWaitUI(){
  try{
    mongWaitStartAt = performance.now();
    const el = document.getElementById('mong-load-elapsed');
    if (el) el.textContent = '0.0초';
    const bar = document.getElementById('mong-load-bar');
    if (bar) bar.style.width = '0%';
    if (mongWaitTimer) clearInterval(mongWaitTimer);
    mongWaitTimer = setInterval(function(){
      if (!mongWaitStartAt) return;
      const sec = (performance.now() - mongWaitStartAt) / 1000;
      if (el) el.textContent = sec.toFixed(1) + '초';
      if (bar) {
        // GPT 응답이 늦어질 수 있으니 100%까지 가지 않고 자연스럽게 멈추게
        const pct = Math.min(96, sec * 7);
        bar.style.width = pct.toFixed(1) + '%';
      }
    }, 110);
  }catch(e){}
}
function stopMongWaitUI(){
  try{
    if (mongWaitTimer) clearInterval(mongWaitTimer);
  }catch(e){}
  mongWaitTimer = null;
  mongWaitStartAt = null;
  const bar = document.getElementById('mong-load-bar');
  if (bar) bar.style.width = '100%';
}

/* ── Helpers ── */
function stars(n,max=5){return '★'.repeat(n)+'☆'.repeat(max-n);}
function starLabel(n){return['매우 나쁨','나쁨','보통','좋음','매우 좋음'][n-1]||'';}
function timeAgo(ts){
  const diff=Date.now()-ts, m=Math.floor(diff/60000), h=Math.floor(diff/3600000), d=Math.floor(diff/86400000);
  if(d>0) return d+'일 전'; if(h>0) return h+'시간 전'; if(m>0) return m+'분 전'; return '방금 전';
}

/* ── LocalStorage feed ── */
const LS_KEY = 'laymong_feed_v2';
function getFeed(){ try{ return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); }catch(e){return [];} }
function saveFeed(items){ localStorage.setItem(LS_KEY, JSON.stringify(items)); }
function addToFeed(entry){
  const feed = getFeed();
  feed.unshift(entry);
  if(feed.length > 30) feed.pop();
  saveFeed(feed);
}

/* ── Mock seed data ── */
const SEED = [
  {
    ts: Date.now()-3*3600000, mood:'😄 매우 좋음',
    dream:'하늘을 자유롭게 날아다니다가 구름 위에서 춤을 추는 꿈이었어요. 너무 행복했어요.',
    score:85, 재물운:4, 애정운:5, 직장운:4, 건강운:4,
    oneliner:'날개를 단 당신, 오늘은 세상 어디든 갈 수 있어요.',
    tags:['#높이도전하기','#사랑표현하기','#긍정마인드'],
    lucky:{color:'하늘색',num:7,item:'깃털 펜'}
  },
  {
    ts: Date.now()-7*3600000, mood:'😟 나쁨',
    dream:'커다란 파도가 저를 삼키려는 꿈을 꿨어요. 도망치려 했는데 발이 움직이지 않았어요.',
    score:25, 재물운:1, 애정운:2, 직장운:2, 건강운:2,
    oneliner:'파도는 결국 물이 되어 사라져요. 잠시 멈춰도 괜찮아요.',
    tags:['#휴식취하기','#과호흡주의','#따뜻한물마시기'],
    lucky:{color:'딥 네이비',num:2,item:'핫초코'}
  },
  {
    ts: Date.now()-14*3600000, mood:'🙂 좋음',
    dream:'오래된 친구를 만나 같이 맛있는 음식을 먹는 꿈을 꿨어요. 너무 반가웠어요.',
    score:65, 재물운:3, 애정운:4, 직장운:3, 건강운:3,
    oneliner:'그리운 인연이 당신 곁으로 돌아올 준비를 하고 있어요.',
    tags:['#연락하기','#맛있는거먹기','#소중한인연'],
    lucky:{color:'따뜻한 베이지',num:3,item:'엽서'}
  },
  {
    ts: Date.now()-28*3600000, mood:'😐 보통',
    dream:'모르는 집에서 길을 잃고 헤매는 꿈이었어요. 방이 계속 나왔는데 출구를 못 찾았어요.',
    score:40, 재물운:2, 애정운:2, 직장운:2, 건강운:2,
    oneliner:'미로 속에서도 반드시 출구는 있어요. 천천히 찾아봐요.',
    tags:['#방향재설정','#지도그리기','#멈추고생각하기'],
    lucky:{color:'미스티 그레이',num:9,item:'나침반'}
  }
];

function ensureSeed(){
  if(getFeed().length === 0) saveFeed(SEED);
}

/* ── Render feed card ── */
function renderCard(item, isNew=false){
  return `<div class="dream-card">
    <div class="dc-top">
      <div>
        <div class="dc-score">${item.score}점</div>
        <div class="dc-score-sub">별 ${Math.round(item.score/5)}개 × 5</div>
      </div>
      <div style="text-align:right">
        <div class="dc-mood">${item.mood}</div>
        ${isNew?`<div style="font-size:10px;color:var(--gold);margin-top:4px;">✦ 내 결과</div>`:''}
      </div>
    </div>
    <div class="dc-stars-row">
      <div class="dc-star-item">재물 <span>${stars(item.재물운)}</span></div>
      <div class="dc-star-item">애정 <span>${stars(item.애정운)}</span></div>
      <div class="dc-star-item">직장 <span>${stars(item.직장운)}</span></div>
      <div class="dc-star-item">건강 <span>${stars(item.건강운)}</span></div>
    </div>
    <div class="dc-dream">"${item.dream.length>60?item.dream.slice(0,60)+'...':item.dream}"</div>
    <div class="dc-oneliner">${item.oneliner}</div>
    <div class="dc-lucky">
      <div class="dc-lucky-item"><div class="dc-lucky-lbl">행운의 색</div><div class="dc-lucky-val">${item.lucky.color}</div></div>
      <div class="dc-lucky-item"><div class="dc-lucky-lbl">행운의 숫자</div><div class="dc-lucky-val">${item.lucky.num}</div></div>
      <div class="dc-lucky-item"><div class="dc-lucky-lbl">행운의 물건</div><div class="dc-lucky-val">${item.lucky.item}</div></div>
    </div>
    <div class="dc-tags">${(item.tags||[]).map(t=>`<span class="dc-tag">${t}</span>`).join('')}</div>
    <div class="dc-meta">${timeAgo(item.ts)}</div>
  </div>`;
}

function renderFeed(){
  ensureSeed();
  const feed = getFeed();
  const html = !feed.length
    ? `<div class="empty-state"><div class="empty-ico">🌙</div><div class="empty-txt">아직 공유된 꿈이 없어요.<br>첫 번째 해몽을 올려봐요!</div></div>`
    : feed.map((item,i)=>renderCard(item, i===0&&item._mine)).join('');
  document.querySelectorAll('[data-laymong-feed-host]').forEach(function(node){
    node.innerHTML = html;
  });
  applyMongDreamSearchFilter_(window._mongDreamSearchQuery || '');
}

function applyMongDreamSearchFilter_(q){
  q = String(q || '').trim().toLowerCase();
  window._mongDreamSearchQuery = q;
  var cards = document.querySelectorAll('[data-laymong-feed-host] .dream-card');
  cards.forEach(function(card){
    var text = (card.textContent || '').toLowerCase();
    card.style.display = (!q || text.includes(q)) ? '' : 'none';
  });
}

function wireMongDreamSearch_(){
  var input = document.getElementById('mong-dogang-search');
  if(!input) return;
  if(input.dataset._wired === '1') return;
  input.dataset._wired = '1';
  input.addEventListener('input', function(){
    applyMongDreamSearchFilter_(this.value);
  });
}

/* ── Mock data fallback ── */
const MOCK = {
  재물운:4, 애정운:3, 직장운:1, 건강운:1,
  재물운설명:'지갑이 두둑해지는 그림은 아니어도, "작게 들어오고 크게 나가지 않는다" 쪽으로 균형 잡히기 좋은 날이에요. 지금 꿈처럼 묘하게 들뜬 마음이 생기면, 장바구니부터 한 번만 더 확인해보면 어떨까요.',
  애정운설명:'말 한마디가 평소보다 길게 남는 하루예요. 연애든 우정이든, 오늘은 결론부터 말하기보다 듣는 쪽으로 포인트를 주면 분위기가 훨씬 부드러워져요.',
  직장운설명:'새 프로젝트를 들미는 것보다, 책상 위에 쌓인 일부터 하나씩 내려놓는 편이 속도가 나와요. 예상 밖 연락이나 수정 요청이 튈 수 있으니 버퍼를 조금만 더 잡아두면 마음이 편해요.',
  건강운설명:'몸은 크게 아프지 않아도, 피로가 말보다 먼저 오는 타입이에요. 카페인은 줄이고 물 한 컵을 더한다고 생각하면 오후가 한결 가벼워져요.',
  총론설명:'오늘은 "번쩍 빛나는 하루"라기보다, 살짝 기울어진 균형을 바로잡는 연습하기 좋은 날이에요. 재미 요소는 지갑과 마음 둘 다 가볍게 유지하는 것—행운의 차 한 잔이 그 분위기 전환에 딱이에요.',
  한줄평:'운세표보다 먼저, 물컵을 채우는 쪽이 오늘의 승자예요.',
  행운의색:'그레이 블루', 행운의숫자:4, 행운의물건:'따뜻한 허브티',
  행동해시태그:['#물먹고브레이크','#오늘은미루기허용','#메모장정리','#창문열고환기','#스트레칭3분']
};

/** 오프닝 롤용: MOCK과 같은 형태의 미니 카드 한 장 */
function introPeekFromMock(){
  var sum = MOCK.재물운 + MOCK.애정운 + MOCK.직장운 + MOCK.건강운;
  return {
    ts: Date.now() - 3 * 60000,
    mood: '😐 보통',
    dream: '물컵을 채우며 창밖을 바라보는 짧은 꿈',
    score: sum * 5,
    재물운: MOCK.재물운,
    애정운: MOCK.애정운,
    직장운: MOCK.직장운,
    건강운: MOCK.건강운,
    oneliner: MOCK.한줄평,
    tags: (MOCK.행동해시태그 || []).slice(0, 4),
    lucky: { color: MOCK.행운의색, num: MOCK.행운의숫자, item: MOCK.행운의물건 }
  };
}

/** 오프닝용: 맨 앞 샘플 카드 + 피드·시드 카드 */
function buildIntroCreditsFeed(){
  ensureSeed();
  var head = introPeekFromMock();
  var feed = getFeed().filter(function (x) {
    return x && x.dream && (x.score != null || x.재물운 != null);
  });
  var pool = feed.length >= 5 ? feed.slice() : SEED.concat(feed);
  var seen = Object.create(null);
  seen[String(head.ts) + '|' + String(head.dream).slice(0, 48)] = 1;
  var rest = [];
  pool.forEach(function (x) {
    var k = String(x.ts || '') + '|' + String(x.dream || '').slice(0, 48);
    if (!seen[k]) {
      seen[k] = 1;
      rest.push(x);
    }
  });
  if (!rest.length) rest = SEED.slice();
  rest.sort(function () { return Math.random() - 0.5; });
  while (rest.length < 10) rest = rest.concat(SEED);
  return [head].concat(rest.slice(0, 10));
}

/* ── Render my result ── */
function renderResult(r, dreamText, mood, moodEmoji){
  stopMongWaitUI();
  window._mongLastResult = { r: r, dream: dreamText, mood: mood, moodEmoji: moodEmoji };
  const sum = r.재물운+r.애정운+r.직장운+r.건강운;
  const totalScore = sum * 5;
  const circ = 2*Math.PI*42;
  const offset = circ-(totalScore/100)*circ;
  const moodDisplay = mood ? `${moodEmoji} ${mood}` : '😐 보통';

  const cats = [
    {key:'재물운',theme:'t-gold', n:r.재물운, desc:r.재물운설명},
    {key:'애정운',theme:'t-pink', n:r.애정운, desc:r.애정운설명},
    {key:'직장운',theme:'t-blue', n:r.직장운, desc:r.직장운설명},
    {key:'건강운',theme:'t-green',n:r.건강운, desc:r.건강운설명},
    {key:'총론',  theme:'t-lav',  n:null,      desc:r.총론설명},
  ];
  const cardsHTML = cats.map((c,i)=>`
    <div class="f-card ${c.theme}">
      <div class="f-head" onclick="tog(${i})">
        <div class="f-left">
          <span class="f-tag">오늘의 ${c.key}</span>
          ${c.n!==null?`<span class="f-stars">${stars(c.n)}</span><span class="f-slbl">${starLabel(c.n)}</span>`:`<span class="f-slbl" style="font-size:12px;color:var(--lav)">전체 요약</span>`}
        </div>
        <svg class="chv" id="cv${i}" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="f-body" id="fb${i}">${c.desc}</div>
    </div>`).join('');
  const tagsHTML = (r.행동해시태그||[]).map(t=>`<span class="htag">${t}</span>`).join('');

  document.getElementById('tp0').innerHTML = `
    <div class="r-hero fi">
      <div data-laylay-region="mong-score">
      <div class="s-ring">
        <svg viewBox="0 0 96 96">
          <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#A39BD4"/><stop offset="100%" stop-color="#C9A84C"/>
          </linearGradient></defs>
          <circle class="r-bg" cx="48" cy="48" r="42"/>
          <circle class="r-fill" cx="48" cy="48" r="42"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
        </svg>
        <div class="s-inner">
          <div class="s-num">${totalScore}점</div>
          <div class="s-lbl">오늘의 운</div>
        </div>
      </div>
      <div class="s-detail">별 ${sum}개 × 5점 = 총 ${totalScore}점</div>
      </div>
      <div class="mood-badge">${moodDisplay}</div>
      <div class="one-liner-wrap" data-laylay-region="mong-oneline" aria-label="오늘의 한 줄">
        <div class="one-liner-kicker">오늘의 한 줄</div>
        <p class="one-liner">${r.한줄평}</p>
      </div>
    </div>
    <div data-laylay-region="mong-fortune" class="f-sec fi">
      <div class="sec-ttl">운세 분석</div>
      <div class="f-list">${cardsHTML}</div>
    </div>
    <div class="div"></div>
    <div data-laylay-region="mong-lucky" class="l-sec fi">
      <div class="sec-ttl">오늘의 행운</div>
      <div class="l-grid">
        <div class="l-card"><div class="l-ico">🎨</div><div class="l-lbl">행운의 색</div><div class="l-val">${r.행운의색}</div></div>
        <div class="l-card"><div class="l-ico">✦</div><div class="l-lbl">행운의 숫자</div><div class="l-val">${r.행운의숫자}</div></div>
        <div class="l-card"><div class="l-ico">🌙</div><div class="l-lbl">행운의 물건</div><div class="l-val">${r.행운의물건}</div></div>
      </div>
    </div>
    <div data-laylay-region="mong-tags" class="h-sec fi">
      <div class="sec-ttl" style="margin-bottom:12px;">오늘 이렇게 해봐요</div>
      <div class="h-wrap">${tagsHTML}</div>
    </div>
    <div class="action-row">
      <button class="btn-share" onclick="doShare()">🔗 공유하기</button>
      <button class="btn-retry" onclick="resetApp()">↺ 다시 해몽</button>
    </div>
    `;

  /* Save to feed */
  const entry = {
    ts: Date.now(), _mine: true,
    mood: moodDisplay,
    dream: dreamText,
    score: totalScore,
    재물운: r.재물운, 애정운: r.애정운, 직장운: r.직장운, 건강운: r.건강운,
    oneliner: r.한줄평,
    tags: (r.행동해시태그||[]).slice(0,4),
    lucky: {color:r.행운의색, num:r.행운의숫자, item:r.행운의물건}
  };
  addToFeed(entry);

  /* Show NEW badge */
  document.getElementById('new-badge').style.display = 'inline-block';

  renderFeed();
  setStep(2);
}

/* ── Toggle fortune ── */
function tog(i){
  document.getElementById('fb'+i).classList.toggle('show');
  document.getElementById('cv'+i).classList.toggle('open');
}

/* ── Share ── */
function buildMongShareText(){
  var s = window._mongLastResult;
  if(!s || !s.r) return { text: '', url: location.href };
  var r = s.r;
  var url = location.href.split('#')[0];
  var sum = (r.재물운||0)+(r.애정운||0)+(r.직장운||0)+(r.건강운||0);
  var total = sum * 5;
  var one = (r.한줄평 || '').trim();
  var moodLine = s.mood ? (s.moodEmoji ? s.moodEmoji + ' ' : '') + s.mood : '';
  var starsLine =
    '재물 ' + stars(r.재물운||0) +
    ' · 애정 ' + stars(r.애정운||0) +
    ' · 직장 ' + stars(r.직장운||0) +
    ' · 건강 ' + stars(r.건강운||0);
  var luck = '🎨 ' + (r.행운의색||'-') + ' · ✦ ' + (r.행운의숫자!=null?r.행운의숫자:'-') + ' · 🌙 ' + (r.행운의물건||'-');
  var text =
    '🌙 Lay-몽 해몽 결과 — ' + total + '점' +
    (moodLine ? ' (' + moodLine + ')' : '') + '\n\n' +
    (one ? '"' + one + '"\n\n' : '') +
    starsLine + '\n' +
    luck + '\n\n' +
    '내 꿈도 풀어보기 → ' + url;
  return { text: text, url: url };
}
function getLaylayShareEnv(){
  var ua = navigator.userAgent || '';
  var mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  var iPadDesktopUA = /Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  var isMobile = mobileUA || iPadDesktopUA;
  var hasWebShare = typeof navigator.share === 'function';
  var hasKakao = !!(window.Kakao && window.Kakao.Share &&
    typeof window.Kakao.isInitialized === 'function' && window.Kakao.isInitialized());
  return { isMobile: isMobile, isDesktop: !isMobile, hasWebShare: hasWebShare, hasKakao: hasKakao };
}
function openMongShareSheet(){
  var sheet = document.getElementById('mong-share-sheet');
  if(!sheet) return;
  var env = getLaylayShareEnv();
  var nativeBtn = document.getElementById('mong-share-native');
  var smsBtn = document.getElementById('mong-share-sms');
  var kakaoBtn = document.getElementById('mong-share-kakao');
  var mailBtn = document.getElementById('mong-share-mail');
  if(nativeBtn) nativeBtn.style.display = (env.isMobile && env.hasWebShare) ? '' : 'none';
  if(smsBtn)    smsBtn.style.display    = env.isMobile ? '' : 'none';
  if(mailBtn)   mailBtn.style.display   = env.isDesktop ? '' : 'none';
  [nativeBtn, kakaoBtn].forEach(function(b){ if(b) b.classList.remove('mong-share-btn--primary'); });
  if(env.isMobile && env.hasWebShare && nativeBtn) nativeBtn.classList.add('mong-share-btn--primary');
  else if(kakaoBtn) kakaoBtn.classList.add('mong-share-btn--primary');
  if(kakaoBtn){
    var kkSub = kakaoBtn.querySelector('small');
    if(kkSub) kkSub.textContent = env.hasKakao
      ? (env.isMobile ? '카카오톡 앱이 열려요' : '카카오톡(PC)에서 공유창이 열려요')
      : '카톡 채팅창에 붙여넣을 텍스트를 복사해요';
  }
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
}
function closeMongShareSheet(){
  var sheet = document.getElementById('mong-share-sheet');
  if(sheet) sheet.hidden = true;
  document.body.style.overflow = '';
}
function doShare(){
  if(!window._mongLastResult){
    showToast('해몽 결과가 준비된 뒤에 공유할 수 있어요');
    return;
  }
  openMongShareSheet();
}
async function mongShareNative(){
  var pack = buildMongShareText();
  if(!pack.text){ showToast('공유할 내용이 아직 없어요'); return; }
  if(!navigator.share){ mongShareCopy(); return; }
  try {
    await navigator.share({ title: 'Lay-몽 해몽 결과', text: pack.text, url: pack.url });
    closeMongShareSheet();
  } catch(e){
    if(e && e.name === 'AbortError') return;
    mongShareCopy();
  }
}
function mongShareSms(){
  var pack = buildMongShareText();
  if(!pack.text){ showToast('공유할 내용이 아직 없어요'); return; }
  var href = 'sms:?&body=' + encodeURIComponent(pack.text);
  try { window.location.href = href; }
  catch(e){ mongShareCopy(); }
  closeMongShareSheet();
}
async function mongShareCopy(){
  var pack = buildMongShareText();
  if(!pack.text){ showToast('공유할 내용이 아직 없어요'); return; }
  try {
    await navigator.clipboard.writeText(pack.text);
    showToast('복사됐어요! 카톡·메모에 붙여넣어 보세요');
  } catch(e){
    showToast('복사 실패 · 화면을 캡쳐해서 공유해 주세요');
  }
  closeMongShareSheet();
}

function mongShareImageSave(){
  if(!window._mongLastResult || !window._mongLastResult.r){
    showToast('해몽 결과가 준비된 뒤에 저장할 수 있어요');
    return;
  }
  var s = window._mongLastResult;
  var r = s.r;
  var sum = (r.재물운||0)+(r.애정운||0)+(r.직장운||0)+(r.건강운||0);
  var totalScore = sum * 5;
  var one = String(r.한줄평 || '').trim();
  var moodLine = s.mood ? String(s.mood) : '';
  var moodEmoji = s.moodEmoji ? String(s.moodEmoji) : '';
  var moodText = (moodLine ? moodEmoji + ' ' + moodLine : '');

  var canvas = document.createElement('canvas');
  var W = 1080, H = 1350;
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');

  // background
  var g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#ffffff');
  g.addColorStop(1,'#2a2556');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // accent bar
  ctx.fillStyle = '#A39BD4';
  ctx.fillRect(0,0,W,18);

  // title
  ctx.fillStyle = '#1a1a1a';
  ctx.globalAlpha = 0.9;
  ctx.font = '700 44px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Lay-몽 해몽 결과', W/2, 110);
  ctx.globalAlpha = 1;

  // score
  ctx.font = '900 210px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#A39BD4';
  ctx.fillText(String(totalScore), W/2, 515);
  ctx.font = '700 52px "Noto Sans KR", sans-serif';
  ctx.fillText('점', W/2 + 140, 555);

  // mood
  ctx.font = '500 42px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#3b2c5d';
  ctx.fillText(moodText || '기분: (보통)', W/2, 650);

  // one-liner box
  var boxX = 90, boxW = W - 180;
  var boxY = 730, boxH = 240;
  ctx.fillStyle = 'rgba(255,255,255,.72)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 28);
  ctx.fill();

  ctx.fillStyle = '#1f1636';
  ctx.font = '500 34px "Noto Sans KR", sans-serif';
  wrapText(ctx, '“' + (one || '—') + '”', boxX + 42, boxY + 78, boxW - 84, 44, 3);

  // footer
  ctx.fillStyle = 'rgba(31,22,54,.55)';
  ctx.font = '500 30px "Noto Sans KR", sans-serif';
  ctx.fillText('내 꿈도 다시 풀어보기 → laylelay.com', W/2, 1210);

  function roundRect(c, x, y, w, h, r){
    var rr = Math.min(r, w/2, h/2);
    c.beginPath();
    c.moveTo(x+rr, y);
    c.arcTo(x+w, y, x+w, y+h, rr);
    c.arcTo(x+w, y+h, x, y+h, rr);
    c.arcTo(x, y+h, x, y, rr);
    c.arcTo(x, y, x+w, y, rr);
    c.closePath();
  }
  function wrapText(c, text, x, y, maxW, lineH, maxLines){
    var words = String(text).split('');
    var lines = [''];
    for(var i=0;i<words.length;i++){
      var t = lines[lines.length-1] + words[i];
      if(c.measureText(t).width > maxW && lines[lines.length-1]){
        if(lines.length >= maxLines) break;
        lines.push(words[i]);
      } else {
        lines[lines.length-1] = t;
      }
    }
    for(var li=0; li<Math.min(lines.length, maxLines); li++){
      c.fillText(lines[li], x, y + li*lineH);
    }
  }

  var a = document.createElement('a');
  a.download = `laymong-${totalScore}점.png`;
  a.href = canvas.toDataURL('image/png');
  a.click();
  showToast('이미지로 저장됐어요!');
  closeMongShareSheet();
}
function mongShareKakao(){
  var pack = buildMongShareText();
  if(!pack.text){ showToast('공유할 내용이 아직 없어요'); return; }
  var env = getLaylayShareEnv();
  if(env.hasKakao){
    try {
      window.Kakao.Share.sendDefault({
        objectType: 'text',
        text: pack.text,
        link: { mobileWebUrl: pack.url, webUrl: pack.url }
      });
      closeMongShareSheet();
      return;
    } catch(e){ /* fall back */ }
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(pack.text).then(function(){
      showToast(env.isDesktop ? 'PC 카카오톡 채팅창에 붙여넣어 보세요' : '카카오톡 채팅창에 붙여넣어 보세요');
    }).catch(function(){
      showToast('복사 실패 · 화면을 캡쳐해서 공유해 주세요');
    });
  } else {
    showToast('카톡 공유 준비 중 — 화면을 캡쳐해서 공유해 주세요');
  }
  closeMongShareSheet();
}
function mongShareMail(){
  var pack = buildMongShareText();
  if(!pack.text){ showToast('공유할 내용이 아직 없어요'); return; }
  var subject = encodeURIComponent('🌙 Lay-몽 해몽 결과');
  var body = encodeURIComponent(pack.text);
  try { window.location.href = 'mailto:?subject=' + subject + '&body=' + body; }
  catch(e){ mongShareCopy(); return; }
  closeMongShareSheet();
}

function openBirthTip(ev){if(ev)ev.stopPropagation();var el=document.getElementById('tip-birth');if(!el)return;el.hidden=false;document.body.style.overflow='hidden';}
function closeBirthTip(){var el=document.getElementById('tip-birth');if(el)el.hidden=true;document.body.style.overflow='';}
function closePeekDreams(){var el=document.getElementById('peek-dreams');if(el)el.hidden=true;document.body.style.overflow='';}
function openPeekShell(title,sub,html){
  var shell=document.getElementById('peek-dreams'),body=document.getElementById('peek-dreams-body');
  if(!shell||!body)return;
  body.innerHTML='<h3>'+title+'</h3><p class="peek-sub">'+sub+'</p>'+html;
  shell.hidden=false;document.body.style.overflow='hidden';
}
function openMyDreamArchive(){
  ensureSeed();
  var mine=getFeed().filter(function(x){return x._mine;}).sort(function(a,b){return(b.ts||0)-(a.ts||0);});
  if(!mine.length){showToast('아직 저장된 꿈 기록이 없어요. 해몽을 한 번 받아보면 여기에 쌓여요!');return;}
  var html=mine.slice(0,12).map(function(it){
    var t=timeAgo(it.ts||0);
    var d=(it.dream||'').length>72?(it.dream.slice(0,72)+'…'):(it.dream||'');
    return'<div class="peek-card"><div class="peek-m">'+t+' · '+String(it.score||'')+'점</div><div class="peek-d">“'+d+'”</div></div>';
  }).join('');
  openPeekShell('이전에 물어본 꿈 내용','해몽 결과는 이미 받아본 화면에 있어요. 여기서는 그때 적었던 꿈 글만 다시 볼 수 있어요. (이 기기 브라우저에만 저장)',html);
}
function applyDogamCardEntrance(){
  document.querySelectorAll('[data-laymong-feed-host] .dream-card').forEach(function(el){
    el.classList.remove('mong-dogam-card-in');
    el.style.animationDelay = '';
  });
  document.querySelectorAll('[data-laymong-feed-host] .dream-card').forEach(function(el, i){
    void el.offsetWidth;
    el.style.animationDelay = (i * 72) + 'ms';
    el.classList.add('mong-dogam-card-in');
  });
}
function escapeHtml(s){
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function resetIntroGalleryVisual(){
  clearTimeout(window._mongTickerToFeedT);
  var wrap = document.getElementById('mong-intro-ticker-wrap');
  var track = document.getElementById('mong-intro-ticker-track');
  var inner = document.getElementById('mong-standalone-inner');
  if (track) track.innerHTML = '';
  if (wrap) wrap.hidden = true;
  if (inner) inner.classList.remove('mong-phase-ticker', 'mong-phase-feed');
}
function buildIntroTicker(){
  var wrap = document.getElementById('mong-intro-ticker-wrap');
  var track = document.getElementById('mong-intro-ticker-track');
  if (!wrap || !track) return;
  ensureSeed();
  var feed = getFeed();
  var others = feed.filter(function (x) { return !x._mine; });
  var pool = others.length ? others : feed;
  var texts = pool.map(function (x) {
    var d = String(x.dream || '').trim().replace(/\s+/g, ' ');
    if (d.length > 40) d = d.slice(0, 40) + '…';
    return d || '…';
  });
  if (texts.length < 4) {
    var pad = ['별빛 아래 산책하는 꿈', '옛 친구와 웃으며 마주친 꿈', '조용한 바다 위를 걷는 꿈'];
    while (texts.length < 6) texts = texts.concat(pad);
  }
  texts = texts.slice(0, 10);
  var chips = texts
    .map(function (t) {
      return (
        '<span class="mong-tick-chip" title="' +
        escapeHtml(t) +
        '">“' +
        escapeHtml(t) +
        '”</span>'
      );
    })
    .join('');
  track.innerHTML = chips + chips;
  wrap.hidden = false;
}
function goToDreamGallery(opts){
  opts = opts || {};
  var shell = document.querySelector('.shell');
  if (!shell) return;
  resetIntroGalleryVisual();
  shell.classList.add('mong-shell--feed-focus');
  ensureSeed();
  renderFeed();
  wireMongDreamSearch_();
  applyMongDreamSearchFilter_(window._mongDreamSearchQuery || '');
  var hint = document.getElementById('mong-intro-hint-line');
  if (hint) hint.hidden = !opts.introHint;
  var inner = document.getElementById('mong-standalone-inner');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var useTicker = !reduced && !opts.skipTicker;
  if (useTicker && inner) {
    inner.classList.add('mong-phase-ticker');
    buildIntroTicker();
    var delayToFeed = opts.introHint ? 1250 : 900;
    window._mongTickerToFeedT = setTimeout(function () {
      inner.classList.add('mong-phase-feed');
      requestAnimationFrame(function () {
        requestAnimationFrame(applyDogamCardEntrance);
      });
    }, delayToFeed);
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(applyDogamCardEntrance);
    });
  }
}
function closeDreamGallery(opts){
  opts = opts || {};
  var shell = document.querySelector('.shell');
  var hint = document.getElementById('mong-intro-hint-line');
  resetIntroGalleryVisual();
  if (shell) {
    shell.classList.remove('mong-shell--feed-focus');
    if (!opts.keepIntroClass) shell.classList.remove('mong-intro-active');
  }
  if (hint) hint.hidden = true;
  if (opts.fromIntro) {
    var mainUi2 = document.getElementById('mong-main-ui');
    if (mainUi2) {
      mainUi2.classList.remove('mong-main-ui--intro-reveal');
      void mainUi2.offsetWidth;
      mainUi2.classList.add('mong-main-ui--intro-reveal');
      window.setTimeout(function () {
        mainUi2.classList.remove('mong-main-ui--intro-reveal');
      }, 1100);
    }
  }
}
/** 새로고침할 때마다: 플래시·로고 → 결과 카드 슬라이드 → 페이드아웃 후 입력 폼 */
function runStarWarsOpen(){
  var overlay = document.getElementById('mong-sw-overlay');
  var track = document.getElementById('mong-sw-credits-track');
  var shell = document.querySelector('.shell');
  if (!overlay || !track || !shell) {
    var main0 = document.getElementById('mong-main-ui');
    if (main0) {
      main0.classList.remove('mong-main-ui--intro-wait');
      void main0.offsetWidth;
      main0.classList.add('mong-main-ui--intro-reveal');
      window.setTimeout(function () {
        main0.classList.remove('mong-main-ui--intro-reveal');
      }, 1100);
    }
    return;
  }

  var items = buildIntroCreditsFeed();
  track.innerHTML = items
    .map(function (it, idx) {
      return '<div class="mong-sw-credit-slot">' + renderCard(it, idx === 0) + '</div>';
    })
    .join('');

  overlay.classList.remove('mong-sw-overlay--fade', 'mong-sw-impact');
  overlay.hidden = false;
  shell.classList.add('mong-sw-playing');

  window.requestAnimationFrame(function () {
    window.requestAnimationFrame(function () {
      overlay.classList.add('mong-sw-impact');
    });
  });

  var fadeAt = 4050;
  var doneAt = fadeAt + 1100;

  window.setTimeout(function () {
    overlay.classList.add('mong-sw-overlay--fade');
  }, fadeAt);

  window.setTimeout(function () {
    overlay.classList.remove('mong-sw-overlay--fade', 'mong-sw-impact');
    overlay.hidden = true;
    shell.classList.remove('mong-sw-playing');
    var mainUi = document.getElementById('mong-main-ui');
    if (mainUi) {
      mainUi.classList.remove('mong-main-ui--intro-wait', 'mong-main-ui--intro-reveal');
      void mainUi.offsetWidth;
      mainUi.classList.add('mong-main-ui--intro-reveal');
      window.setTimeout(function () {
        mainUi.classList.remove('mong-main-ui--intro-reveal');
      }, 1100);
    }
  }, doneAt);
}

/** 오버레이 표시 직전 짧은 안정화(레이아웃 한 프레임) */
function scheduleStarWarsOpen(){
  window.setTimeout(runStarWarsOpen, 120);
}
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2400);
}
function reportRuntime(status, elapsedMs, detail){
  try{
    if(window.parent&&window.parent!==window){
      window.parent.postMessage({
        source:'laylay-sim',
        type:'runtime',
        sim:'Lay-몽',
        status:status,
        elapsed_ms:typeof elapsedMs==='number'?elapsedMs:null,
        detail:detail||''
      },'*');
    }
  }catch(e){}
}

/* ── Main ── */
async function startDream(){
  const dream=document.getElementById('dream').value.trim();
  if(!dream){document.getElementById('dream').focus();return;}
  const mood = selMood||'보통', moodEmoji = selMoodEmoji||'😐';
  setStep(1); startMsgs();
  startMongWaitUI();

  const cal=document.getElementById('cal').value, gender=document.getElementById('gen').value,
        year=byEl.value, month=bmEl.value, day=bdEl.value, time=document.getElementById('bt').value;

  const laymongSystem = [
    '당신은 브랜드 "Lay-몽"의 꿈 해석 캐릭터입니다.',
    '말투: 밤에 친한 사람에게 카톡하듯 따뜻하고, 문장에 리듬이 있게. 진부한 운세 멘트("오늘은 기운이~" 반복), 번역투, 과한 한자어 나열은 피합니다.',
    '반드시 사용자의 꿈 속에 나온 구체적인 단어·사건·풍경을 각 설명마다 최소 한 번은 인용하거나 짚어 넣어, 이 사람만을 위한 해몽처럼 읽히게 합니다.',
    '가벼운 비유나 한 줄 농은 허용하지만, 농담만 던지고 끝내지 않습니다. 재물/애정/직장/건강 해석은 각각 분명히 다르게 씁니다.',
    '각 운세 설명(재물·애정·직장·건강)과 총론은 짧게 끊기지 말고, 공감·상징·다음 행동으로 이어지는 문장을 넉넉히 풀어 쓸 것.',
    '출력은 반드시 요청된 JSON 한 덩어리만. JSON 바깥에 텍스트·마크다운·코드펜스 금지.',
    '운세는 재미·상징 해석이며 의학·법률·투자 조언이 아님을 전제로, 단정적으로 단언하지 않습니다.'
  ].join('\n');

  const prompt=`다음 정보를 바탕으로 해몽해줘.

사용자: ${cal} ${year}년 ${month}월 ${day}일생, ${gender}, 태어난 시간 ${time}
꿈을 기록할 때 기분: ${mood} (${moodEmoji})

꿈 내용:
"""${dream}"""

반드시 유효한 JSON 객체 하나만 출력(앞뒤 설명·마크다운 없음). 키는 아래 스키마와 정확히 일치.
각 재물운설명·애정운설명·직장운설명·건강운설명: 5~9문장, ~요/~예요체. 꿈에 나온 말·장면·감정을 여러 번 자연스럽게 끼워 넣고, 마지막에 오늘 마음가짐이나 작은 행동 제안 한 줄을 덧붙일 것.
총론설명: 6~12문장. 꿈의 흐름을 한 번 더 요약하고, 기분(${mood})과 연결해 위로·유머·여운 중 두 가지 이상을 섞을 것.
한줄평: 반드시 1문장(대략 36~52자 권장). 꿈에서 건진 이미지·감각·비유를 한 조각 넣어 외우고 싶을 만큼 선명하게. 상투적 멘트·설교조·'오늘은'으로 시작하는 문장 남발은 피할 것.
행동해시태그: #으로 시작하는 문자열 5개, 가볍고 공유 욕구 나게(조롱·위험 행동·혐오 금지).

스키마(값은 전부 채울 것):
{"재물운":1-5,"애정운":1-5,"직장운":1-5,"건강운":1-5,"재물운설명":"…","애정운설명":"…","직장운설명":"…","건강운설명":"…","총론설명":"…","한줄평":"…","행운의색":"…","행운의숫자":0-99,"행운의물건":"…","행동해시태그":["#…","#…","#…","#…","#…"]}

별점 규칙: 재물운·애정운·직장운·건강운은 각각 정수 1~5 (5가 가장 좋음).`;

  let reqStart = 0;
  try{
    const apiKey=laylayEffectiveApiKey();
    const model=laylayEffectiveModel();
    reqStart=performance.now();
    const res=await fetch('/api/openai-dev',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        apiKey,
        model,
        messages:[
          {role:'system',content:laymongSystem},
          {role:'user',content:prompt}
        ],
        max_tokens:3200,
        temperature:0.68
      })
    });
    const data=await res.json().catch(()=>({}));
    const elapsed=Math.round(performance.now()-reqStart);
    stopMsgs();
    if(!res.ok){
      const apiReason=(data&&(
        data.error||
        (data.detail&&data.detail.message)||
        (data.detail&&data.detail.code)||
        (data.detail&&data.detail.type)
      ))||'API오류';
      const shortReason=String(apiReason).slice(0,26);
      showToast(`${elapsed}ms · Mock(${shortReason})`);
      reportRuntime('Mock', elapsed, `API:${shortReason}`);
      renderResult(MOCK, dream, mood, moodEmoji);
      return;
    }
    const raw=(data.text||'').trim();
    const match=raw.match(/\{[\s\S]*\}/);
    let parsed=null;
    if(match){
      try{
        parsed=JSON.parse(match[0]);
      }catch(x){parsed=null;}
    }
    const required=['재물운','애정운','직장운','건강운','한줄평','총론설명','행운의색','행운의숫자','행운의물건','행동해시태그'];
    if(!parsed||!required.every(k=>parsed[k]!=null)){
      showToast(`${elapsed}ms · Mock(JSON)`);
      reportRuntime('Mock', elapsed, 'JSON파싱');
      renderResult(MOCK, dream, mood, moodEmoji);
      return;
    }
    showToast(`${elapsed}ms · GPT 결과`);
    reportRuntime('GPT 결과', elapsed, '성공');
    renderResult(parsed, dream, mood, moodEmoji);
  }catch(e){
    stopMsgs();
    if(reqStart){
      const elapsedErr=Math.round(performance.now()-reqStart);
      showToast(`${elapsedErr}ms · Mock(네트워크)`);
      reportRuntime('Mock', elapsedErr, '네트워크');
    }else{
      showToast('오류 · Mock');
      reportRuntime('Mock', null, '예외');
    }
    renderResult(MOCK, dream, mood, moodEmoji);
  }
}

/* ── Reset ── */
function resetApp(){
  closeDreamGallery();
  document.getElementById('dream').value='';
  document.getElementById('cc').textContent='0';
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('sel'));
  selMood=''; selMoodEmoji='';
  document.getElementById('tp0').innerHTML='';
  document.getElementById('new-badge').style.display='none';
  switchTab(0);
  setStep(0);
}

/* ── Init ── */
ensureSeed();
renderFeed();
if (document.readyState === 'complete') {
  scheduleStarWarsOpen();
} else {
  window.addEventListener('load', scheduleStarWarsOpen, { once: true });
}
