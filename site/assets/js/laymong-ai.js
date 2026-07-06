'use strict';

(function () {
  var MOCK = {
    재물운: 4,
    애정운: 3,
    직장운: 1,
    건강운: 1,
    재물운설명:
      '꿈 속에서 돈이나 지갑이 직접 등장하지 않았더라도, "들어오는 것과 나가는 것"의 균형이 오늘의 키워드예요. 무언가를 새로 사고 싶은 마음이 올라왔다면 하루만 미뤄보는 것도 좋아요. 반대로 작은 수입이나 혜택이 생길 여지는 있어요. 다만 큰賭은 피하고, 영수증·구독 같은 작은 출구부터 점검해보면 마음이 한결 가벼워질 거예요. 꿈의 분위기가 차분했다면 재물운도 서서히 안정되는 쪽으로 읽히고, 조급함이 있었다면 지출 욕구를 한 번 숨 고르고 결정해보면 좋아요. 오늘은 "크게 벌기"보다 "크게 새지 않기"에 포인트를 두면 편해요.',
    애정운설명:
      '꿈을 기록할 때의 기분이 평온했다면, 주변 사람과의 온도도 비슷하게 유지되기 쉬운 날이에요. 연락이 뜸했던 사람에게 가벼운 안부 한 통이 분위기를 풀어줄 수 있어요. 말이 길어지기보다 "요즘 어때?" 정도의 짧은 문장이 오히려 잘 통할 거예요. 연인·가족이라면 함께 있는 시간의 질을 조금만 높여도 만족감이 커져요. 꿈 속에서 느꼈던 감정이 따뜻했다면 그 여운을 오늘 대화에도 이어가 보세요. 반대로 서운함이 남았다면 오늘은 설득보다 듣기 쪽이 더 좋은 결과를 만들어요. 마음을 표현할 때는 비난 없이 느낌만 전해도 충분해요.',
    직장운설명:
      '꿈의 흐름이 정체되어 있었다면, 업무도 "한 번에 다 하기"보다 "쌓인 것부터 하나씩"이 맞는 날이에요. 새로운 프로젝트를 벌리기보다 진행 중인 일의 마무리에 집중하면 속도가 나와요. 회의나 협업에서는 결론을 서두르지 말고, 합의할 수 있는 작은 단위로 쪼개보세요. 집중력이 떨어질 수 있으니 50분 일하고 10분 쉬는 리듬이 도움이 돼요. 상사·동료에게 요청할 일이 있다면 오후보다는 오전에 가볍게 건네는 편이 수월해요. 오늘의 작은 성취 하나만 남겨도 저녁에 마음이 훨씬 편해질 거예요.',
    건강운설명:
      '몸은 크게 아프지 않아도, 피로가 말보다 먼저 올 수 있는 타입이에요. 꿈에서 숨이 차거나 무거웠다면 오늘은 무리한 일정을 줄이는 게 좋아요. 물·가벼운 스트레칭·짧은 산책 같은 작은 회복 루틴이 체감 차이를 만들어요. 카페인은 오후 늦게 줄이고, 저녁은 조금 일찍 마무리하면 다음 날 컨디션이 달라져요. 눈·목·어깨 긴장이 있다면 3분만 풀어도 괜찮아요. 오늘은 "더 버티기"보다 "미리 쉬기"가 건강운을 지키는 쪽이에요.',
    총론설명:
      '오늘 꿈은 "번쩍 빛나는 하루"라기보다, 살짝 기울어진 균형을 바로잡는 연습하기 좋은 메시지에 가까워요. 꿈 속 감정과 오늘의 기분을 연결해 보면, 크게 흔들리기보다는 작은 조정으로 하루를 만들어가면 편해요. 재물·관계·일·몸 네 축 모두 "과하지 않게, 꾸준하게"가 답이에요. 불안이 남아 있다면 그것도 하루를 더 세밀하게 살피게 해주는 신호로 받아들여도 괜찮아요. 오늘 저녁에는 스스로에게 "충분히 잘했어" 한마디만 남겨보세요. 작은 여유가 내일의 운을 조금 더 부드럽게 만들어줄 거예요.',
    한줄평: '운세표보다 먼저, 물컵을 채우는 쪽이 오늘의 승자예요.',
    행운의색: '그레이 블루',
    행운의숫자: 4,
    행운의물건: '따뜻한 허브티',
    행동해시태그: ['#물먹고브레이크', '#오늘은미루기허용', '#메모장정리', '#창문열고환기', '#스트레칭3분'],
  };

  var STAR_LABELS = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];

  function effectiveModel() {
    try {
      return sessionStorage.getItem('laylay_dev_openai_model') || 'gpt-4o-mini';
    } catch (e) {
      return 'gpt-4o-mini';
    }
  }

  function starLabel(n) {
    return STAR_LABELS[Math.max(0, Math.min(4, (n || 1) - 1))] || '보통';
  }

  function buildBirthProfile(form) {
    var cal = form.cal || '양력';
    var y = form.year || '';
    var m = form.month || '';
    var d = form.day || '';
    var gender = form.gender || '';
    var birthTime = form.birthTime || '모름';
    var birthKnown = birthTime && birthTime !== '모름';
    var lines = [
      '=== 사주·프로필 참고 (해몽에 반드시 반영) ===',
      '달력: ' + cal,
      '생년월일: ' + (y && m && d ? y + '년 ' + m + '월 ' + d + '일' : '(미입력)'),
      '성별: ' + gender,
      '태어난 시간: ' + birthTime,
    ];
    if (birthKnown) {
      lines.push(
        '→ 태어난 시간이 있으므로, 총론 또는 운세 설명 1~2곳에서 시간·12지(자·축·인…) 상징을 꿈과 자연스럽게 연결해 언급하세요. 점술 단정은 금지, 가벼운 상징 해석만.'
      );
    } else {
      lines.push(
        '→ 태어난 시간이 "모름"이므로 12지·시주는 쓰지 마세요. 대신 생년월일·계절감·나이대·성별을 가볍게 1회 이상 언급하며 꿈과 연결하세요.'
      );
    }
    lines.push('→ 생년월일은 의학·법률 조언이 아닌, 재미·상징용 참고 재료입니다.');
    return lines.join('\n');
  }

  function parsedToFortune(parsed) {
    var sum = (parsed.재물운 || 0) + (parsed.애정운 || 0) + (parsed.직장운 || 0) + (parsed.건강운 || 0);
    var fortuneCards = [
      {
        key: '재물운',
        stars: parsed.재물운 || 3,
        level: starLabel(parsed.재물운),
        desc: String(parsed.재물운설명 || '').trim(),
      },
      {
        key: '애정운',
        stars: parsed.애정운 || 3,
        level: starLabel(parsed.애정운),
        desc: String(parsed.애정운설명 || '').trim(),
      },
      {
        key: '직장운',
        stars: parsed.직장운 || 3,
        level: starLabel(parsed.직장운),
        desc: String(parsed.직장운설명 || '').trim(),
      },
      {
        key: '건강운',
        stars: parsed.건강운 || 3,
        level: starLabel(parsed.건강운),
        desc: String(parsed.건강운설명 || '').trim(),
      },
    ];
    var oneline = String(parsed.한줄평 || '').trim();
    var overview = String(parsed.총론설명 || '').trim();
    var summaryLine = oneline;
    if (overview) {
      var first = overview.split(/\n/)[0];
      var sent = first.match(/^[\s\S]+?[.!?](?:\s|$)/);
      summaryLine = sent ? sent[0].trim() : first.slice(0, 120);
    }
    return {
      score: sum * 5,
      badge: oneline,
      title: oneline,
      summary: summaryLine,
      oneliner: oneline,
      overview: overview || oneline,
      analysis: fortuneCards.map(function (c) {
        return { label: c.key, stars: c.stars, level: c.level, desc: c.desc };
      }),
      fortuneCards: fortuneCards,
      lucky: {
        color: String(parsed.행운의색 || '-'),
        number: parsed.행운의숫자 != null ? parsed.행운의숫자 : '-',
        item: String(parsed.행운의물건 || '-'),
      },
      tags: Array.isArray(parsed.행동해시태그) ? parsed.행동해시태그 : [],
      _raw: parsed,
    };
  }

  async function fetchDream(form) {
    var birthProfile = buildBirthProfile(form);
    var laymongSystem = [
      '당신은 브랜드 "Lay Mong"의 꿈 해석 캐릭터입니다.',
      '말투: 밤에 친한 사람에게 카톡하듯 따뜻하고, 문장에 리듬이 있게. ~요/예요체.',
      '꿈 속 구체적인 단어·사건·풍경을 재물/애정/직장/건강 설명마다 최소 한 번씩 인용하세요.',
      '생년월일·성별·태어난 시간(있을 때)은 상징 해석의 참고 재료입니다. 총론과 운세 설명 곳곳에 1~2회 자연스럽게 녹이세요.',
      '각 운세 설명은 짧게 끊기지 말고 공감·상징·다음 행동 제안으로 넉넉히 이어지게 쓰세요.',
      '재물/애정/직장/건강 네 축은 서로 다른 각도로 서술하세요.',
      '출력은 반드시 요청된 JSON 한 덩어리만. 마크다운·코드펜스 금지.',
      '운세는 재미·상징이며 의학·법률·투자·단정적 진단 조언이 아님.',
    ].join('\n');

    var prompt = [
      '다음 정보를 바탕으로 꿈 해몽과 오늘의 운세 JSON을 작성해줘.',
      '',
      birthProfile,
      '',
      '꿈을 기록할 때 기분: ' + (form.mood || '보통'),
      '',
      '꿈 내용:',
      '"""',
      form.dream,
      '"""',
      '',
      '=== 분량·형식 (필수) ===',
      '재물운설명·애정운설명·직장운설명·건강운설명: 각 6~10문장. 꿈 키워드 2회 이상, 기분·생년 정보 중 1가지 이상 연결, 마지막에 작은 행동 제안 1줄.',
      '총론설명: 8~14문장. 꿈 흐름 요약 + 기분 + 생년·시간(알 때) 상징 + 위로·유머·여운 중 2가지 이상.',
      '한줄평: 1문장, 36~52자 권장. 꿈에서 건진 이미지·비유 1조각. 상투·설교 금지.',
      '행운의색·행운의숫자·행운의물건: 꿈·기분·생년 중 하나와 연결된 짧은 단어.',
      '행동해시태그: #으로 시작 5개 (UI 미노출이나 JSON 키는 채울 것).',
      '',
      '반드시 유효한 JSON 객체 하나만 출력. 키:',
      '재물운, 애정운, 직장운, 건강운 (정수 1~5),',
      '재물운설명, 애정운설명, 직장운설명, 건강운설명, 총론설명, 한줄평,',
      '행운의색, 행운의숫자, 행운의물건, 행동해시태그',
    ].join('\n');

    var res = await fetch('/api/openai-dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: '',
        model: effectiveModel(),
        messages: [
          { role: 'system', content: laymongSystem },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4800,
        temperature: 0.72,
      }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) return parsedToFortune(MOCK);
    var raw = (data.text || '').trim();
    if (!raw && data.raw && data.raw.choices && data.raw.choices[0] && data.raw.choices[0].message) {
      raw = String(data.raw.choices[0].message.content || '').trim();
    }
    var match = raw.match(/\{[\s\S]*\}/);
    if (!match) return parsedToFortune(MOCK);
    try {
      var parsed = JSON.parse(match[0]);
      var required = ['재물운', '애정운', '직장운', '건강운', '한줄평', '총론설명', '행운의색', '행운의숫자', '행운의물건'];
      if (
        !required.every(function (k) {
          return parsed[k] != null;
        })
      ) {
        return parsedToFortune(MOCK);
      }
      return parsedToFortune(parsed);
    } catch (e) {
      return parsedToFortune(MOCK);
    }
  }

  window.LayMongAi = {
    fetchDream: fetchDream,
    mockFortune: function () {
      return parsedToFortune(MOCK);
    },
    buildBirthProfile: buildBirthProfile,
  };
})();
