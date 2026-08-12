'use strict';

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

  async function fetchCopy(result, answers, questions) {
    var system = [
      '당신은 NIH PROMIS® Global Health 결과를 일반인이 이해하기 쉽게 설명하는 헬스 커뮤니케이션 전문가입니다.',
      '톤: 정중한 해요체. 공신력 있고 차분하며 과장·유머 독설 금지.',
      '의학 진단·치료 지시처럼 단정하지 마세요. 스크리닝/자기보고 해석 수준으로만 쓰세요.',
      'T-score는 미국 일반인구 평균 50, SD 10 기준이며 높을수록 해당 영역 건강이 더 좋음을 의미합니다.',
      '출처(Hays et al., 2017, J Patient Rep Outcomes; PROMIS Global Health v1.2)를 존중해 해석하세요.',
      '줄바꿈: 문장 2~3개마다 \\n.',
      '출력은 반드시 JSON 하나만:',
      '{"head":"…","desc":"…","summary":"…","recs":[{"tag":"신체","title":"…","desc":"…"},{"tag":"정신","title":"…","desc":"…"},{"tag":"일상","title":"…","desc":"…"}]}',
      'head 최대 2문장, desc 2~4문장, summary 8~12문장, recs 정확히 3개.',
    ].join('\n');

    var profile = (answers || [])
      .map(function (a, i) {
        var q = (questions || [])[i];
        return (
          (i + 1) +
          '. [' +
          (a.id || '') +
          '] ' +
          (q ? q.text.replace(/\n/g, ' ') : '') +
          ' → ' +
          (a.label || '') +
          ' (value ' +
          a.value +
          ')'
        );
      })
      .join('\n');

    var user = [
      'GPH-4 T-score(신체): ' + result.physicalT + ' / raw ' + result.physicalRaw + ' · ' + result.physicalBand.label,
      'GMH-4 T-score(정신): ' + result.mentalT + ' / raw ' + result.mentalRaw + ' · ' + result.mentalBand.label,
      'GPH-2 T(참고): ' + result.gph2T + ' · GMH-2 T(참고): ' + result.gmh2T,
      '결합 평균 T: ' + result.combinedT,
      '',
      '응답 프로필:',
      profile,
      '',
      '신체와 정신 점수의 차이를 명확히 설명해 주세요.',
      '진단 금지. 일상에서 시도할 수 있는 가벼운 자기관리 제안만 recs에.',
    ].join('\n');

    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: 3600,
        temperature: 0.55,
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

  function mapToUi(ai, result) {
    var fallbackHead =
      '신체 T ' + result.physicalT + ' · 정신 T ' + result.mentalT;
    var fallbackDesc =
      'PROMIS Global Health 기준으로 신체는 ' +
      result.physicalBand.label +
      ', 정신은 ' +
      result.mentalBand.label +
      ' 구간에 가깝습니다.';
    var fallbackSummary = [
      '이 결과는 NIH PROMIS® Global Health 문항과 Hays 등(2017)이 검토한 간략 척도 구조를 참고해 산출했습니다.',
      'T-score 50은 미국 일반인구 평균, 10점은 대략 1 표준편차입니다.',
      '신체(GPH-4)와 정신(GMH-4)을 따로 보는 것이 해석의 핵심입니다.',
      '점수가 낮더라도 진단이 아니며, 불편이 지속되면 전문가와 상담하는 편이 좋습니다.',
    ].join('\n');

    if (!ai) {
      return {
        title: prose(fallbackHead, true),
        desc: prose(fallbackDesc),
        summary: prose(fallbackSummary),
        recommends: [
          {
            badge: '신체',
            title: '몸을 과하지 않게 움직이기',
            desc: '짧은 걷기나 가벼운 스트레칭으로 신체 리듬을 확인해 보세요.',
          },
          {
            badge: '정신',
            title: '감정 신호를 적어보기',
            desc: '오늘 기분과 생각을 짧게 기록하면 정신 건강 변화 파악에 도움이 됩니다.',
          },
          {
            badge: '일상',
            title: '수면·식사 리듬 점검',
            desc: '수면과 식사 시간이 들쭉날쭉하면 신체·정신 점수 모두에 영향을 줄 수 있어요.',
          },
        ],
        applied: false,
      };
    }

    var recs = Array.isArray(ai.recs) ? ai.recs.slice(0, 3) : [];
    while (recs.length < 3) {
      recs.push({ tag: '일상', title: '천천히 회복하기', desc: '무리한 목표보다 지속 가능한 루틴이 중요합니다.' });
    }

    return {
      title: prose(ai.head || fallbackHead, true),
      desc: prose(ai.desc || fallbackDesc),
      summary: prose(ai.summary || fallbackSummary),
      recommends: recs.map(function (r) {
        return {
          badge: prose(r.tag || '제안', true),
          title: prose(r.title, true),
          desc: prose(r.desc),
        };
      }),
      applied: true,
    };
  }

  window.PromisAi = { fetchCopy: fetchCopy, mapToUi: mapToUi };
})();
