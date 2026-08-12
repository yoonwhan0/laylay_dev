'use strict';

/**
 * Module 05 — LAB OVERDRIVE AI
 * 추가 개발비 0원 대신 토큰을 아낌없이 태우는 다중 호출 버전
 */
(function () {
  function prose(text, singleLine) {
    if (window.LayTextFormat) {
      return window.LayTextFormat.formatProse(text, singleLine ? { singleLine: true } : undefined);
    }
    return String(text || '').trim();
  }

  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  async function chat(messages, opts) {
    var o = opts || {};
    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: messages,
        max_tokens: o.max_tokens || 5000,
        temperature: typeof o.temperature === 'number' ? o.temperature : 0.95,
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

  function profileBlock(answers, questions, metrics, mode) {
    var lines = (answers || []).map(function (a, i) {
      var q = (questions || [])[i];
      return (
        i +
        1 +
        '. ' +
        (q ? String(q.text || '').replace(/\n/g, ' ') : '') +
        ' → ' +
        (a && a.label ? a.label : '') +
        ' (raw ' +
        (a && a.score != null ? a.score : '?') +
        ')'
      );
    });
    var k = metrics.kpis || {};
    return [
      'Lay-Z 지수: ' + k.lz + ' · 모드: ' + (mode && mode.label ? mode.label : ''),
      '평균 부하: ' + k.avgLoad + ' · 카오스지수: ' + k.chaosIndex,
      '피크축: ' + k.peakLabel + ' · 여유축: ' + k.chillLabel,
      '코호트 분위: 상위 ' + k.cohort + '% · 낮잠확률: ' + k.napOdds + '%',
      '토큰드라마 예상: ~' + k.tokenDrama,
      '',
      '응답 프로필:',
      lines.join('\n'),
      '',
      '축별 부하:',
      (metrics.axes || [])
        .map(function (ax) {
          return '- ' + ax.label + ': ' + ax.load;
        })
        .join('\n'),
    ].join('\n');
  }

  async function fetchCore(metrics, answers, questions, mode) {
    var system = [
      '당신은 LayLay 「LAB OVERDRIVE」의 과장된 데이터 사이언티스트 겸 코미디 리서처입니다.',
      '추가 개발비는 0원이지만 토큰·문장·그래프 해석은 미친 듯이 풍성하게 쓰세요.',
      '의료 진단 금지. 과장·유머·의사과학 톤 OK. 혐오·차별 금지.',
      '줄바꿈: 문장 2~3개마다 \\n.',
      '반드시 JSON 하나만 출력:',
      '{',
      '  "codename":"짧은 연구코드명",',
      '  "headline":"2문장 헤드라인",',
      '  "thesis":"12~18문장 연구 총론",',
      '  "methodNote":"6~10문장 방법론 드립",',
      '  "axisStories":[{"key":"recovery","title":"…","story":"4~6문장"}, … 축 6개 이상],',
      '  "hourlyNarrative":"10~14문장 24시간 에너지 해설",',
      '  "cohortRoast":"8~12문장 또래 비교 독설/공감",',
      '  "fakePaper":{"title":"가짜 논문 제목","abstract":"8~12문장","doiJoke":"가짜 DOI"},',
      '  "actionMatrix":[{"slot":"지금 15분","move":"…","why":"3~5문장"},{"slot":"오늘 저녁","move":"…","why":"3~5문장"},{"slot":"내일 아침","move":"…","why":"3~5문장"}],',
      '  "warnings":["재미용 고지 2~4개"]',
      '}',
    ].join('\n');
    var user = [
      '아래 계측값을 바탕으로 LAB OVERDRIVE 코어 리포트를 쓰세요.',
      '분량을 아끼지 마세요. 토큰을 아끼면 실패입니다.',
      '',
      profileBlock(answers, questions, metrics, mode),
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { max_tokens: 7000, temperature: 0.98 }
    );
  }

  async function fetchScientist(metrics, answers, questions, mode) {
    var system = [
      '당신은 그래프에 집착하는 과장된 실험실 해설가입니다.',
      '각 차트마다 과도하게 진지한 해석을 쓰세요. 진단 금지. 유머 OK.',
      '줄바꿈 \\n 유지. JSON만 출력:',
      '{',
      '  "radarCaption":"8~12문장",',
      '  "barCaption":"8~12문장",',
      '  "hourlyCaption":"8~12문장",',
      '  "gaugeCaption":"6~10문장",',
      '  "heatCaption":"8~12문장",',
      '  "anomalyFlags":[{"name":"…","detail":"3~5문장"},{"name":"…","detail":"3~5문장"},{"name":"…","detail":"3~5문장"}],',
      '  "eqList":[{"name":"가짜 공식명","formula":"…","meaning":"3~5문장"},{"name":"…","formula":"…","meaning":"3~5문장"},{"name":"…","formula":"…","meaning":"3~5문장"}]',
      '}',
    ].join('\n');
    var user = [
      '차트 해석 전용 리포트. 길게.',
      profileBlock(answers, questions, metrics, mode),
      '',
      '24h 샘플(매 3시간):',
      (metrics.hourly || [])
        .filter(function (_, i) {
          return i % 3 === 0;
        })
        .map(function (h) {
          return h.hour + '시=' + h.value;
        })
        .join(', '),
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { max_tokens: 4500, temperature: 0.92 }
    );
  }

  async function fetchChaos(metrics, answers, questions, mode) {
    var system = [
      '당신은 평행우주 시뮬레이터 + 드립 작가입니다.',
      '토큰을 아낌없이 써 시나리오를 풍성하게. 진단 금지.',
      '줄바꿈 \\n. JSON만:',
      '{',
      '  "timelines":[{"title":"…","odds":12,"story":"8~12문장"},{"title":"…","odds":33,"story":"8~12문장"},{"title":"…","odds":55,"story":"8~12문장"},{"title":"…","odds":77,"story":"8~12문장"}],',
      '  "bossBattle":{"enemy":"…","hp":100,"strategy":"10~14문장"},',
      '  "playlistMood":{"title":"…","tracks":["…","…","…","…","…"],"why":"6~10문장"},',
      '  "closingMicDrop":"10~16문장 엔딩 독백"',
      '}',
    ].join('\n');
    var user = [
      '카오스 시뮬. 길게. 재미 최우선.',
      profileBlock(answers, questions, metrics, mode),
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      { max_tokens: 5000, temperature: 1.05 }
    );
  }

  async function runLabBundle(metrics, answers, questions, mode) {
    var started = Date.now();
    var results = await Promise.all([
      fetchCore(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchScientist(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchChaos(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
    ]);
    return {
      core: results[0],
      scientist: results[1],
      chaos: results[2],
      meta: {
        calls: 3,
        elapsedMs: Date.now() - started,
        estimatedTokens: (metrics.kpis && metrics.kpis.tokenDrama) || 0,
        budgetNote: '추가 개발비 0원 · 토큰은 실험실 예산으로 태움',
      },
    };
  }

  function fallbackBundle(metrics, mode) {
    var k = metrics.kpis || {};
    return {
      core: {
        codename: 'LZ-LAB-' + String(k.lz || 0).padStart(2, '0'),
        headline: '추가 개발비는 없어도, 그래프와 토큰은 남아 있습니다.',
        thesis:
          '오늘 당신의 Lay-Z 지수는 ' +
          k.lz +
          '점입니다.\\n실험실은 이를 ‘활동 회피 성향의 일시적 스파이크’로 해석합니다.\\n피크 축은 ' +
          k.peakLabel +
          ', 여유 축은 ' +
          k.chillLabel +
          '입니다.\\n이 리포트는 재미용이며 의료 진단이 아닙니다.',
        methodNote:
          '방법론: 8문항 원점수를 0–100 부하로 환산하고 레이더·막대·24h 곡선·게이지·히트맵을 동시에 그립니다.\\nAI가 응답하면 해석 문장이 더 길어집니다.',
        axisStories: (metrics.radar || []).map(function (a) {
          return {
            key: a.key,
            title: a.label + ' 채널',
            story: a.label + ' 부하 ' + a.load + '.\\n오늘의 리듬에서 눈에 띄는 축입니다.',
          };
        }),
        hourlyNarrative: '24시간 곡선은 오전 상승·식후 딥·야간 하강을 기본 파형으로 그렸습니다.',
        cohortRoast: '추정 코호트 분위는 상위 ' + k.cohort + '% 부근입니다.\\n같은 점수대의 가상의 동료들과 비교한 드립입니다.',
        fakePaper: {
          title: 'On the Semiotics of Horizontal Living: A Lay-Z Field Note',
          abstract: '본 가짜 초록은 누움의 미학을 과잉 해석합니다.\\n실제 학술 논문이 아닙니다.',
          doiJoke: '10.0000/laylay.lab.overdrive',
        },
        actionMatrix: [
          { slot: '지금 15분', move: '물 한 잔 + 창밖 60초', why: '미세한 각성 리셋.' },
          { slot: '오늘 저녁', move: '할 일 1개만 남기고 끄기', why: '과부하 차단.' },
          { slot: '내일 아침', move: '기상 후 햇빛 2분', why: '회복 신호 점검.' },
        ],
        warnings: ['재미·브랜드 실험용', '의료 진단 아님', '토큰 사용량 많음'],
      },
      scientist: {
        radarCaption: '레이더는 축별 부하 분포입니다.\\n뾰족할수록 그 축이 오늘을 지배합니다.',
        barCaption: '막대는 문항별 부하입니다.\\n길수록 “아, 여기 힘들구나”입니다.',
        hourlyCaption: '24h 곡선은 로컬 파형 + 점수 보정입니다.\\n미래 예언이 아니라 분위기 차트입니다.',
        gaugeCaption: '게이지는 코호트·낮잠·둠스크롤 확률의 과장된 요약입니다.',
        heatCaption: '히트맵은 가짜 뇌영역 매핑입니다.\\n과학처럼 보이지만 엔터테인먼트입니다.',
        anomalyFlags: [
          { name: '피크 축 과열', detail: k.peakLabel + ' 부하가 상대적으로 높습니다.' },
          { name: '카오스 지수', detail: '카오스 ' + k.chaosIndex + ' — 서사가 길어질 구간.' },
        ],
        eqList: [
          {
            name: 'Lazy Flux',
            formula: 'LF = 0.45·AvgLoad + 0.35·LZ + 0.2·Peak',
            meaning: '오늘 누움 성향의 합성 지표.',
          },
        ],
      },
      chaos: {
        timelines: [
          {
            title: '소파 싱귤래리티',
            odds: 42,
            story: '저녁이 소파로 수렴하는 평행우주.\\n그래도 내일은 리셋 가능합니다.',
          },
          {
            title: '15분 영웅',
            odds: 31,
            story: '짧은 산책 하나로 곡선이 살짝 올라가는 세계선.',
          },
        ],
        bossBattle: {
          enemy: '이불의 중력정',
          hp: 100,
          strategy: '정면돌파 금지.\\n물·햇빛·작은 이동으로 체력을 깎으세요.',
        },
        playlistMood: {
          title: 'Horizontal Anthems',
          tracks: ['Slow Pulse', 'Soft Alarm', 'Couch Drift', 'Warm Lamp', 'Reset Tomorrow'],
          why: '템포를 낮춘 분위기용 가상 트랙리스트.',
        },
        closingMicDrop:
          '추가 개발비는 없어도 실험은 끝났습니다.\\n그래프는 많이 그렸고, 해석은 길게 남겼습니다.\\n오늘은 스스로를 데이터로 웃어주세요.',
      },
      meta: {
        calls: 0,
        elapsedMs: 0,
        estimatedTokens: k.tokenDrama || 0,
        budgetNote: '추가 개발비 0원 · AI 실패 시 로컬 폴백',
        fallback: true,
        modeLabel: mode && mode.label ? mode.label : '',
      },
    };
  }

  function mapToUi(bundle, metrics, mode) {
    var base = fallbackBundle(metrics, mode);
    var b = bundle || {};
    var core = b.core || base.core;
    var scientist = b.scientist || base.scientist;
    var chaos = b.chaos || base.chaos;
    var meta = Object.assign({}, base.meta, b.meta || {});

    function storyList(list, fallback) {
      if (!Array.isArray(list) || !list.length) return fallback;
      return list.map(function (item) {
        return {
          key: item.key || '',
          title: prose(item.title || item.name || '', true),
          story: prose(item.story || item.detail || item.why || ''),
        };
      });
    }

    return {
      metrics: metrics,
      meta: meta,
      codename: prose(core.codename || base.core.codename, true),
      headline: prose(core.headline || base.core.headline),
      thesis: prose(core.thesis || base.core.thesis),
      methodNote: prose(core.methodNote || base.core.methodNote),
      axisStories: storyList(core.axisStories, base.core.axisStories),
      hourlyNarrative: prose(core.hourlyNarrative || base.core.hourlyNarrative),
      cohortRoast: prose(core.cohortRoast || base.core.cohortRoast),
      fakePaper: {
        title: prose((core.fakePaper && core.fakePaper.title) || base.core.fakePaper.title, true),
        abstract: prose((core.fakePaper && core.fakePaper.abstract) || base.core.fakePaper.abstract),
        doiJoke: prose((core.fakePaper && core.fakePaper.doiJoke) || base.core.fakePaper.doiJoke, true),
      },
      actionMatrix: (Array.isArray(core.actionMatrix) && core.actionMatrix.length
        ? core.actionMatrix
        : base.core.actionMatrix
      ).map(function (a) {
        return {
          slot: prose(a.slot, true),
          move: prose(a.move, true),
          why: prose(a.why),
        };
      }),
      warnings: (core.warnings || base.core.warnings || []).map(function (w) {
        return prose(w, true);
      }),
      captions: {
        radar: prose(scientist.radarCaption || base.scientist.radarCaption),
        bar: prose(scientist.barCaption || base.scientist.barCaption),
        hourly: prose(scientist.hourlyCaption || base.scientist.hourlyCaption),
        gauge: prose(scientist.gaugeCaption || base.scientist.gaugeCaption),
        heat: prose(scientist.heatCaption || base.scientist.heatCaption),
      },
      anomalyFlags: storyList(scientist.anomalyFlags, base.scientist.anomalyFlags),
      eqList: (Array.isArray(scientist.eqList) && scientist.eqList.length
        ? scientist.eqList
        : base.scientist.eqList
      ).map(function (e) {
        return {
          name: prose(e.name, true),
          formula: prose(e.formula, true),
          meaning: prose(e.meaning),
        };
      }),
      timelines: (Array.isArray(chaos.timelines) && chaos.timelines.length
        ? chaos.timelines
        : base.chaos.timelines
      ).map(function (t) {
        return {
          title: prose(t.title, true),
          odds: Number(t.odds) || 0,
          story: prose(t.story),
        };
      }),
      bossBattle: {
        enemy: prose((chaos.bossBattle && chaos.bossBattle.enemy) || base.chaos.bossBattle.enemy, true),
        hp: Number((chaos.bossBattle && chaos.bossBattle.hp) || 100),
        strategy: prose((chaos.bossBattle && chaos.bossBattle.strategy) || base.chaos.bossBattle.strategy),
      },
      playlistMood: {
        title: prose((chaos.playlistMood && chaos.playlistMood.title) || base.chaos.playlistMood.title, true),
        tracks: ((chaos.playlistMood && chaos.playlistMood.tracks) || base.chaos.playlistMood.tracks || []).map(
          function (t) {
            return prose(t, true);
          }
        ),
        why: prose((chaos.playlistMood && chaos.playlistMood.why) || base.chaos.playlistMood.why),
      },
      closingMicDrop: prose(chaos.closingMicDrop || base.chaos.closingMicDrop),
      applied: !!(b.core || b.scientist || b.chaos) && !meta.fallback,
    };
  }

  window.LabAi = {
    runLabBundle: runLabBundle,
    mapToUi: mapToUi,
    fallbackBundle: fallbackBundle,
  };
})();
