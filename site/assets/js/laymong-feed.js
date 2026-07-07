'use strict';

(function () {
  var LS_KEY = 'laymong_feed_v2';

  var SEED = [
    {
      ts: Date.now() - 3 * 3600000,
      mood: '😄 매우 좋음',
      dream: '하늘을 자유롭게 날아다니다가 구름 위에서 춤을 추는 꿈이었어요.',
      score: 85,
      재물운: 4,
      애정운: 5,
      직장운: 4,
      건강운: 4,
      oneliner: '날개를 단 당신, 오늘은 세상 어디든 갈 수 있어요.',
      tags: ['#높이도전하기', '#사랑표현하기', '#긍정마인드'],
      lucky: { color: '하늘색', num: 7, item: '깃털 펜' },
    },
    {
      ts: Date.now() - 7 * 3600000,
      mood: '😟 나쁨',
      dream: '커다란 파도가 저를 삼키려는 꿈을 꿨어요. 발이 움직이지 않았어요.',
      score: 25,
      재물운: 1,
      애정운: 2,
      직장운: 2,
      건강운: 2,
      oneliner: '파도는 결국 물이 되어 사라져요. 잠시 멈춰도 괜찮아요.',
      tags: ['#휴식취하기', '#과호흡주의', '#따뜻한물마시기'],
      lucky: { color: '딥 네이비', num: 2, item: '핫초코' },
    },
    {
      ts: Date.now() - 14 * 3600000,
      mood: '🙂 좋음',
      dream: '오래된 친구를 만나 같이 맛있는 음식을 먹는 꿈을 꿨어요.',
      score: 65,
      재물운: 3,
      애정운: 4,
      직장운: 3,
      건강운: 3,
      oneliner: '그리운 인연이 당신 곁으로 돌아올 준비를 하고 있어요.',
      tags: ['#연락하기', '#맛있는거먹기', '#소중한인연'],
      lucky: { color: '따뜻한 베이지', num: 3, item: '엽서' },
    },
  ];

  function stars(n) {
    n = Math.min(5, Math.max(0, n || 0));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function timeAgo(ts) {
    var diff = Date.now() - ts;
    var m = Math.floor(diff / 60000);
    var h = Math.floor(diff / 3600000);
    var d = Math.floor(diff / 86400000);
    if (d > 0) return d + '일 전';
    if (h > 0) return h + '시간 전';
    if (m > 0) return m + '분 전';
    return '방금 전';
  }

  function getFeed() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveFeed(items) {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }

  function ensureSeed() {
    if (getFeed().length === 0) saveFeed(SEED);
  }

  function addToFeed(entry) {
    var feed = getFeed();
    feed.unshift(entry);
    if (feed.length > 30) feed.pop();
    saveFeed(feed);
  }

  function addMineFromResult(fortune, dream, mood) {
    addToFeed({
      ts: Date.now(),
      _mine: true,
      mood: mood || '',
      dream: dream,
      score: fortune.score,
      재물운: fortune.analysis && fortune.analysis[0] ? fortune.analysis[0].stars : 3,
      애정운: fortune.analysis && fortune.analysis[1] ? fortune.analysis[1].stars : 3,
      직장운: fortune.analysis && fortune.analysis[2] ? fortune.analysis[2].stars : 3,
      건강운: fortune.analysis && fortune.analysis[3] ? fortune.analysis[3].stars : 3,
      oneliner: fortune.badge || fortune.summary,
      tags: (fortune.tags || []).slice(0, 4),
      lucky: {
        color: fortune.lucky && fortune.lucky.color,
        num: fortune.lucky && fortune.lucky.number,
        item: fortune.lucky && fortune.lucky.item,
      },
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCard(item) {
    var dreamRaw = item.dream || '';
    var dreamShort;
    if (dreamRaw.length > 72) {
      dreamShort =
        (window.LayTextFormat
          ? window.LayTextFormat.formatHtml(dreamRaw.slice(0, 72))
          : escapeHtml(dreamRaw.slice(0, 72))) + '…';
    } else {
      dreamShort = window.LayTextFormat
        ? window.LayTextFormat.formatHtml(dreamRaw)
        : escapeHtml(dreamRaw);
    }
    return (
      '<article class="mong-history-card mong-feed-card">' +
      '<div class="mong-history-card-head">' +
      '<span class="mong-history-card-label">Lay Mong Report</span>' +
      '<span class="mong-history-card-time">' +
      timeAgo(item.ts || Date.now()) +
      '</span></div>' +
      '<div class="mong-history-section">' +
      '<p class="mong-history-label">꿈 내용</p>' +
      '<p class="mong-history-text">“' +
      dreamShort +
      '”</p></div>' +
      '<div class="mong-history-section">' +
      '<p class="mong-history-label">' +
      (item._mine ? '내 결과 · ' : '') +
      item.score +
      '점</p>' +
      '<h4 class="mong-history-heading">' +
      escapeHtml(item.oneliner || '') +
      '</h4>' +
      '<div class="mong-history-stars">' +
      '<span class="mong-inline-stat"><em>재물</em>' +
      stars(item.재물운) +
      '</span>' +
      '<span class="mong-inline-stat"><em>애정</em>' +
      stars(item.애정운) +
      '</span></div></div></article>'
    );
  }

  function renderList() {
    ensureSeed();
    var feed = getFeed();
    if (!feed.length) return '';
    return feed.map(renderCard).join('');
  }

  var searchQuery = '';

  function applySearchFilter(q) {
    searchQuery = String(q || '').trim().toLowerCase();
    document.querySelectorAll('.mong-feed-card').forEach(function (card) {
      var text = (card.textContent || '').toLowerCase();
      card.style.display = !searchQuery || text.includes(searchQuery) ? '' : 'none';
    });
    var empty = document.getElementById('mong-feed-empty');
    if (empty) {
      var visible = document.querySelectorAll('.mong-feed-card:not([style*="none"])').length;
      empty.hidden = visible > 0;
    }
  }

  function wireSearch() {
    var input = document.getElementById('mong-feed-search');
    if (!input || input.dataset.wired === '1') return;
    input.dataset.wired = '1';
    input.addEventListener('input', function () {
      applySearchFilter(this.value);
    });
    applySearchFilter(searchQuery);
  }

  window.LayMongFeed = {
    ensureSeed: ensureSeed,
    renderList: renderList,
    wireSearch: wireSearch,
    addMineFromResult: addMineFromResult,
    applySearchFilter: applySearchFilter,
  };
})();
