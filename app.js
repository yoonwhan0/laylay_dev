/**
 * Lay Lay 피드백 설문 문항을 한곳에 모아 두는 파일입니다.
 *
 * 로컬(Node.js):
 *   node app.js              글(마크다운): 질문 초안 + 만들 때 확인할 일
 *   node app.js --markdown   위와 같음
 *   node app.js --csv        표(CSV): 다른 프로그램에 붙여 넣기용
 *   node app.js --json       데이터(JSON): 다른 용도로 가공할 때
 *
 * Google Apps Script:
 *
 *   【실행할 함수】「myFunction」 또는 「폼만들고링크출력」만 실행하세요.
 *   「typeLabel」은 설문을 만들지 않습니다(실행해도 링크 없음).
 *
 *   【권장】스프레드시트에 붙인 스크립트에서 실행 (유튜브와 동일하게 팝업·A열에 링크)
 *   1) 새 스프레드시트 열기
 *   2) 「확장 프로그램」→「Apps Script」
 *   3) 기본 코드 삭제 후 이 파일 전체 붙여 넣기
 *   4) 함수 목록에서 「myFunction」→ 실행(▶) → 스프레드시트 탭으로 돌아가 A열·알림 확인
 *      · SpreadsheetApp.getUi().alert() 는 「스프레드시트에 연결된」 스크립트에서만 동작합니다.
 *      · script.google.com 만 있는 단독 프로젝트에서는 팝업이 안 뜨는 것이 정상입니다.
 *
 *   【그 외 링크 확인】웹 앱 URL 새로고침 · 메일 · 실행 기록→해당 실행 클릭→콘솔
 *   질문 초안 텍스트만: 웹앱 주소 뒤에 ?format=md
 */

'use strict';

/**
 * @typedef {{
 *   id: string,
 *   title: string,
 *   help?: string,
 *   type: 'section'|'short'|'paragraph'|'multiple_choice'|'checkbox'|'linear_scale',
 *   options?: string[],
 *   scaleMin?: number,
 *   scaleMax?: number,
 *   scaleLowLabel?: string,
 *   scaleHighLabel?: string
 * }} SurveyItem
 */

/** @type {SurveyItem[]} — Lay-Z + Lay-몽, 꼭 필요한 것만 짧게 */
const SURVEY_ITEMS = [
  {
    id: 'sec_intro',
    type: 'section',
    title: '시작하기',
    help: '아래로 내려가며 한 번만 제출하면 됩니다. 안 해 본 체험은 해당 칸에 **해당 없음**만 적어 주세요.',
  },
  {
    id: 'feedback_targets',
    title: '어떤 걸 해 보셨나요? (해당하는 것만 모두 체크)',
    type: 'checkbox',
    options: ['Lay-Z력 테스트', 'Lay-몽', '처음 메뉴(두 체험 사이 화면)도 봤음'],
    help: '실제로 해 본 것만 골라 주세요. 체크한 것에 맞춰 아래 칸을 채워 주시면 됩니다.',
  },
  {
    id: 'overall_satisfaction',
    title: '전체적으로 만족하셨나요? (Lay-Z와 Lay-몽 합쳐서)',
    type: 'linear_scale',
    scaleMin: 1,
    scaleMax: 5,
    scaleLowLabel: '전혀 아님',
    scaleHighLabel: '매우 만족',
    help: '1~5 중에서 골라 주세요.',
  },

  { id: 'sec_layz', type: 'section', title: 'Lay-Z력 테스트' },

  {
    id: 'layz_feedback',
    title: 'Lay-Z에 대해 (써보셨을 때만)',
    type: 'paragraph',
    help:
      '**좋았던 점**, **불편하거나 아쉬웠던 점**, **이렇게 바뀌면 좋겠다**를 한 칸에 적어 주셔도 됩니다. 안 썼다면 **해당 없음**.',
  },

  { id: 'sec_mong', type: 'section', title: 'Lay-몽' },

  {
    id: 'mong_feedback',
    title: 'Lay-몽에 대해 (써보셨을 때만)',
    type: 'paragraph',
    help:
      '**좋았던 점**, **불편하거나 아쉬웠던 점**, **이렇게 바뀌면 좋겠다**를 한 칸에 적어 주셔도 됩니다. 안 썼다면 **해당 없음**.',
  },

  {
    id: 'free_text',
    title: '더 하고 싶은 말 (있을 때만)',
    type: 'paragraph',
    help: '화면·말투·자동 답 내용·속도 등, 위 칸에 못 담은 것이 있으면 적어 주세요. 없으면 비워 두셔도 됩니다.',
  },
];

const META = {
  formTitle: 'Lay Lay 피드백 (Lay-Z · Lay-몽)',
  intro:
    'Lay-Z력 테스트와 Lay-몽에 대한 의견을 **짧은 설문 한 번**에 모읍니다. 잘 모르겠는 칸은 비우거나 **해당 없음**만 적어 주세요.',
  internalNote:
    '구글 폼에서는 구역만 나누고, 페이지를 잘게 나누지 않아도 됩니다.',
};

function typeLabel(t) {
  const map = {
    section: '구역 제목만 있는 줄(구분용)',
    short: '짧게 한 줄로 적는 칸',
    paragraph: '길게 여러 줄로 적는 칸',
    multiple_choice: '보기 중 하나만 고르기',
    checkbox: '보기 여러 개 골라도 됨',
    linear_scale: '1~5점처럼 숫자로 고르는 칸',
  };
  return map[t] || t;
}

function toMarkdown() {
  const lines = [];
  lines.push(`# ${META.formTitle}`);
  lines.push('');
  lines.push(META.intro);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 설문지에 옮겨 적을 질문 초안');
  lines.push('');
  var qn = 0;
  SURVEY_ITEMS.forEach(function (item) {
    if (item.type === 'section') {
      lines.push(`### ▸ ${item.title}`);
      if (item.help) lines.push(`${item.help}`);
      lines.push('');
      return;
    }
    qn += 1;
    lines.push(`#### ${qn}. ${item.title}`);
    lines.push(`- **답 형식:** ${typeLabel(item.type)}`);
    if (item.help) lines.push(`- **질문 앞에 붙일 안내:** ${item.help}`);
    if (item.options && item.options.length) {
      lines.push('- **고를 수 있는 보기:**');
      item.options.forEach((o) => lines.push(`  - ${o}`));
    }
    if (item.type === 'linear_scale') {
      lines.push(
        `- **점수 범위:** ${item.scaleMin}점 ~ ${item.scaleMax}점 (${item.scaleLowLabel} → ${item.scaleHighLabel})`
      );
    }
    lines.push('');
  });
  lines.push('---');
  lines.push('');
  lines.push('## 설문을 만들 때 확인할 일');
  lines.push('');
  lines.push('- [ ] 새 답이 오면 담당자에게 이메일로 알려 주기');
  lines.push('- [ ] 답이 표(스프레드시트)에 자동으로 쌓이게 연결하기');
  lines.push('- [ ] 꼭 받고 싶은 질문은「반드시 답하기」로 표시하기');
  lines.push('- [ ] 안 쓴 체험은 **해당 없음** 안내가 질문 설명에 보이게 두기');
  lines.push('- [ ] 링크는 회사 안에서만 열리게 할지 정하기');
  lines.push('');
  lines.push(`*${META.internalNote}*`);
  lines.push('');
  return lines.join('\n');
}

/** 표(CSV)에 넣을 때 따옴표·쉼표 처리 */
function esc(s) {
  if (s == null) return '';
  const t = String(s).replace(/"/g, '""');
  if (/[",\n\r]/.test(t)) return `"${t}"`;
  return t;
}

function toCsv() {
  const header = ['order', 'id', 'question_title', 'suggested_type', 'help_text', 'options_pipe_separated'];
  const rows = [header.join(',')];
  SURVEY_ITEMS.forEach((item, i) => {
    const opts = item.options ? item.options.join(' | ') : '';
    const titleCell = item.type === 'section' ? `[구역] ${item.title}` : item.title;
    rows.push(
      [
        i + 1,
        item.id,
        titleCell,
        typeLabel(item.type),
        item.help || '',
        opts,
      ]
        .map(esc)
        .join(',')
    );
  });
  return rows.join('\r\n');
}

function toJson() {
  return JSON.stringify({ meta: META, items: SURVEY_ITEMS }, null, 2);
}

/** 마크다운 굵게 표기만 제거해 폼 설명에 씁니다. */
function metaIntroPlain_() {
  return String(META.intro || '').replace(/\*\*/g, '');
}

/**
 * SURVEY_ITEMS를 구글 폼 문항으로 붙입니다. (Apps Script 전용)
 * @param {GoogleAppsScript.Forms.Form} form
 */
function appendSurveyItemsToForm_(form) {
  SURVEY_ITEMS.forEach(function (item) {
    if (item.type === 'section') {
      var sec = form.addSectionHeaderItem().setTitle(item.title);
      if (item.help) sec.setHelpText(item.help);
      return;
    }
    if (item.type === 'checkbox' && item.options && item.options.length) {
      var cb = form.addCheckboxItem().setTitle(item.title).setChoiceValues(item.options);
      if (item.help) cb.setHelpText(item.help);
      return;
    }
    if (item.type === 'multiple_choice' && item.options && item.options.length) {
      var mc = form.addMultipleChoiceItem().setTitle(item.title).setChoiceValues(item.options);
      if (item.help) mc.setHelpText(item.help);
      return;
    }
    if (item.type === 'linear_scale') {
      var lo = item.scaleMin != null ? item.scaleMin : 1;
      var hi = item.scaleMax != null ? item.scaleMax : 5;
      var sc = form.addScaleItem().setTitle(item.title).setBounds(lo, hi);
      if (item.scaleLowLabel || item.scaleHighLabel) {
        sc.setLabels(item.scaleLowLabel || '', item.scaleHighLabel || '');
      }
      if (item.help) sc.setHelpText(item.help);
      return;
    }
    if (item.type === 'short') {
      var tx = form.addTextItem().setTitle(item.title);
      if (item.help) tx.setHelpText(item.help);
      return;
    }
    if (item.type === 'paragraph') {
      var pg = form.addParagraphTextItem().setTitle(item.title);
      if (item.help) pg.setHelpText(item.help);
      return;
    }
  });
}

/**
 * 스프레드시트/문서에 붙인 스크립트면 알림창으로 링크를 보여 줍니다.
 * (단독 Apps Script 프로젝트에서는 SpreadsheetApp.getUi() 가 없어 여기서는 동작하지 않습니다.)
 * @returns {boolean} 표시했으면 true
 */
function showSurveyLinksWithUi_(publishedUrl, editUrl) {
  var message =
    '응답용(팀에 공유할 주소):\n\n' +
    publishedUrl +
    '\n\n────────\n편집용(본인만):\n\n' +
    editUrl;
  try {
    SpreadsheetApp.getUi().alert('설문이 만들어졌습니다', message, SpreadsheetApp.getUi().ButtonSet.OK);
    return true;
  } catch (e0) {}
  try {
    DocumentApp.getUi().alert('설문이 만들어졌습니다', message, DocumentApp.getUi().ButtonSet.OK);
    return true;
  } catch (e1) {}
  try {
    SlidesApp.getUi().alert('설문이 만들어졌습니다', message, SlidesApp.getUi().ButtonSet.OK);
    return true;
  } catch (e2) {}
  return false;
}

/**
 * 본인 메일함으로 링크 전송(실행 요약에는 안 보이므로 메일이 가장 확실합니다).
 */
function sendSurveyLinksEmail_(publishedUrl, editUrl) {
  if (typeof MailApp === 'undefined' || typeof Session === 'undefined') return false;
  try {
    var email = Session.getEffectiveUser().getEmail();
    if (!email) return false;
    MailApp.sendEmail(
      email,
      '[Lay Lay] 설문 링크가 만들어졌습니다',
      '아래 링크를 복사해 팀에 공유하세요.\n\n' +
        '【응답용】\n' +
        publishedUrl +
        '\n\n【편집용】\n' +
        editUrl
    );
    return true;
  } catch (e) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('메일 자동 전송을 건너뜁니다(권한 거부 또는 제한): ' + (e && e.message ? e.message : e));
    }
    return false;
  }
}

/**
 * 실행 기록에서 열었을 때 보이도록 콘솔에 링크를 남깁니다.
 */
function logSurveyLinksToConsole_(publishedUrl, editUrl) {
  if (typeof console === 'undefined' || !console.log) return;
  console.log('');
  console.log('======== Lay Lay 설문 링크 (여기부터 복사) ========');
  console.log('[응답용 · 팀에 공유]', publishedUrl);
  console.log('[편집용 · 본인만]', editUrl);
  console.log('================================================');
  console.log('');
  console.log(
    '※ 위 줄이 안 보이면: 왼쪽 「실행 기록」→ 방금 실행 한 줄 클릭 → 「콘솔」또는 상세 로그를 여세요.'
  );
}

/** 스크립트 속성에 저장 → 웹앱 페이지 새로고침 시 링크 표시용 */
function saveSurveyLinksToScriptProperties_(publishedUrl, editUrl) {
  if (typeof PropertiesService === 'undefined') return;
  PropertiesService.getScriptProperties().setProperties({
    LAY_LAY_LAST_PUBLISHED_URL: String(publishedUrl),
    LAY_LAY_LAST_EDIT_URL: String(editUrl),
  });
}

/** 스프레드시트에 붙인 스크립트면 활성 시트 A열에 링크를 적어 둡니다(영상과 비슷하게 바로 보임). */
function writeSurveyLinksToActiveSpreadsheet_(publishedUrl, editUrl) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return false;
    var sh = ss.getActiveSheet();
    if (!sh) sh = ss.getSheets()[0];
    var escPub = String(publishedUrl).replace(/"/g, '""');
    var escEd = String(editUrl).replace(/"/g, '""');
    sh.getRange(1, 1, 8, 2).clearContent();
    sh.getRange('A1').setValue('방금 만든 설문 링크').setFontWeight('bold');
    sh.getRange('A2').setFormula('=HYPERLINK("' + escPub + '","응답용 설문 열기 (팀에 공유)")');
    sh.getRange('A3').setValue(publishedUrl).setWrap(true).setFontSize(9);
    sh.getRange('A4').setValue('편집용 (본인만)').setFontWeight('bold');
    sh.getRange('A5').setFormula('=HYPERLINK("' + escEd + '","편집 화면 열기")');
    sh.getRange('A6').setValue(editUrl).setWrap(true).setFontSize(9);
    sh.setColumnWidth(1, 520);
    return true;
  } catch (e) {
    return false;
  }
}

function escapeHtml_(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSurveyLinksHtml_(pub, ed) {
  if (!pub) {
    return (
      '<!DOCTYPE html><html><head><base target="_blank"><meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>Lay Lay 설문</title><style>body{font-family:Malgun Gothic,sans-serif;max-width:42rem;margin:2rem auto;padding:0 1rem;line-height:1.6}' +
      '.note{background:#fff8e1;padding:1rem;border-radius:8px;margin:1rem 0}ol{padding-left:1.2rem}</style></head><body>' +
      '<h1>설문 링크</h1><div class="note"><p><strong>아직 표시할 링크가 없습니다.</strong></p><ol>' +
      '<li>Apps Script <strong>편집기</strong>로 돌아갑니다.</li>' +
      '<li><strong>폼만들고링크출력</strong>을 실행합니다.</li>' +
      '<li>이 탭에서 <strong>새로고침(F5)</strong>합니다.</li></ol>' +
      '<p>유튜브는 보통 <strong>스프레드시트에 붙인</strong> 스크립트라 실행과 동시에 같은 파일에 링크가 보입니다. ' +
      '<strong>단독 프로젝트</strong>면 편집기 요약에는 URL이 안 나오는 것이 정상입니다.</p></div>' +
      '<p><small>질문 초안 텍스트: 이 주소 뒤에 <code>?format=md</code></small></p></body></html>'
    );
  }
  var ePub = escapeHtml_(pub);
  var eEd = escapeHtml_(ed);
  return (
    '<!DOCTYPE html><html><head><base target="_blank"><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Lay Lay 설문</title><style>body{font-family:Malgun Gothic,sans-serif;max-width:42rem;margin:2rem auto;padding:0 1rem}' +
    'a{word-break:break-all} .box{border:1px solid #dadce0;border-radius:12px;padding:1.25rem;margin:1rem 0}' +
    '.muted{color:#5f6368;font-size:.92rem}</style></head><body>' +
    '<h1>설문 링크</h1><div class="box"><p><strong>응답용</strong> (팀에 공유)</p>' +
    '<p><a href="' + ePub + '">' + ePub + '</a></p></div>' +
    '<div class="box muted"><p><strong>편집용</strong> (본인만)</p><p><a href="' + eEd + '">' + eEd + '</a></p></div>' +
    '<p class="muted">새로 만든 뒤에는 이 페이지를 새로고침하세요.</p></body></html>'
  );
}

function logWhereToSeeLinks_(wroteSheet) {
  if (typeof console === 'undefined' || !console.log) return;
  if (wroteSheet) {
    console.log('▶ 스프레드시트에 붙인 스크립트입니다. 시트 탭으로 돌아가면 A1~ 에 링크가 보입니다.');
  }
  try {
    if (typeof ScriptApp !== 'undefined') {
      var u = ScriptApp.getService().getUrl();
      if (u) {
        console.log('▶ 브라우저에서 이 주소를 열면 링크가 크게 보입니다: ' + u);
      } else {
        console.log(
          '▶ 브라우저에서 바로 보려면: 「배포」→「새 배포」→ 유형「웹 앱」→ 실행할 계정·액세스 설정 후 배포 → 나온 URL을 즐겨찾기 하세요.'
        );
      }
    }
  } catch (e1) {
    console.log('▶ 브라우저에서 링크를 보려면 웹 앱으로 한 번 배포하세요(파일 맨 위 주석).');
  }
}

/**
 * 구글 폼을 새로 만들고, 링크를 콘솔·메일·(가능하면) 알림창으로 전달합니다.
 * Google Apps Script 편집기에서 「폼만들고링크출력」을 선택한 뒤 실행하세요.
 * @returns {{ publishedUrl: string, editUrl: string } | null}
 */
function createFormAndLogLinks() {
  if (typeof FormApp === 'undefined') {
    if (typeof process !== 'undefined' && process.stderr) {
      process.stderr.write(
        'createFormAndLogLinks()는 Google Apps Script에서만 동작합니다. 편집기에서 「폼만들고링크출력」을 실행하세요.\n'
      );
    }
    return null;
  }
  var form = FormApp.create(META.formTitle);
  form.setDescription(metaIntroPlain_());
  appendSurveyItemsToForm_(form);
  var publishedUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();

  saveSurveyLinksToScriptProperties_(publishedUrl, editUrl);
  var wroteSheet = writeSurveyLinksToActiveSpreadsheet_(publishedUrl, editUrl);

  logSurveyLinksToConsole_(publishedUrl, editUrl);
  logWhereToSeeLinks_(wroteSheet);

  var msg =
    '=== 설문 응답용 링크 (팀에 이 주소를 공유) ===\n' +
    publishedUrl +
    '\n\n=== 편집용 링크 (본인만) ===\n' +
    editUrl;
  Logger.log(msg);
  if (typeof console !== 'undefined' && console.log) {
    console.log(msg);
  }

  var showedUi = showSurveyLinksWithUi_(publishedUrl, editUrl);
  var sentMail = sendSurveyLinksEmail_(publishedUrl, editUrl);

  if (typeof console !== 'undefined' && console.log) {
    if (sentMail) {
      console.log('※ 같은 내용을 본인 메일함으로도 보냈습니다. 받은편지함을 확인해 보세요.');
    }
    if (showedUi) {
      console.log('※ 알림창으로도 링크를 보여 드렸습니다.');
    }
    if (wroteSheet) {
      console.log('※ 시트 A열에도 링크를 적어 두었습니다.');
    }
    if (!sentMail && !showedUi && !wroteSheet) {
      console.warn(
        '※ 알림·메일·시트가 모두 없었다면: 웹 앱 URL을 열거나, 실행 기록 → 콘솔에서 URL을 복사하세요.'
      );
    }
  }

  return { publishedUrl: publishedUrl, editUrl: editUrl };
}

/** Apps Script 실행 메뉴용 이름 (한글) */
function 폼만들고링크출력() {
  return createFormAndLogLinks();
}

/**
 * 구글 기본 프로젝트에 있던 이름과 맞춤 — 위와 완전히 같은 동작입니다.
 * (함수 목록에서 이게 보이면 이걸 실행해도 됩니다.)
 */
function myFunction() {
  return 폼만들고링크출력();
}

/**
 * 웹 앱으로 배포했을 때 브라우저에서 호출됩니다.
 * 기본: 마지막으로 만든 설문 링크를 HTML로 보여 줍니다(영상처럼 “바로 보이게”).
 * ?format=md : 질문 초안 마크다운 텍스트.
 */
function doGet(e) {
  if (typeof ContentService === 'undefined') {
    return;
  }
  var param = e && e.parameter ? e.parameter : {};
  if (param.format === 'md' || param.markdown === '1') {
    return ContentService.createTextOutput(toMarkdown()).setMimeType(
      ContentService.MimeType.PLAIN_TEXT
    );
  }
  if (typeof HtmlService !== 'undefined' && typeof PropertiesService !== 'undefined') {
    var props = PropertiesService.getScriptProperties();
    var pub = props.getProperty('LAY_LAY_LAST_PUBLISHED_URL');
    var ed = props.getProperty('LAY_LAY_LAST_EDIT_URL');
    var html = buildSurveyLinksHtml_(pub, ed);
    return HtmlService.createHtmlOutput(html)
      .setTitle('Lay Lay 설문')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  return ContentService.createTextOutput(toMarkdown()).setMimeType(
    ContentService.MimeType.PLAIN_TEXT
  );
}

function main() {
  const arg = (process.argv[2] || '--markdown').toLowerCase();
  if (arg === '--csv') {
    process.stdout.write(toCsv() + '\n');
    return;
  }
  if (arg === '--json') {
    process.stdout.write(toJson() + '\n');
    return;
  }
  if (arg === '--markdown' || arg === '-m' || arg === '--help' || arg === '-h') {
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(
        '사용법: node app.js [--markdown | --csv | --json]\n' +
          '  기본: 글(마크다운)으로 질문 초안 출력\n'
      );
      return;
    }
    process.stdout.write(toMarkdown());
    return;
  }
  process.stderr.write('알 수 없는 옵션입니다: ' + arg + '\n');
  process.stderr.write('도움말: node app.js --help\n');
  process.exitCode = 1;
}

// Node.js에서만 동작 (Google Apps Script 등에는 module/require가 없음)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    META,
    SURVEY_ITEMS,
    toMarkdown,
    toCsv,
    toJson,
    doGet,
    createFormAndLogLinks,
    myFunction,
  };
}

if (typeof require !== 'undefined' && require.main === module) {
  main();
}
