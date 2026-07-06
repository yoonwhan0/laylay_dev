'use strict';

(function () {
  var MOCK = {
    재물운: 4,
    애정운: 3,
    직장운: 1,
    건강운: 1,
    재물운설명:
      '지갑이 두둑해지는 그림은 아니어도, "작게 들어오고 크게 나가지 않는다" 쪽으로 균형 잡히기 좋은 날이에요.',
    애정운설명: '말 한마디가 평소보다 길게 남는 하루예요. 듣는 쪽으로 포인트를 주면 분위기가 부드러워져요.',
    직장운설명: '쌓인 일부터 하나씩 내려놓는 편이 속도가 나와요. 버퍼를 조금만 더 잡아두면 마음이 편해요.',
    건강운설명: '몸은 크게 아프지 않아도, 피로가 말보다 먼저 오는 타입이에요. 물 한 컵을 더한다고 생각하면 좋아요.',
    총론설명:
      '오늘은 "번쩍 빛나는 하루"라기보다, 살짝 기울어진 균형을 바로잡는 연습하기 좋은 날이에요.',
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

  function parsedToFortune(parsed) {
    var sum = (parsed.재물운 || 0) + (parsed.애정운 || 0) + (parsed.직장운 || 0) + (parsed.건강운 || 0);
    return {
      score: sum * 5,
      badge: String(parsed.한줄평 || '').trim(),
      title: String(parsed.한줄평 || '').trim(),
      summary: String(parsed.한줄평 || '').trim(),
      overview: String(parsed.총론설명 || parsed.한줄평 || '').trim(),
      analysis: [
        { label: '재물운', stars: parsed.재물운 || 3, level: starLabel(parsed.재물운) },
        { label: '애정운', stars: parsed.애정운 || 3, level: starLabel(parsed.애정운) },
        { label: '직장운', stars: parsed.직장운 || 3, level: starLabel(parsed.직장운) },
        { label: '건강운', stars: parsed.건강운 || 3, level: starLabel(parsed.건강운) },
      ],
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
    var laymongSystem = [
      '당신은 브랜드 "Lay Mong"의 꿈 해석 캐릭터입니다.',
      '말투: 밤에 친한 사람에게 카톡하듯 따뜻하고, 문장에 리듬이 있게.',
      '사용자 꿈 속 구체적인 단어·사건·풍경을 각 설명마다 최소 한 번은 인용하세요.',
      '출력은 반드시 요청된 JSON 한 덩어리만.',
      '운세는 재미·상징이며 의학·법률·투자 조언이 아님.',
    ].join('\n');

    var prompt =
      '다음 정보를 바탕으로 해몽해줘.\n\n' +
      '사용자: ' +
      form.cal +
      ' ' +
      form.year +
      '년 ' +
      form.month +
      '월 ' +
      form.day +
      '일생, ' +
      form.gender +
      ', 태어난 시간 ' +
      form.birthTime +
      '\n꿈을 기록할 때 기분: ' +
      form.mood +
      '\n\n꿈 내용:\n"""' +
      form.dream +
      '"""\n\n' +
      '반드시 유효한 JSON 객체 하나만 출력. 키: 재물운, 애정운, 직장운, 건강운(1~5), 재물운설명, 애정운설명, 직장운설명, 건강운설명, 총론설명, 한줄평, 행운의색, 행운의숫자, 행운의물건, 행동해시태그(5개)';

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
        max_tokens: 3200,
        temperature: 0.68,
      }),
    });
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok) return parsedToFortune(MOCK);
    var raw = (data.text || '').trim();
    var match = raw.match(/\{[\s\S]*\}/);
    if (!match) return parsedToFortune(MOCK);
    try {
      var parsed = JSON.parse(match[0]);
      var required = ['재물운', '애정운', '직장운', '건강운', '한줄평', '총론설명', '행운의색', '행운의숫자', '행운의물건'];
      if (!required.every(function (k) {
        return parsed[k] != null;
      })) {
        return parsedToFortune(MOCK);
      }
      return parsedToFortune(parsed);
    } catch (e) {
      return parsedToFortune(MOCK);
    }
  }

  window.LayMongAi = { fetchDream: fetchDream, mockFortune: function () {
    return parsedToFortune(MOCK);
  } };
})();
