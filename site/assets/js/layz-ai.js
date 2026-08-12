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

  function fmtRecDesc(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatRecommendDesc(text) : prose(text);
  }

  function fmtSleepText(text) {
    return window.LayTextFormat ? window.LayTextFormat.formatSleepItemText(text) : prose(text);
  }

  function fmtBadge(tag) {
    return window.LayTextFormat ? window.LayTextFormat.toKoreanBadge(tag) : String(tag || '추천');
  }

  var RX_FALLBACK_TITLES = ['정해진 시간에 잠자기', '스마트폰 멀리하기', '편안한 수면 환경 만들기'];

  function mapRxItem(it, index) {
    if (typeof it === 'string') {
      return { title: RX_FALLBACK_TITLES[index] || '', text: fmtSleepText(it) };
    }
    var title = prose(it.title || it.name || RX_FALLBACK_TITLES[index] || '', true);
    var text = fmtSleepText(it.text || it.desc || '');
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

  function dialectToneGuide(dialect) {
    if (dialect === 'chungcheong') {
      return [
        '=== 말투 고정: 충청도 화법 — 최대한 자극적으로 ===',
        '핵심 명제: 「말보다 뜻이 길다」「말은 천천히 하지만 판단까지 느린 것은 아니다」',
        '공격 방식: 우회형. 결론은 이미 끝났는데 바로 안 간다. 행간으로 팩폭한다.',
        '캐릭터: 여유·간접성. 표면은 부드럽고 결과는 정확. 「안 한다」를 「그건 좀 그렇지 않을까 싶은디…」로 말한다.',
        '말투 필수: ~유/~슈/~디유/~겄어유/~하슈/~그려/~뭐유/~인디/~겨. 「굳이 지금 해야 되겄어?」식. 표준어 해요체 금지.',
        '톤 규칙:',
        '- 속도는 느긋, 판단은 이미 끝남. 화나도 더 차분해진다.',
        '- 직접 욕/직격 비난 대신, 여유로운 척 뼈 때리기. 「일찍 왔네. 내일 올 줄 알았는디.」급의 우회 독설.',
        '- 위험 신호: 「그려…… 알았어유.」처럼 낮은 음량·높은 심각도.',
        '- summary는 행간을 읽게 만들고, head는 느긋한데 한 방 있게.',
        '금지: 상스러운 욕설·혐오·차별. 우회형 독설·시니컬 유머로 자극도 최대.',
      ].join('\n');
    }
    if (dialect === 'gyeongsang') {
      return [
        '=== 말투 고정: 경상도 화법 — 최대한 자극적으로 ===',
        '핵심 명제: 「뜻보다 말이 짧다」「말은 짧은데 뜻은 알아서 풀어야 한다」',
        '공격 방식: 압축형. 설명 없이 판결. 「와 이제 오노.」「그거 오늘 해라.」',
        '캐릭터: 직접성·압축성. 문장 최소, 맥락 압축률 최대. 감정 표현은 최소화해도 뜻은 세다.',
        '말투 필수: ~아이가/~데이/~카노/~봐라/~해라카이/~아이고/~뭐하노/~맞나/~아이다. 표준어 해요체 금지.',
        '톤 규칙:',
        '- 군더더기 제로. 문장 짧게. 완곡어법·돌려 말하기 금지.',
        '- 「밥 묵었나?」처럼 짧은 말이 여러 뜻으로 읽히게. 애정도 압축: 「밥 묵고 댕기라.」',
        '- 위험 신호: 「됐다.」 추가 설명 없이 끝낼 때 가장 강함.',
        '- head·desc는 한 방에 컷, summary도 길게 풀어쓰지 말고 짧고 세게 리듬 유지.',
        '금지: 상스러운 욕설·혐오·차별. 직설·압축·텐션으로 자극도 최대.',
      ].join('\n');
    }
    if (dialect === 'jeolla') {
      return [
        '=== 말투 고정: 전라도 화법 — 최대한 자극적으로 ===',
        '핵심 명제: 「말에 감정이 실린다」「사실만 전달하기에는 감정이 너무 많다」',
        '공격 방식: 표현형. 반가움·서운함·핀잔이 한 문장에 동시 탑재. 「아따, 그것을 그냥 놔두면 쓰겄냐?」',
        '캐릭터: 정서적 친밀감·표현력. 리액션 크고, 이야기 자체가 콘텐츠. 정은 많은데 입담은 화끈.',
        '말투 필수: ~잉/~라우/~허요/~거시랑께/~하등가/~워메/~참말로/~아따/~것인디. 표준어 해요체 금지.',
        '톤 규칙:',
        '- 감정·감탄·타박을 문장에 적극 참여시킨다. 「아따 이것이 겁나…잉」식.',
        '- 「가서 봤는데 없더라」를 「그래갖고 내가 거그를 딱 갔는디…」처럼 서사로 키운다.',
        '- 표현은 세도 관계는 가깝다. 혼내듯 말하다 결국 같이 밥 먹을 텐션.',
        '- summary는 감정선·입담을 풀고, head는 「아따」한 방으로 시작해도 좋다.',
        '금지: 상스러운 욕설·혐오·차별. 과장·입담·정 섞인 독설로 자극도 최대.',
      ].join('\n');
    }
    return [
      '말투: 정중한 해요체·습니다체로 일관하세요. 반말(해, 야, 해봐, 거야, 하자, 쉬어 등)은 금지합니다. 브랜드에 어울리는 공손하고 따뜻한 톤으로 씁니다.',
    ].join('\n');
  }

  async function fetchCopy(lz, mode, answers, questions, options) {
    var dialect = options && options.dialect ? String(options.dialect) : '';
    var toneGuide = dialectToneGuide(dialect);
    var dialectMode = !!dialect;
    var layzSystem = [
      '당신은 브랜드 "Lay-Z Check"의 오늘 컨디션 코치이자 카피 작가입니다.',
      '역할: 사용자가 고른 8문항만 보고 「오늘 이 사람의 포지션」을 유추한 뒤, 그 포지션에서만 통하는 처방·공감·행동을 씁니다.',
      toneGuide,
      dialectMode
        ? '사투리 모드 최우선: head·desc·summary·recs·rx 전 문장이 해당 지역 말투여야 한다. 표준어로 순화하거나 중간에 전환 금지. 자극도·개성 최대.'
        : '',
      '의학·법률·투자·진단처럼 들리는 단정은 금지. Lay-Z 지수 숫자는 절대 바꾸지 마세요.',
      'head·desc·summary·recs·rx 전 구간이 같은 「오늘의 한 사람」 이야기여야 합니다.',
      '문항에서 고른 보기 텍스트를 summary·recs에 각각 2회 이상 자연스럽게 인용하세요.',
      'head는 결과 카드 상단 굵은 헤드라인만 짧게: 최대 2문장·2줄.',
      'desc는 결과 카드 상단 본문만 짧게: 최대 2~3문장·3줄.',
      dialectMode
        ? 'summary는 「오늘 나의 상태 요약」: 7~11문장. 사투리로 팩폭·드립·공감을 섞어 최대한 자극적으로. 문장 2~3개마다 \\n.'
        : 'summary는 「오늘 나의 상태 요약」 영역: 7~11문장으로 풍부하게. 공감·구체 묘사·문항 단서 2회 이상·가벼운 유머. 문장 2~3개마다 \\n.',
      'tierTag는 한글 키워드 정확히 3개만(쉼표/· 구분).',
      'recs[].tag는 반드시 한글 1~4자. 영어 금지.',
      'recs[].desc는 「행동 추천」 본문: 최대 3줄(2~3문장). 문장마다 \\n.',
      'rx(수면 가이드)는 recs와 역할 분리. rx.sub(부제 문단)는 출력하지 마세요.',
      'rx.items는 정확히 3개. 각각 title(큰 제목 한 줄) + text(본문 최대 2줄·1~2문장).',
      'JSON 문자열 값은 문장마다 \\n 줄바꿈 가능. HTML·마크다운 태그는 금지.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
    ]
      .filter(Boolean)
      .join('\n');

    var profile = buildAnswerProfile(answers, lz, mode, questions);
    var toneLine = dialectMode
      ? '말투: 지정 지역 화법 캐릭터를 head·desc·summary·recs·rx 전 구간에 100% 적용. 표준어 회귀 금지. 자극도 최대.'
      : '말투: 모든 문장 정중체(~해요, ~습니다, ~세요). 반말 금지.';
    var dialectRouteHint = '';
    if (dialect === 'chungcheong') {
      dialectRouteHint =
        '경로: 우회형. 여유롭게 돌려 말하되 결론은 이미 끝난 상태로. 「알아들을 사람은 알아듣겠지유.」';
    } else if (dialect === 'gyeongsang') {
      dialectRouteHint =
        '경로: 압축형. 말은 짧게, 뜻은 세게. 「말 안 해도 알제?」 설명 최소화.';
    } else if (dialect === 'jeolla') {
      dialectRouteHint =
        '경로: 표현형. 감정·리액션·서사를 싣는다. 「내 마음을 확실하게 알려줘야제.»';
    }
    var user = [
      'Lay-Z 지수(고정·변경 금지): ' + lz,
      '참고 Mode: ' + (mode ? mode.name + ' / ' + mode.label : ''),
      dialectMode ? '지정 사투리: ' + dialect + ' (지역 화법 캐릭터 최대치)' : '',
      dialectRouteHint,
      '',
      profile,
      '',
      '=== 분량·형식 (필수) ===',
      toneLine,
      dialectMode
        ? '중요: 브랜드 정중체로 순화하지 말 것. 목적(오늘 컨디션 처방)은 같고, 언어적 경로만 지역 화법으로 최대로 다르게.'
        : '',
      'head: 최대 2문장·2줄. 결과 카드 상단 헤드라인.',
      'desc: 최대 2~3문장·3줄. 결과 카드 상단 짧은 공감.',
      'summary: 7~11문장. desc와 같은 사실 반복 금지. 「오늘 나의 상태 요약」용으로 넉넉히. 문장 2~3개마다 \\n.',
      'tierTag: 한글 키워드 정확히 3개.',
      'recs: 정확히 3개. tag=한글, title=한 줄, desc=최대 3줄(양끝 정렬용).',
      'rx: title만(예: 편안한 밤을 위한 팁), sub 생략. items 3개는 title+text(최대 2줄).',
      '',
      '반드시 유효한 JSON 하나만 출력.',
      '{"tierName":"…","tierTag":"키워드1,키워드2,키워드3","head":"…","desc":"…","summary":"…","recs":[{"tag":"휴식","title":"…","desc":"…"},…],"rx":{"title":"편안한 밤을 위한 팁","items":[{"title":"정해진 시간에 잠자기","text":"…"},…]}}',
    ]
      .filter(Boolean)
      .join('\n');

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
        temperature: dialectMode ? 0.95 : 0.78,
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
            desc: fmtRecDesc(r.desc),
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
              desc: fmtRecDesc(x.desc),
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
