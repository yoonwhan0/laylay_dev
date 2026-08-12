'use strict';

/**
 * Module 05 — LAB OVERDRIVE AI
 * 토큰은 많이, 결과 문장은 길고 읽기 쉽게 (병렬 5호출)
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
        max_tokens: o.max_tokens || 12000,
        temperature: typeof o.temperature === 'number' ? o.temperature : 0.85,
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
      '',
      '작성 규칙:',
      '- 분량은 길게(토큰을 아끼지 말 것). 짧게 쓰면 실패.',
      '- 문장은 읽기 쉽게. 산만한 말장난·의식의 흐름·탭/스티커 연출 금지.',
      '- 구조적으로 쓰되 풍성하게. 의료 진단·혐오 금지.',
      '- 줄바꿈: 문장 2~3개마다 \\n.',
    ].join('\n');
  }

  async function fetchCore(metrics, answers, questions, mode) {
    var system = [
      '당신은 LayLay LAB OVERDRIVE의 데이터 스토리텔러입니다.',
      '길고 풍성하지만 정돈된 리포트를 씁니다. 산만한 톤 금지.',
      'JSON만 출력:',
      '{',
      '  "codename":"짧은 연구코드",',
      '  "headline":"2~3문장 헤드라인",',
      '  "thesis":"18~28문장 총론",',
      '  "methodNote":"10~14문장 방법 설명",',
      '  "axisStories":[{"key":"…","title":"…","story":"8~12문장"} 정확히 8개],',
      '  "hourlyNarrative":"14~20문장",',
      '  "cohortRoast":"12~18문장 (유머 OK, 정돈된 문장)",',
      '  "fakePaper":{"title":"…","abstract":"12~18문장","doiJoke":"…","keywords":["…","…","…","…","…"]},',
      '  "actionMatrix":[{"slot":"…","move":"…","why":"6~10문장"} 정확히 5개],',
      '  "warnings":["재미용","진단 아님"]',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '코어 리포트. 길게, 읽기 쉽게.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 14000, temperature: 0.9 }
    );
  }

  async function fetchScientist(metrics, answers, questions, mode) {
    var system = [
      '차트 해설가. 과잉 해석해도 되지만 문장은 명료하게. 진단 금지.',
      'JSON만:',
      '{',
      '  "radarCaption":"12~18문장",',
      '  "barCaption":"12~18문장",',
      '  "hourlyCaption":"12~18문장",',
      '  "gaugeCaption":"10~16문장",',
      '  "heatCaption":"12~18문장",',
      '  "anomalyFlags":[{"name":"…","detail":"6~10문장"} 정확히 5개],',
      '  "eqList":[{"name":"…","formula":"…","meaning":"6~10문장"} 정확히 5개],',
      '  "footnoteSpiral":"12~18문장 보충 설명"',
      '}',
    ].join('\n');
    var hours = (metrics.hourly || [])
      .filter(function (_, i) {
        return i % 2 === 0;
      })
      .map(function (h) {
        return h.hour + '시=' + h.value;
      })
      .join(', ');
    return chat(
      [
        { role: 'system', content: system },
        {
          role: 'user',
          content: '차트 해설.\n\n' + profileBlock(answers, questions, metrics, mode) + '\n\n24h: ' + hours,
        },
      ],
      { max_tokens: 12000, temperature: 0.85 }
    );
  }

  async function fetchChaos(metrics, answers, questions, mode) {
    var system = [
      '시나리오 작가. 재미있되 정돈된 문단으로. 산만 연출 금지. 진단 금지.',
      'JSON만:',
      '{',
      '  "timelines":[{"title":"…","odds":12,"story":"10~16문장"} 정확히 5개],',
      '  "bossBattle":{"enemy":"…","hp":100,"strategy":"14~20문장","loot":["…","…","…"]},',
      '  "playlistMood":{"title":"…","tracks":["…"] 8개,"why":"10~14문장"},',
      '  "closingMicDrop":"14~22문장",',
      '  "glitchAside":"6~10문장 짧은 여담"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '시나리오 리포트.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 12000, temperature: 0.95 }
    );
  }

  async function fetchDeep(metrics, answers, questions, mode) {
    var system = [
      '생활 설계 코치. 길고 구체적·정돈된 제안. 진단 금지.',
      'JSON만:',
      '{',
      '  "dayPlan":[{"hour":"09:00","focus":"…","detail":"6~10문장"} 정확히 8개],',
      '  "recoveryStack":[{"title":"…","steps":["…","…","…"],"why":"8~12문장"} 정확히 4개],',
      '  "riskWatch":[{"signal":"…","ifThen":"8~12문장"} 정확히 5개],',
      '  "peerCompare":"16~24문장",',
      '  "weeklyArc":"16~24문장"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '심층 생활 설계.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 14000, temperature: 0.88 }
    );
  }

  async function fetchEssay(metrics, answers, questions, mode) {
    var system = [
      '긴 에세이 작가. 한 편의 읽기 좋은 글로. 산만·말줄임표 남발 금지. 진단 금지.',
      'JSON만:',
      '{',
      '  "essayTitle":"…",',
      '  "essayBody":"36~55문장. 단락을 \\n\\n으로 구분",',
      '  "letterToSelf":"18~28문장",',
      '  "keyTakeaways":["한 줄 요약"] 정확히 7개,',
      '  "closingNote":"10~14문장"',
      '}',
    ].join('\n');
    return chat(
      [
        { role: 'system', content: system },
        { role: 'user', content: '에세이형 심층 해석.\n\n' + profileBlock(answers, questions, metrics, mode) },
      ],
      { max_tokens: 14000, temperature: 0.9 }
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
      fetchDeep(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
      fetchEssay(metrics, answers, questions, mode).catch(function () {
        return null;
      }),
    ]);
    var est = (metrics.kpis && metrics.kpis.tokenDrama) || 0;
    return {
      core: results[0],
      scientist: results[1],
      chaos: results[2],
      deep: results[3],
      essay: results[4],
      meta: {
        calls: 5,
        elapsedMs: Date.now() - started,
        estimatedTokens: Math.max(est, 42000),
      },
    };
  }

  function fallbackBundle(metrics, mode) {
    var k = metrics.kpis || {};
    return {
      core: {
        codename: 'LZ-LAB-' + String(k.lz || 0).padStart(2, '0'),
        headline: '오늘 점수를 데이터 보드와 긴 해석으로 풀어봤습니다.',
        thesis:
          '오늘 Lay-Z 지수는 ' +
          k.lz +
          '점입니다.\\n피크 축은 ' +
          k.peakLabel +
          ', 여유 축은 ' +
          k.chillLabel +
          '입니다.\\n이 리포트는 재미·브랜드 실험용이며 의료 진단이 아닙니다.',
        methodNote: '8문항을 축별 부하로 환산하고 레이더·막대·24h·게이지·히트맵과 함께 해석합니다.',
        axisStories: (metrics.radar || []).map(function (a) {
          return {
            key: a.key,
            title: a.label + ' 채널',
            story: a.label + ' 부하 ' + a.load + '.\\n오늘의 리듬에서 눈에 띄는 축입니다.',
          };
        }),
        hourlyNarrative: '24시간 곡선은 오전 상승, 오후 딥, 야간 하강을 기본으로 점수 보정을 더했습니다.',
        cohortRoast: '추정 코호트 분위는 상위 ' + k.cohort + '% 부근입니다.',
        fakePaper: {
          title: 'A Field Note on Horizontal Afternoons',
          abstract: '가짜 초록입니다. 실제 학술 논문이 아닙니다.',
          doiJoke: '10.0000/laylay.lab.overdrive',
          keywords: ['recovery', 'energy', 'sleep', 'drive', 'rest'],
        },
        actionMatrix: [
          { slot: '지금 15분', move: '물 한 잔 + 창밖 60초', why: '가벼운 리셋.' },
          { slot: '오늘 저녁', move: '할 일 1개만 남기기', why: '과부하 차단.' },
          { slot: '내일 아침', move: '햇빛 2분', why: '회복 신호 점검.' },
        ],
        warnings: ['재미용', '의료 진단 아님'],
      },
      scientist: {
        radarCaption: '레이더는 축별 부하 분포입니다.',
        barCaption: '막대는 문항별 부하입니다.',
        hourlyCaption: '24h 곡선은 분위기 차트입니다.',
        gaugeCaption: '게이지는 요약 지표입니다.',
        heatCaption: '히트맵은 엔터테인먼트용 매핑입니다.',
        anomalyFlags: [{ name: '피크 축', detail: k.peakLabel + ' 부하가 상대적으로 높습니다.' }],
        eqList: [
          {
            name: 'Lazy Flux',
            formula: 'LF = 0.45·AvgLoad + 0.35·LZ + 0.2·Peak',
            meaning: '오늘 누움 성향 합성 지표.',
          },
        ],
        footnoteSpiral: '위 수치는 로컬 계측과 응답 기반 추정입니다.',
      },
      chaos: {
        timelines: [
          { title: '회복 루트', odds: 48, story: '작은 루틴이 곡선을 부드럽게 만듭니다.' },
          { title: '과로 루트', odds: 27, story: '무리하면 저녁 딥이 깊어질 수 있습니다.' },
        ],
        bossBattle: {
          enemy: '이불의 중력',
          hp: 100,
          strategy: '정면 돌파보다 작은 이동으로 체력을 깎으세요.',
          loot: ['물', '햇빛', '짧은 산책'],
        },
        playlistMood: {
          title: 'Steady Reset',
          tracks: ['Soft Start', 'Warm Lamp', 'Slow Pulse', 'Open Window'],
          why: '템포를 낮춘 가상 플레이리스트입니다.',
        },
        closingMicDrop: '길게 읽었으니, 지금은 하나만 실행해도 충분합니다.',
        glitchAside: '그래프는 많지만, 결론은 단순해도 됩니다.',
      },
      deep: {
        dayPlan: [
          { hour: '09:00', focus: '가볍게 시작', detail: '큰 목표보다 첫 동작.' },
          { hour: '14:00', focus: '딥 대비', detail: '짧은 산책이나 스트레칭.' },
          { hour: '22:00', focus: '종료 루틴', detail: '화면 밝기·할 일 정리.' },
        ],
        recoveryStack: [
          {
            title: '최소 회복 세트',
            steps: ['물', '스트레칭', '호흡 10회'],
            why: '부담 없이 반복 가능합니다.',
          },
        ],
        riskWatch: [{ signal: '오후 급락', ifThen: '식후 10분 이동을 넣어보세요.' }],
        peerCompare: '비슷한 점수대는 저녁 회복을 먼저 챙기는 편입니다.',
        weeklyArc: '이번 주는 매일 작은 회복 한 가지를 고정해보세요.',
      },
      essay: {
        essayTitle: '오늘을 숫자로 읽고, 문장으로 돌려주기',
        essayBody: '점수는 오늘 리듬의 스케치입니다.\\n\\n완벽하지 않아도, 방향만 잡으면 충분합니다.',
        letterToSelf: '오늘 무리하지 않아도 됩니다.\\n다만 완전히 놓치지만은 말아주세요.',
        keyTakeaways: ['피크 축을 기억하기', '저녁 루틴 1개', '물·햇빛·짧은 이동'],
        closingNote: '긴 리포트의 끝은 짧은 행동 하나입니다.',
      },
      meta: {
        calls: 0,
        elapsedMs: 0,
        estimatedTokens: k.tokenDrama || 0,
        fallback: true,
      },
    };
  }

  function mapList(list, mapFn, fallback) {
    if (!Array.isArray(list) || !list.length) return fallback;
    return list.map(mapFn);
  }

  function mapToUi(bundle, metrics, mode) {
    var base = fallbackBundle(metrics, mode);
    var b = bundle || {};
    var core = b.core || base.core;
    var scientist = b.scientist || base.scientist;
    var chaos = b.chaos || base.chaos;
    var deep = b.deep || base.deep;
    var essay = b.essay || base.essay;
    var meta = Object.assign({}, base.meta, b.meta || {});

    function storyList(list, fallback) {
      return mapList(
        list,
        function (item) {
          return {
            key: item.key || '',
            title: prose(item.title || item.name || item.signal || '', true),
            story: prose(item.story || item.detail || item.why || item.ifThen || ''),
          };
        },
        fallback
      );
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
        keywords: ((core.fakePaper && core.fakePaper.keywords) || base.core.fakePaper.keywords || []).map(function (x) {
          return prose(x, true);
        }),
      },
      actionMatrix: mapList(
        core.actionMatrix,
        function (a) {
          return { slot: prose(a.slot, true), move: prose(a.move, true), why: prose(a.why) };
        },
        base.core.actionMatrix
      ),
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
      eqList: mapList(
        scientist.eqList,
        function (e) {
          return {
            name: prose(e.name, true),
            formula: prose(e.formula, true),
            meaning: prose(e.meaning),
          };
        },
        base.scientist.eqList
      ),
      footnoteSpiral: prose(scientist.footnoteSpiral || base.scientist.footnoteSpiral || ''),
      timelines: mapList(
        chaos.timelines,
        function (t) {
          return { title: prose(t.title, true), odds: Number(t.odds) || 0, story: prose(t.story) };
        },
        base.chaos.timelines
      ),
      bossBattle: {
        enemy: prose((chaos.bossBattle && chaos.bossBattle.enemy) || base.chaos.bossBattle.enemy, true),
        hp: Number((chaos.bossBattle && chaos.bossBattle.hp) || 100),
        strategy: prose((chaos.bossBattle && chaos.bossBattle.strategy) || base.chaos.bossBattle.strategy),
        loot: ((chaos.bossBattle && chaos.bossBattle.loot) || base.chaos.bossBattle.loot || []).map(function (x) {
          return prose(x, true);
        }),
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
      glitchAside: prose(chaos.glitchAside || base.chaos.glitchAside || ''),
      dayPlan: mapList(
        deep.dayPlan,
        function (d) {
          return {
            hour: prose(d.hour, true),
            focus: prose(d.focus, true),
            detail: prose(d.detail),
          };
        },
        base.deep.dayPlan
      ),
      recoveryStack: mapList(
        deep.recoveryStack,
        function (r) {
          return {
            title: prose(r.title, true),
            steps: (r.steps || []).map(function (s) {
              return prose(s, true);
            }),
            why: prose(r.why),
          };
        },
        base.deep.recoveryStack
      ),
      riskWatch: storyList(deep.riskWatch, base.deep.riskWatch),
      peerCompare: prose(deep.peerCompare || base.deep.peerCompare),
      weeklyArc: prose(deep.weeklyArc || base.deep.weeklyArc),
      essayTitle: prose(essay.essayTitle || base.essay.essayTitle, true),
      essayBody: prose(essay.essayBody || base.essay.essayBody),
      letterToSelf: prose(essay.letterToSelf || base.essay.letterToSelf),
      keyTakeaways: (essay.keyTakeaways || base.essay.keyTakeaways || []).map(function (t) {
        return prose(t, true);
      }),
      closingNote: prose(essay.closingNote || base.essay.closingNote),
      applied: !!(b.core || b.scientist || b.chaos || b.deep || b.essay) && !meta.fallback,
    };
  }

  window.LabAi = {
    runLabBundle: runLabBundle,
    mapToUi: mapToUi,
    fallbackBundle: fallbackBundle,
  };
})();
