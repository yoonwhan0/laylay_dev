'use strict';

/**
 * PROMIS® Global Health 기반 문항·점수 (모듈 04)
 * 출처:
 * - Hays RD, Schalet BD, Spritzer KL, Cella D.
 *   Two-item PROMIS® global physical and mental health scales.
 *   J Patient Rep Outcomes. 2017;1:2. doi:10.1186/s41687-017-0003-8
 *   PMCID: PMC5934936 / PMID: 29757325
 * - NIH PROMIS® / HealthMeasures Global Health v1.2 (GPH-4 · GMH-4)
 *
 * T-score 변환표는 HealthMeasures PROMIS Global Health scoring 관례
 * (raw sum 4–20 → T, 평균 50·SD 10, 높을수록 건강)를 사용합니다.
 * 임상 진단용이 아니며, 정식 해석은 HealthMeasures Scoring Service를 권장합니다.
 */

(function () {
  var EXCELLENT_POOR = [
    { label: '최상 (Excellent)', value: 5 },
    { label: '매우 좋음 (Very good)', value: 4 },
    { label: '좋음 (Good)', value: 3 },
    { label: '보통 (Fair)', value: 2 },
    { label: '나쁨 (Poor)', value: 1 },
  ];

  var PHYSICAL_ACTIVITY = [
    { label: '완전히 할 수 있음 (Completely)', value: 5 },
    { label: '대부분 할 수 있음 (Mostly)', value: 4 },
    { label: '어느 정도 할 수 있음 (Moderately)', value: 3 },
    { label: '약간 할 수 있음 (A little)', value: 2 },
    { label: '전혀 할 수 없음 (Not at all)', value: 1 },
  ];

  // 논문: 통증 0–10 → 1–5 재코딩(높을수록 통증↑). 합산 시 역채점해 건강↑ 방향으로 맞춤.
  var PAIN = [
    { label: '0 · 통증 없음', coded: 1, value: 5 },
    { label: '1–3 · 가벼운 통증', coded: 2, value: 4 },
    { label: '4–6 · 중간 통증', coded: 3, value: 3 },
    { label: '7–9 · 심한 통증', coded: 4, value: 2 },
    { label: '10 · 최악의 통증', coded: 5, value: 1 },
  ];

  var FATIGUE = [
    { label: '없음 (None)', value: 5 },
    { label: '약간 (Mild)', value: 4 },
    { label: '보통 (Moderate)', value: 3 },
    { label: '심함 (Severe)', value: 2 },
    { label: '매우 심함 (Very severe)', value: 1 },
  ];

  var EMOTIONAL = [
    { label: '전혀 없음 (Never)', value: 5 },
    { label: '거의 없음 (Rarely)', value: 4 },
    { label: '가끔 (Sometimes)', value: 3 },
    { label: '자주 (Often)', value: 2 },
    { label: '항상 (Always)', value: 1 },
  ];

  // HealthMeasures PROMIS Global Physical Health 4a (raw → T)
  var GPH4_T = {
    4: 16.2,
    5: 19.9,
    6: 23.5,
    7: 26.7,
    8: 29.6,
    9: 32.4,
    10: 34.9,
    11: 37.4,
    12: 39.8,
    13: 42.3,
    14: 44.9,
    15: 47.7,
    16: 50.8,
    17: 54.1,
    18: 57.7,
    19: 61.9,
    20: 67.7,
  };

  // HealthMeasures PROMIS Global Mental Health 4a (raw → T)
  var GMH4_T = {
    4: 21.2,
    5: 25.1,
    6: 28.4,
    7: 31.3,
    8: 33.8,
    9: 36.3,
    10: 38.8,
    11: 41.1,
    12: 43.5,
    13: 45.8,
    14: 48.3,
    15: 50.8,
    16: 53.3,
    17: 56.0,
    18: 59.0,
    19: 62.5,
    20: 67.6,
  };

  // 논문 초점인 GPH-2 / GMH-2 (Physical 2a / Mental 2a) 근사 변환표
  var GPH2_T = {
    2: 23.4,
    3: 29.6,
    4: 34.5,
    5: 38.5,
    6: 42.3,
    7: 46.0,
    8: 50.0,
    9: 54.1,
    10: 63.3,
  };

  var GMH2_T = {
    2: 25.8,
    3: 31.5,
    4: 36.0,
    5: 40.0,
    6: 43.8,
    7: 47.5,
    8: 51.5,
    9: 56.0,
    10: 63.0,
  };

  var QUESTIONS = [
    {
      id: 'Global03',
      domain: 'physical',
      core2: true,
      text: '전반적으로 본인의 신체 건강 상태를\n어떻게 평가하시겠습니까?',
      help: 'PROMIS Global03 · GPH-4 / GPH-2',
      options: EXCELLENT_POOR,
    },
    {
      id: 'Global06',
      domain: 'physical',
      core2: true,
      text: '걷기, 계단 오르기, 장바구니 들기, 의자 옮기기 등\n일상적인 신체 활동을 어느 정도까지 할 수 있습니까?',
      help: 'PROMIS Global06 · GPH-4 / GPH-2',
      options: PHYSICAL_ACTIVITY,
    },
    {
      id: 'Global07',
      domain: 'physical',
      core2: false,
      text: '지난 7일 동안 평균적으로\n어느 정도의 통증을 느끼셨습니까?',
      help: 'PROMIS Global07 · 0–10 → 5단계 재코딩 후 역채점',
      options: PAIN,
    },
    {
      id: 'Global08',
      domain: 'physical',
      core2: false,
      text: '지난 7일 동안 평균적으로\n피로도를 어떻게 평가하시겠습니까?',
      help: 'PROMIS Global08 · GPH-4',
      options: FATIGUE,
    },
    {
      id: 'Global02',
      domain: 'mental',
      core2: false,
      text: '전반적으로 당신의 삶의 질은\n어느 정도라고 생각하십니까?',
      help: 'PROMIS Global02 · GMH-4',
      options: EXCELLENT_POOR,
    },
    {
      id: 'Global04',
      domain: 'mental',
      core2: true,
      text: '전반적으로 기분과 사고 능력을 포함한\n정신 건강 상태를 어떻게 평가하시겠습니까?',
      help: 'PROMIS Global04 · GMH-4 / GMH-2',
      options: EXCELLENT_POOR,
    },
    {
      id: 'Global05',
      domain: 'mental',
      core2: true,
      text: '전반적으로 사회 활동 및 인간관계에 대한\n만족도를 어떻게 평가하시겠습니까?',
      help: 'PROMIS Global05 · GMH-4 / GMH-2',
      options: EXCELLENT_POOR,
    },
    {
      id: 'Global10',
      domain: 'mental',
      core2: false,
      text: '감정적인 문제로\n얼마나 자주 괴로워하셨나요?',
      help: 'PROMIS Global10 · GMH-4 (빈도↑ = 점수↓)',
      options: EMOTIONAL,
    },
  ];

  var SOURCE = {
    title: 'Two-item PROMIS® global physical and mental health scales',
    authors: 'Hays RD, Schalet BD, Spritzer KL, Cella D',
    journal: 'Journal of Patient-Reported Outcomes',
    year: 2017,
    doi: '10.1186/s41687-017-0003-8',
    pmcid: 'PMC5934936',
    pmid: '29757325',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5934936/',
    instrument: 'PROMIS® Scale v1.2 — Global Health (GPH-4 · GMH-4, core GPH-2 · GMH-2)',
    note:
      '본 모듈은 NIH PROMIS® 글로벌 건강 문항 구조와 해당 논문의 GPH-2/GMH-2 근거를 참고한 MVP입니다. 의료 진단이 아니며, 정식 임상 채점은 HealthMeasures 가이드를 따르세요.',
  };

  function lookupT(table, raw) {
    var key = Math.max(Math.min(Number(raw) || 0, 20), 2);
    if (table[key] != null) return table[key];
    var keys = Object.keys(table)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    var lo = keys[0];
    var hi = keys[keys.length - 1];
    if (key <= lo) return table[lo];
    if (key >= hi) return table[hi];
    return table[lo];
  }

  function bandFromT(t) {
    if (t >= 60) {
      return {
        id: 'high',
        label: '평균 이상',
        desc: '미국 일반인구 평균(T=50)보다 높은 편입니다.',
      };
    }
    if (t >= 45) {
      return {
        id: 'avg',
        label: '평균 범위',
        desc: '일반인구 평균 근처에 있는 편입니다.',
      };
    }
    if (t >= 35) {
      return {
        id: 'low',
        label: '평균 이하',
        desc: '일반인구 평균보다 낮은 편입니다.',
      };
    }
    return {
      id: 'very_low',
      label: '상당히 낮음',
      desc: '평균보다 뚜렷히 낮은 편으로, 필요 시 전문가 상담을 권합니다.',
    };
  }

  function scoreAnswers(answers) {
    var byId = {};
    (answers || []).forEach(function (a) {
      if (a && a.id) byId[a.id] = a;
    });

    function val(id) {
      return byId[id] && typeof byId[id].value === 'number' ? byId[id].value : null;
    }

    var pIds = ['Global03', 'Global06', 'Global07', 'Global08'];
    var mIds = ['Global02', 'Global04', 'Global05', 'Global10'];
    var pVals = pIds.map(val);
    var mVals = mIds.map(val);
    if (pVals.some(function (v) { return v == null; }) || mVals.some(function (v) { return v == null; })) {
      return null;
    }

    var physicalRaw = pVals.reduce(function (s, v) { return s + v; }, 0);
    var mentalRaw = mVals.reduce(function (s, v) { return s + v; }, 0);
    var gph2Raw = val('Global03') + val('Global06');
    var gmh2Raw = val('Global04') + val('Global05');

    var physicalT = lookupT(GPH4_T, physicalRaw);
    var mentalT = lookupT(GMH4_T, mentalRaw);
    var gph2T = lookupT(GPH2_T, gph2Raw);
    var gmh2T = lookupT(GMH2_T, gmh2Raw);
    var combinedT = Math.round(((physicalT + mentalT) / 2) * 10) / 10;

    return {
      physicalRaw: physicalRaw,
      mentalRaw: mentalRaw,
      physicalT: physicalT,
      mentalT: mentalT,
      gph2Raw: gph2Raw,
      gmh2Raw: gmh2Raw,
      gph2T: gph2T,
      gmh2T: gmh2T,
      combinedT: combinedT,
      physicalBand: bandFromT(physicalT),
      mentalBand: bandFromT(mentalT),
      source: SOURCE,
    };
  }

  window.PromisData = {
    QUESTIONS: QUESTIONS,
    SOURCE: SOURCE,
    scoreAnswers: scoreAnswers,
    bandFromT: bandFromT,
  };
})();
