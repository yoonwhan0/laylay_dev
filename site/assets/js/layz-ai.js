'use strict';

(function () {
  function prose(text, singleLine) {
    if (window.LayTextFormat) {
      return window.LayTextFormat.formatProse(text, singleLine ? { singleLine: true } : undefined);
    }
    return String(text || '').trim();
  }

  function fmtHead(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatResultHead(text) : prose(text, true);
  }

  function fmtDesc(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatResultDesc(text) : prose(text);
  }

  function fmtBadge(tag) {
    return window.LayTextFormat ? window.LayTextFormat.toKoreanBadge(tag) : String(tag || '추천');
  }

  var RX_FALLBACK_TITLES = ['정해진 시간에 잠자기', '스마트폰 멀리하기', '편안한 수면 환경 만들기'];

  function mapRxItem(it, index) {
    if (typeof it === 'string') {
      return { title: RX_FALLBACK_TITLES[index] || '', text: prose(it) };
    }
    var title = prose(it.title || it.name || RX_FALLBACK_TITLES[index] || '', true);
    var text = prose(it.text || it.desc || '');
    return { title: title, text: text };
  }

  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  function buildAnswerProfile(answers, lz, mode, questions) {
    var a = answers || [];
    function pick(i) {
      return a[i] && a[i].label ? String(a[i].label) : '';
    }
    var fatigueSum = a.reduce(function (sum, x) {
      var s = typeof x === 'number' ? x : x && typeof x.score === 'number' ? x.score : 0;
      return sum + s;
    }, 0);
    var stance =
      lz <= 19
        ? '컨디션 여유 — 루틴 유지·예방 처방'
        : lz <= 39
          ? '경계선 — 슬슬 방전 신호, 가벼운 회복 처방'
          : lz <= 59
            ? '번아웃 예고 — 저녁·수면 우선 처방'
            : lz <= 79
              ? '강한 피로 — 오늘 밤 회복 집중 처방'
              : '극한 레이지 — 최소 부담·수면 최우선 처방';
    return [
      '=== 오늘 이 사람 포지션 (카피·처방의 출발점) ===',
      'Lay-Z 지수: ' + lz + '점 · 참고 구간: ' + (mode ? mode.label : ''),
      '종합 포지션: ' + stance,
      '누적 피로 신호(문항 점수 합, 높을수록 더 지침): ' + fatigueSum,
      ...a.map(function (ans, i) {
        var q = questions[i];
        var label = typeof ans === 'object' && ans.label ? ans.label : pick(i) || '(미응답)';
        return (i + 1) + '. ' + (q ? q.text.replace(/\n/g, ' ') : '문항') + ' → ' + label;
      }),
      '→ 위 포지션·문항 선택에서만 head·desc·recs·rx·summary를 쓸 것. 다른 사람에게도 맞는 문장 금지.',
    ].join('\n');
  }

  async function fetchCopy(lz, mode, answers, questions) {
    var layzSystem = [
      '당신은 브랜드 "Lay-Z Check"의 오늘 컨디션 코치이자 카피 작가입니다.',
      '역할: 사용자가 고른 8문항만 보고 「오늘 이 사람의 포지션」을 유추한 뒤, 그 포지션에서만 통하는 처방·공감·행동을 씁니다.',
      '말투: 정중한 해요체·습니다체로 일관하세요. 반말(해, 야, 해봐, 거야, 하자, 쉬어 등)은 금지합니다. 브랜드에 어울리는 공손하고 따뜻한 톤으로 씁니다.',
      '의학·법률·투자·진단처럼 들리는 단정은 금지. Lay-Z 지수 숫자는 절대 바꾸지 마세요.',
      'head·desc·summary·recs·rx 전 구간이 같은 「오늘의 한 사람」 이야기여야 합니다.',
      '문항에서 고른 보기 텍스트를 summary·recs에 각각 2회 이상 자연스럽게 인용하세요.',
      'head는 결과 카드 상단 굵은 헤드라인만 짧게: 최대 2문장·2줄.',
      'desc는 결과 카드 상단 본문만 짧게: 최대 2~3문장·3줄.',
      'summary는 「오늘 나의 상태 요약」 영역: 7~11문장으로 풍부하게. 공감·구체 묘사·문항 단서 2회 이상·가벼운 유머. 문장 2~3개마다 \\n.',
      'tierTag는 한글 키워드 정확히 3개만(쉼표/· 구분).',
      'recs[].tag는 반드시 한글 1~4자. 영어 금지.',
      'recs[].desc는 5~9문장으로 풍부하게(이유·기대·주의·작은 행동). 문장 2~3개마다 \\n.',
      'rx(수면 가이드)는 recs와 역할 분리. rx.sub(부제 문단)는 출력하지 마세요.',
      'rx.items는 정확히 3개. 각각 title(큰 제목 한 줄) + text(본문 2~4문장).',
      'JSON 문자열 값은 문장마다 \\n 줄바꿈 가능. HTML·마크다운 태그는 금지.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
    ].join('\n');

    var profile = buildAnswerProfile(answers, lz, mode, questions);
    var user = [
      'Lay-Z 지수(고정·변경 금지): ' + lz,
      '참고 Mode: ' + (mode ? mode.name + ' / ' + mode.label : ''),
      '',
      profile,
      '',
      '=== 분량·형식 (필수) ===',
      '말투: 모든 문장 정중체(~해요, ~습니다, ~세요). 반말 금지.',
      'head: 최대 2문장·2줄. 결과 카드 상단 헤드라인.',
      'desc: 최대 2~3문장·3줄. 결과 카드 상단 짧은 공감.',
      'summary: 7~11문장. desc와 같은 사실 반복 금지. 「오늘 나의 상태 요약」용으로 넉넉히. 문장 2~3개마다 \\n.',
      'tierTag: 한글 키워드 정확히 3개.',
      'recs: 정확히 3개. tag=한글, title=한 줄, desc=5~9문장 풍부하게.',
      'rx: title만(예: 편안한 밤을 위한 팁), sub 생략. items 3개는 title+text(2~4문장).',
      '',
      '반드시 유효한 JSON 하나만 출력.',
      '{"tierName":"…","tierTag":"키워드1,키워드2,키워드3","head":"…","desc":"…","summary":"…","recs":[{"tag":"휴식","title":"…","desc":"…"},…],"rx":{"title":"편안한 밤을 위한 팁","items":[{"title":"정해진 시간에 잠자기","text":"…"},…]}}',
    ].join('\n');

    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: [
          { role: 'system', content: layzSystem },
          { role: 'user', content: user },
        ],
        max_tokens: 4800,
        temperature: 0.78,
      }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) return null;
    var raw = typeof data.text === 'string' ? data.text.trim() : '';
    if (!raw && data.raw && data.raw.choices && data.raw.choices[0] && data.raw.choices[0].message) {
      raw = String(data.raw.choices[0].message.content || '').trim();
    }
    var m = raw.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch (e) {
      return null;
    }
  }

  function mapToUi(ai, mode, resultCopy, getResultDetails) {
    var fallback = getResultDetails(mode.name);
    var copy = resultCopy[mode.name] || resultCopy.Easy || {};
    if (!ai) {
      return {
        title: fmtHead(copy.title),
        desc: fmtDesc(copy.desc),
        tags: (copy.tags || []).slice(0, 3),
        summary: prose(fallback.summary),
        recommends: fallback.recommends.map(function (r) {
          return {
            badge: fmtBadge(r.badge),
            title: prose(r.title, true),
            desc: prose(r.desc),
          };
        }),
        rx: null,
        applied: false,
      };
    }
    var recs = Array.isArray(ai.recs) ? ai.recs : [];
    var recommends =
      recs.length >= 3
        ? recs.slice(0, 3).map(function (x) {
            return {
              badge: fmtBadge(x.tag || '추천'),
              title: prose(x.title, true),
              desc: prose(x.desc),
            };
          })
        : fallback.recommends;
    var rx = null;
    if (ai.rx && Array.isArray(ai.rx.items) && ai.rx.items.length >= 3) {
      rx = {
        title: prose(ai.rx.title || '편안한 밤을 위한 팁', true),
        items: ai.rx.items.slice(0, 3).map(mapRxItem),
      };
    }
    var descText = fmtDesc(ai.desc || copy.desc);
    var summaryText = prose(ai.summary || ai.desc || fallback.summary);
    return {
      title: fmtHead(ai.head || copy.title),
      desc: descText,
      tags: String(ai.tierTag || '')
        .trim()
        .split(/[,·]/)
        .map(function (t) {
          return t.trim();
        })
        .filter(Boolean)
        .concat(copy.tags || [])
        .slice(0, 3),
      summary: summaryText,
      recommends: recommends,
      rx: rx,
      tierName: String(ai.tierName || mode.label).trim(),
      applied: true,
    };
  }

  window.LayZAi = { fetchCopy: fetchCopy, mapToUi: mapToUi };
})();
