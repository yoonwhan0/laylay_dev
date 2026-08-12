'use strict';

/**
 * Module 05 — LAB OVERDRIVE
 * 추가 개발비 0원 조건용: 로컬 계측 + SVG 그래프 과다 출력
 */
(function () {
  var AXIS_DEFS = [
    { key: 'recovery', label: '회복', q: 0 },
    { key: 'focus', label: '집중', q: 1 },
    { key: 'energy', label: '에너지', q: 2 },
    { key: 'drive', label: '추진', q: 3 },
    { key: 'body', label: '신체', q: 4 },
    { key: 'social', label: '사회', q: 5 },
    { key: 'evening', label: '저녁', q: 6 },
    { key: 'desire', label: '욕구', q: 7 },
  ];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function scoreOf(answers, i) {
    var a = answers && answers[i];
    if (!a) return 0;
    if (typeof a.score === 'number') return a.score;
    return 0;
  }

  /** 0~3 레이지 점수 → 0~100 부하 지수 */
  function loadPct(score03) {
    return clamp(Math.round((Number(score03) || 0) * (100 / 3)), 0, 100);
  }

  /** 부하 높을수록 활력은 낮음 */
  function vitalityPct(score03) {
    return 100 - loadPct(score03);
  }

  function buildMetrics(answers, lz) {
    var axes = AXIS_DEFS.map(function (def) {
      var s = scoreOf(answers, def.q);
      return {
        key: def.key,
        label: def.label,
        raw: s,
        load: loadPct(s),
        vitality: vitalityPct(s),
      };
    });

    var avgLoad = Math.round(
      axes.reduce(function (sum, a) {
        return sum + a.load;
      }, 0) / Math.max(axes.length, 1)
    );

    var peak = axes.slice().sort(function (a, b) {
      return b.load - a.load;
    })[0];
    var chill = axes.slice().sort(function (a, b) {
      return a.load - b.load;
    })[0];

    var hourly = [];
    for (var h = 0; h < 24; h++) {
      var wave = Math.sin(((h - 8) / 24) * Math.PI * 2);
      var base = 72 - avgLoad * 0.45;
      var dip = h >= 13 && h <= 15 ? 12 : 0;
      var night = h >= 22 || h <= 5 ? avgLoad * 0.2 : 0;
      var v = clamp(Math.round(base + wave * 18 - dip - night + (50 - (lz || 50)) * 0.08), 5, 98);
      hourly.push({ hour: h, value: v });
    }

    var cohort = clamp(Math.round(38 + (lz || 0) * 0.55 + (peak ? peak.load * 0.08 : 0)), 1, 99);
    var chaosIndex = clamp(Math.round(avgLoad * 0.7 + (lz || 0) * 0.3), 0, 100);
    var napOdds = clamp(Math.round(20 + avgLoad * 0.6 + (lz || 0) * 0.15), 0, 97);
    var doomscroll = clamp(Math.round(15 + loadPct(scoreOf(answers, 7)) * 0.7), 0, 99);

    var heatmap = [
      ['전전두엽', vitalityPct(scoreOf(answers, 1))],
      ['편도체', loadPct(scoreOf(answers, 5))],
      ['소뇌', vitalityPct(scoreOf(answers, 4))],
      ['시상하부', loadPct(scoreOf(answers, 0))],
      ['보상회로', loadPct(scoreOf(answers, 7))],
      ['디폴트모드', avgLoad],
    ].map(function (row) {
      return { label: row[0], value: row[1] };
    });

    return {
      axes: axes,
      radar: axes.slice(0, 6),
      hourly: hourly,
      heatmap: heatmap,
      kpis: {
        lz: lz || 0,
        avgLoad: avgLoad,
        peakLabel: peak ? peak.label : '-',
        chillLabel: chill ? chill.label : '-',
        cohort: cohort,
        chaosIndex: chaosIndex,
        napOdds: napOdds,
        doomscroll: doomscroll,
        tokenDrama: clamp(Math.round(38000 + (lz || 0) * 120 + avgLoad * 80), 36000, 72000),
      },
    };
  }

  function polarPoint(cx, cy, r, angleRad) {
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function svgRadar(axes, size) {
    var n = axes.length || 1;
    var S = size || 280;
    var cx = S / 2;
    var cy = S / 2;
    var R = S * 0.34;
    var rings = [0.25, 0.5, 0.75, 1];
    var ringPaths = rings
      .map(function (t) {
        var pts = [];
        for (var i = 0; i < n; i++) {
          var ang = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
          var p = polarPoint(cx, cy, R * t, ang);
          pts.push(p.x.toFixed(1) + ',' + p.y.toFixed(1));
        }
        return '<polygon points="' + pts.join(' ') + '" class="lab-radar-ring" />';
      })
      .join('');

    var spokes = '';
    var labels = '';
    var dataPts = [];
    for (var i = 0; i < n; i++) {
      var ang = (-Math.PI / 2) + (i * 2 * Math.PI) / n;
      var edge = polarPoint(cx, cy, R, ang);
      spokes +=
        '<line x1="' +
        cx +
        '" y1="' +
        cy +
        '" x2="' +
        edge.x.toFixed(1) +
        '" y2="' +
        edge.y.toFixed(1) +
        '" class="lab-radar-spoke" />';
      var lp = polarPoint(cx, cy, R + 22, ang);
      labels +=
        '<text x="' +
        lp.x.toFixed(1) +
        '" y="' +
        lp.y.toFixed(1) +
        '" class="lab-radar-label">' +
        axes[i].label +
        '</text>';
      var v = clamp((axes[i].load || 0) / 100, 0, 1);
      var dp = polarPoint(cx, cy, R * v, ang);
      dataPts.push(dp.x.toFixed(1) + ',' + dp.y.toFixed(1));
    }

    return (
      '<svg class="lab-svg lab-svg--radar" viewBox="0 0 ' +
      S +
      ' ' +
      S +
      '" role="img" aria-label="레이더 차트">' +
      ringPaths +
      spokes +
      '<polygon points="' +
      dataPts.join(' ') +
      '" class="lab-radar-fill" />' +
      labels +
      '</svg>'
    );
  }

  function svgBars(axes) {
    var max = 100;
    var bars = (axes || [])
      .map(function (a, i) {
        var w = clamp(((a.load || 0) / max) * 100, 2, 100);
        return (
          '<div class="lab-bar-row">' +
          '<span class="lab-bar-label">' +
          a.label +
          '</span>' +
          '<div class="lab-bar-track"><div class="lab-bar-fill" style="width:' +
          w +
          '%;animation-delay:' +
          i * 0.05 +
          's"></div></div>' +
          '<span class="lab-bar-val">' +
          a.load +
          '</span>' +
          '</div>'
        );
      })
      .join('');
    return '<div class="lab-bars" role="img" aria-label="축별 부하 막대">' + bars + '</div>';
  }

  function svgHourly(hourly) {
    var W = 360;
    var H = 140;
    var pad = 16;
    var data = hourly || [];
    if (!data.length) return '';
    var min = 0;
    var max = 100;
    var pts = data.map(function (d, i) {
      var x = pad + (i / Math.max(data.length - 1, 1)) * (W - pad * 2);
      var y = H - pad - ((d.value - min) / (max - min)) * (H - pad * 2);
      return { x: x, y: y, v: d.value, h: d.hour };
    });
    var line = pts
      .map(function (p, i) {
        return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
      })
      .join(' ');
    var area =
      line +
      ' L' +
      pts[pts.length - 1].x.toFixed(1) +
      ' ' +
      (H - pad) +
      ' L' +
      pts[0].x.toFixed(1) +
      ' ' +
      (H - pad) +
      ' Z';
    var ticks = [0, 6, 12, 18, 23]
      .map(function (h) {
        var x = pad + (h / 23) * (W - pad * 2);
        return (
          '<text x="' +
          x.toFixed(1) +
          '" y="' +
          (H - 2) +
          '" class="lab-hour-tick">' +
          String(h).padStart(2, '0') +
          '</text>'
        );
      })
      .join('');
    return (
      '<svg class="lab-svg lab-svg--hourly" viewBox="0 0 ' +
      W +
      ' ' +
      H +
      '" role="img" aria-label="24시간 에너지 곡선">' +
      '<path d="' +
      area +
      '" class="lab-hour-area" />' +
      '<path d="' +
      line +
      '" class="lab-hour-line" />' +
      ticks +
      '</svg>'
    );
  }

  function svgGauge(pct, label) {
    var v = clamp(Number(pct) || 0, 0, 100);
    var r = 54;
    var c = 2 * Math.PI * r;
    var dash = (v / 100) * c;
    return (
      '<div class="lab-gauge">' +
      '<svg class="lab-svg lab-svg--gauge" viewBox="0 0 140 140" role="img" aria-label="' +
      label +
      '">' +
      '<circle cx="70" cy="70" r="' +
      r +
      '" class="lab-gauge-bg" />' +
      '<circle cx="70" cy="70" r="' +
      r +
      '" class="lab-gauge-fg" style="stroke-dasharray:' +
      dash.toFixed(1) +
      ' ' +
      c.toFixed(1) +
      '" />' +
      '<text x="70" y="66" class="lab-gauge-num">' +
      v +
      '</text>' +
      '<text x="70" y="86" class="lab-gauge-unit">%</text>' +
      '</svg>' +
      '<p class="lab-gauge-label">' +
      label +
      '</p></div>'
    );
  }

  function svgHeatmap(cells) {
    return (
      '<div class="lab-heat" role="img" aria-label="가짜 뇌영역 히트맵">' +
      (cells || [])
        .map(function (c) {
          var alpha = 0.12 + (c.value / 100) * 0.75;
          return (
            '<div class="lab-heat-cell" style="--heat:' +
            alpha.toFixed(2) +
            '"><strong>' +
            c.label +
            '</strong><span>' +
            c.value +
            '</span></div>'
          );
        })
        .join('') +
      '</div>'
    );
  }

  window.LabEngine = {
    buildMetrics: buildMetrics,
    svgRadar: svgRadar,
    svgBars: svgBars,
    svgHourly: svgHourly,
    svgGauge: svgGauge,
    svgHeatmap: svgHeatmap,
  };
})();
