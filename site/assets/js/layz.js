'use strict';
const IMG_C3 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCADDAeADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6pooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiijI9aACijNGRQAUUZooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiszxH4m0fwjpM+r65qEFhYwDLzStgewA6knsBkmvmT4kftmSyedYeA9OEa8qNTvly31SLoPYtn/doA+qbq7t7K3kubqeKCCNdzyysFVB6kngCvBvH/wC2D4S8OSvZ+GbSXxHcqSGmV/Jtl+jkEv8AgMe9fIuueLPE3jO9Mus6vqWqzyNkLNKz8+ir0A9gK9M+GP7LnjHxzLHd6xDJ4d0g4YzXUf76Uf7ERwfxbA+tAGxq/wC2f47vbcxWGmaHpzls+asTysB6YZsfjiuKv/2jvipqEryP4uvIQ38NvFHEo+m1a+j9N/Y0+Htp5LXl7rt8yffV7hI0kP0VMgfQ/jXc6Z+z/wDDDSokjg8G6XLsOd1ypnYn3Lk5+nSgD4gtPjP8RrKSaSHxrroaY5ffeM+T9GJx+FTv8dPiY6hT421sAelwQfzFfeSfC/wLHH5a+DfDoTg4/s6Lt/wGof8AhUnw+yT/AMIT4c+bOf8AiXxf4UAfFeiftNfFLRJA3/CSPfx8ZjvoUlB/HAb8jXZWf7avjeIEXWieH7j3WOVD/wChmvoLXP2bfhbrpZ5fCtvaSH+OykeDH/AVO39K5G6/Yx+HszFodQ8QwAjhVuI2A/OOgDmPD/7bto7KniDwlNCM/NNYXIfA/wBxwP8A0KvbfBnxl8C+PIUbRvENmZ2wPslw4hnB9NjYJ/DIrwLxX+xNdwwyTeFvEyXLquVttQh2Fj6eYuR+a14T4v8AhZ418A5fxD4fvbKEPsFztDwk9sSLlf1oA/Siivz/APAP7SXj/wABJFapqI1fTo+BaajmQKPRXzvX2Gce1fT3wh/aW8OfE2dNKvYhoeuNxHbTSho7j2jfAy3+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';
const IMG_C2 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAWgAAACMCAYAAABRRzP1AAABCGlDQ1BJQ0MgUHJvZmlsZQAAeJxjYGA8wQAELAYMDLl5JUVB7k4KEZFRCuwPGBiBEAwSk4sLGHADoKpv1yBqL+viUYcLcKakFicD6Q9ArFIEtBxopAiQLZIOYWuA2EkQtg2IXV5SUAJkB4DYRSFBzkB2CpCtkY7ETkJiJxcUgdT3ANk2uTmlyQh3M/Ck5oUGA2kOIJZhKGYIYnBncAL5H6IkfxEDg8VXBgbmCQixpJkMDNtbGRgkbiHEVBYwMPC3MDBsO48QQ4RJQWJRIliIBYiZ0tIYGD4tZ2DgjWRgEL7AwMAVDQsIHG5TALvNnSEfCNMZchhSgSKeDHkMyQx6QJYRgwGDIYMZAKbWPz9HbOBQAAABkElEQVR42u3UMQ0AAAgEsQf/nkEFCUMr4YarJBMA3mkJAAwaAIMGMGgADBrAoAEwaAAMGsCgATBoAIMGwKABMGgAgwbAoAEMGgCDBjBoAAwaAIMGMGgADBrAoAEwaAAMGsCgATBoAIMGwKABDBoAgwbAoAEMGgCDBjBoAAwaAIMGMGgADBrAoAEwaACDBsCgATBoAIMGwKABDBoAgwbAoAEMGgCDBjBoAAwaAIMGMGgADBrAoAEwaACDBsCgATBoAIMGwKABDBoAgwbAoAEMGgCDBjBoAAwawKABMGgADBrAoAEwaACDBsCgATBoAIMGwKABDBoAgwYwaAAMGgCDBjBoAAwawKABMGgADBrAoAEwaACDBsCgATBoAIMGwKABDBoAgwYwaAAMGgCDBjBoAAwawKABMGgADBrAoAEwaACDBsCgAQwaAIMGwKABDBoAgwYwaAAMGgCDBjBoAAwawKABMGgAgwbAoAEwaACDBsCgAQwaAIMGwKABDBoAgwYwaAAMGgCDBjBoAAwawKABuLNGAQIXa/nU3AAAAABJRU5ErkJggg==';

// ══ DATA ══════════════════════════════════════════════
const Qs = [
  {type:'db',cat:'기상',q:"오늘 아침, 알람이 울리고 실제로 일어나기까지 걸린 시간은?",a:[
    {t:"알람 울리자마자 바로. 침대는 자는 곳",s:0,crm:'즉시이탈형'},
    {t:"5~10분? 한 번만 더 눈 감았다 일어남",s:1,crm:'중간형'},
    {t:"30분은 뒤척임. 알람도 여러 번 껐음",s:2,crm:'침대체류형'},
    {t:"솔직히 기억 없음. 어떻게 일어난 건지도 모름",s:3,crm:'침대체류형-심각'}]},
  {type:'fun',cat:'멘탈',q:"오늘 오전, 내 머릿속 상태를 가장 잘 표현한 건?",a:[
    {t:"정상 작동 중. 할 거 생각하면서 출발함",s:0,kw:'뇌 정상 가동 중'},
    {t:"오토파일럿 모드. 몸은 왔는데 정신은 아직 집",s:1,kw:'정신줄 어딘가에 있음'},
    {t:"뇌가 오늘 셔터 내렸어요. 아무 생각 하기 싫음",s:2,kw:'뇌 셔터 내림'},
    {t:"감정적으로도 예민함. 건드리지 마세요",s:3,kw:'감정 예민 주의'}]},
  {type:'db',cat:'신체',q:"지금 이 순간, 몸에서 가장 신호를 보내는 곳은?",a:[
    {t:"딱히 없음. 오늘은 몸 컨디션 나쁘지 않아",s:0,crm:'이상없음형'},
    {t:"어깨 또는 목이 좀 뭉쳐있는 느낌",s:1,crm:'어깨목민감형'},
    {t:"허리가 좀 뻐근함. 앉아있는 게 무서움",s:2,crm:'허리민감형'},
    {t:"전신이 다 이상함. 특정 부위를 고를 수가 없어",s:3,crm:'전신피로형'}]},
  {type:'fun',cat:'말버릇',q:"피곤할 때 나도 모르게 나오는 말이나 반응이 있다면?",a:[
    {t:"딱히 없음. 티를 안 내는 편",s:0,kw:'티 안 내는 인내형'},
    {t:"한숨이 늘어남. 나도 모르게 후...",s:1,kw:'한숨 자동 발동형'},
    {t:'"피곤해", "지쳐" 입에 달고 삼',s:2,kw:'피곤 구독 중'},
    {t:"말도 하기 싫어짐. 그냥 무언가가 됨",s:3,kw:'무언 모드 진입'}]},
  {type:'db',cat:'회복',q:"퇴근하고 집에 왔을 때, 진짜 '아 쉬었다' 싶은 순간은?",a:[
    {t:"샤워하고 침대에 대자로 누울 때",s:0,crm:'수면회복형'},
    {t:"좋아하는 뭔가를 할 때 (먹방, 게임, 유튜브 등)",s:1,crm:'활동전환형'},
    {t:"잠깐 눈 붙이고 일어났을 때. 짧아도 낮잠이 최고",s:2,crm:'수면예민형'},
    {t:"솔직히 쉬어도 쉰 것 같지 않아. 그냥 버팀",s:3,crm:'무감각버팀형'}]},
  {type:'fun',cat:'귀가',q:"요즘 집에 들어오자마자 제일 먼저 하는 행동은?",a:[
    {t:"씻고 뭔가 해먹거나 운동함. 나름 루틴 있음",s:0,kw:'자기관리형 루틴 보유'},
    {t:"소파나 침대에 일단 눕고 봄. 5분만...",s:1,kw:'집-눕기 반사신경 보유'},
    {t:"가방 내려놓고 그 자리에서 폰 봄",s:2,kw:'현관 탈주 불가형'},
    {t:"아프진 않은데 어디 아픈 것 같아서 그냥 누워있음",s:3,kw:'어딘가 아픈 것 같아'}]},
  {type:'db',cat:'수면',q:"어젯밤 수면, 솔직히 어땠어?",a:[
    {t:"충분히 잤고 잘 잔 것 같음. 괜찮아",s:0,crm:'수면만족형'},
    {t:"시간은 그럭저럭인데 뭔가 개운하지 않음",s:1,crm:'수면질저하형'},
    {t:"적게 잔 건 알아. 어쩔 수 없었음",s:2,crm:'수면부족형'},
    {t:"오래 잔 것 같은데도 피곤함. 자도 자도 피곤해",s:3,crm:'수면질저하형-심각'}]},
  {type:'fun',cat:'원인',q:"솔직히, 오늘 제일 힘든 게 뭐야?",a:[
    {t:"딱히 없어. 그냥 오늘 하루 사는 중",s:0,kw:'무탈하게 살아있음'},
    {t:"사람... 사람이 제일 피곤해",s:1,kw:'인간관계 피로도 높음'},
    {t:"할 일이 너무 많음. 도망치고 싶음",s:2,kw:'업무 과부하'},
    {t:"사실 머리도 안 감고 왔어. 그냥 다 하기 싫음",s:3,kw:'오늘 다 포기형'}]}
];

const TIERS = [
  {id:'vitamin',min:0,max:19,
    name:"레이-Z가 뭔데요? 형",tag:"충전 완료",
    head:"오늘은 좀 살 것 같은 날이에요.",
    desc:"컨디션이 괜찮은 상태예요. 에너지가 아직 남아있고 오늘 하루 버텨낼 수 있는 상태. 주변에 나눠줄 수도 있을 것 같은데요?",
    accent:"#1D9E75",bg:"#E8F8F2",tc:"#085041",meter:"#52c9a1",
    recs:[
      {tag:"추천 행동 ①",title:"오늘 에너지, 동네 한 바퀴로 써봐요",desc:"익숙한 길도 오늘은 다르게 보일 거예요. 목적 없이 걷는 것만으로도 충분해요."},
      {tag:"추천 행동 ②",title:"오랫동안 연락 못한 친구에게 카톡 한 마디",desc:'"요즘 어때?" 한 마디. 오늘 같이 컨디션 좋은 날 보내기 딱이에요.'},
      {tag:"추천 행동 ③",title:"가보고 싶었던 카페 한 곳 개척하기",desc:"아무것도 안 해도 됩니다. 공간만 바꿔도 기분 전환이 돼요."}
    ],
    rx:{title:"오늘의 수면 처방전",sub:"컨디션 좋은 날일수록 수면 루틴을 지켜요",
      items:[
        "잠들기 1시간 전부터 밝은 조명 줄이기",
        "스마트폰 화면 블루라이트 필터 켜기",
        "같은 시간에 잠들고 같은 시간에 일어나기"
      ]}
  },
  {id:'slow',min:20,max:39,
    name:"슬슬... 레이지해지는 중인 것 같기도 한 형",tag:"경계선",
    head:"아직 괜찮은데, 슬슬 신호가 오고 있어요.",
    desc:"버틸 수 있는 상태이지만 충전이 필요한 타이밍이에요. 커피 한 잔과 잠깐의 여유가 지금 딱 필요한 시점.",
    accent:"#BA7517",bg:"#FDF2DC",tc:"#633806",meter:"#f5b940",
    recs:[
      {tag:"추천 행동 ①",title:"점심시간 딱 10분, 밖에 나가서 햇빛 쬐기",desc:"자리에서 일어나는 것만으로도 달라져요. 커피 들고 건물 밖으로만 나가도 됩니다."},
      {tag:"추천 행동 ②",title:"퇴근 후 집 근처 편의점 한 바퀴 산책",desc:"목적지 없이 그냥 걷기. 편의점에서 오늘 저녁 뭐 먹을지 구경하는 것도 괜찮아요."},
      {tag:"추천 행동 ③",title:"오늘 밤 9시 이후 폰 내려놓고 눈 감기",desc:"잠이 안 와도 됩니다. 눈 감고 누워있는 것만으로도 회복이 돼요."}
    ],
    rx:{title:"오늘의 수면 처방전",sub:"지금이 루틴 잡기 딱 좋은 타이밍이에요",
      items:[
        "취침 30분 전 스트레칭 5분 (목·어깨 위주)",
        "잠들기 전 따뜻한 음료 한 잔 (카페인 없는 것으로)",
        "오늘은 목표 수면 시간보다 30분 일찍 눕기"
      ]}
  },
  {id:'burnout',min:40,max:59,
    name:"레이-Z 예열 완료된 것 같은 형",tag:"번아웃 예고",
    head:"번아웃이 예고편을 틀고 있어요.",
    desc:"몸은 여기 있는데, 마음은 벌써 집에 가 있는 상태예요. 의지가 문제가 아니라 회복이 더 필요한 시점이에요.",
    accent:"#D85A30",bg:"#FBE9E3",tc:"#4A1B0C",meter:"#f08060",
    recs:[
      {tag:"추천 행동 ①",title:"퇴근 직후 아무 약속도 잡지 않기",desc:"오늘 저녁은 나만의 시간으로 선언하세요. 약속 있다면 한 번만 더 생각해봐요."},
      {tag:"추천 행동 ②",title:"좋아하는 음악 틀고 15분 그냥 멍 때리기",desc:"생산적인 거 하려 하지 마세요. 멍 때리는 것도 뇌한테는 회복이에요."},
      {tag:"추천 행동 ③",title:"가장 친한 친구한테 '나 좀 힘들어' 말하기",desc:"말로 꺼내는 것만으로 절반은 해결돼요. 답장 안 와도 괜찮아요."}
    ],
    rx:{title:"오늘의 수면 처방전",sub:"번아웃 예고 상태, 수면이 답이에요",
      items:[
        "잠이 오지 않아도 수면 안대 착용하고 30분 누워있기",
        "침실 온도를 18~20도로 낮추기 (시원한 게 수면에 좋아요)",
        "오늘만큼은 SNS 알림 다 꺼두기"
      ]}
  },
  {id:'bed',min:60,max:79,
    name:"집에 가고 싶어 미칠 것 같은 형",tag:"심각 주의",
    head:"침대가 당신을 부르고 있어요.",
    desc:"지금 상태로 더 밀어붙이면 며칠 고생할 수 있어요. 오늘은 진짜로 쉬세요. 의지로 버티는 건 잠깐이고, 몸은 기억하거든요.",
    accent:"#993556",bg:"#FAEAEF",tc:"#4B1528",meter:"#d4607e",
    recs:[
      {tag:"추천 행동 ①",title:"오늘 칼퇴하기. 안 되면 5분이라도 일찍",desc:"5분이라도 일찍 나오는 게 오늘의 목표예요. 나머지는 내일 해도 됩니다."},
      {tag:"추천 행동 ②",title:"퇴근길 편의점 들러서 좋아하는 거 하나 사기",desc:"비싼 거 아니어도 됩니다. 작은 보상이 오늘 하루를 버티게 해줘요."},
      {tag:"추천 행동 ③",title:"수면 안대 끼고 10시 이전에 눈 감고 누워있기",desc:"잠이 안 와도 됩니다. 눈만 감아도 몸은 쉬고 있어요."}
    ],
    rx:{title:"오늘의 수면 처방전",sub:"준비물: 수면 안대 (필수)",
      items:[
        "잠이 오지 않아도 수면 안대 착용하고 30분만 누워있어 보세요",
        "폰은 침대 밖에 두기. 충전도 거실에서",
        "눈 감고 10분 복식호흡: 4초 들이쉬고, 6초 내쉬기"
      ]}
  },
  {id:'legend',min:80,max:99,
    name:"이미 레이-Z 그 자체이신 분",tag:"레전드",
    head:"오늘은 의지보다 회복이 필요한 날이에요.",
    desc:"게으름이 아니라 방전에 가까운 상태예요. 이 결과를 보고 있다는 것 자체가 기적. 오늘은 진짜로, 아무것도 안 해도 되는 날로 선언해요.",
    accent:"#534AB7",bg:"#EEEDFE",tc:"#26215C",meter:"#8b82e0",
    recs:[
      {tag:"추천 행동 ①",title:"오늘은 공식적으로 아무것도 안 해도 되는 날",desc:"진짜입니다. 오늘 하루만큼은 아무것도 안 해도 됩니다. 선언하세요."},
      {tag:"추천 행동 ②",title:"수면 안대 끼고 잠 안 와도 10시간 그냥 누워있기",desc:"억지로 자려 하지 말고 그냥 누워있는 것만으로도 됩니다. 진짜예요."},
      {tag:"추천 행동 ③",title:"아무도 안 만나도 됩니다. 연락 다 내일 해도 됩니다",desc:"오늘 하루는 모든 사람에게 자동 부재중이 허락된 날이에요."}
    ],
    rx:{title:"오늘의 수면 처방전",sub:"준비물: 수면 안대 + 이어플러그",
      items:[
        "지금 당장 수면 안대 착용하고 누워도 됩니다",
        "알람은 내일 최대한 늦게 맞추기. 몸이 더 자야 해요",
        "내일을 위해 오늘 일찍 자는 게 최선이에요"
      ]}
  }
];

// ══ STATE ══════════════════════════════════════════════
const st = {cur:0,answers:[],hist:[],lz:0,tier:null,lzTierForShare:null};

window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-dev-sync')return;
  try{
    if(typeof d.apiKey==='string')sessionStorage.setItem('_laylay_shell_api',d.apiKey);
    if(typeof d.model==='string')sessionStorage.setItem('_laylay_shell_model',d.model||'');
  }catch(x){}
});
window.addEventListener('message',function(e){
  var d=e.data;
  if(!d||d.source!=='laylay-shell'||d.type!=='laylay-highlight')return;
  var rid=d.regionId;
  if(!rid)return;
  document.querySelectorAll('.laylay-shell-highlight').forEach(function(n){n.classList.remove('laylay-shell-highlight');});
  var el=document.querySelector('[data-laylay-region="'+rid+'"]');
  if(!el)return;
  el.classList.add('laylay-shell-highlight');
  clearTimeout(window._laylayHlT);
  window._laylayHlT=setTimeout(function(){el.classList.remove('laylay-shell-highlight');},3200);
});
function reportLayZRuntime(status, elapsedMs, detail){
  try{
    if(window.parent&&window.parent!==window){
      window.parent.postMessage({
        source:'laylay-sim',
        type:'runtime',
        sim:'Lay-Z',
        status:status,
        elapsed_ms:typeof elapsedMs==='number'?elapsedMs:null,
        detail:detail||''
      },'*');
    }
  }catch(e){}
}
function laylayEffectiveApiKey(){
  try{
    var s=sessionStorage.getItem('_laylay_shell_api');
    if(s!==null)return String(s).trim();
    return(localStorage.getItem('laylay_dev_openai_key')||'').trim();
  }catch(e){return '';}
}
function laylayEffectiveModel(){
  try{
    var m=sessionStorage.getItem('_laylay_shell_model');
    if(m!==null&&String(m).trim())return String(m).trim();
    return sessionStorage.getItem('laylay_dev_openai_model')||'gpt-4o-mini';
  }catch(e){return 'gpt-4o-mini';}
}


async function fetchLayZCopy(lz, baseTier, answers){
  const layzSystem = [
    '당신은 브랜드 "Lay-Z"의 오늘 컨디션 카피 작가입니다.',
    '말투: 친근한 반말/해요체 혼용 가능하나 가볍고 유머 있게. 진부한 운세체·번역투·과한 한자어 나열은 피합니다.',
    '의학·법률·투자·진단처럼 들리는 단정은 금지. 재미·자기인식용이며 점수는 이미 확정입니다.',
    '카피는 짧게 끊기지 말고 여유 있게: 공감 한두 문장, 오늘 상태를 구체적으로 풀어 쓰기, 문항에서 드러난 뉘앙스를 한두 번은 직접 짚어 주기.',
    '출력은 반드시 요청된 JSON 한 덩어리만. JSON 바깥 텍스트·마크다운·코드펜스 금지.',
    'Lay-Z 지수 숫자는 사용자가 준 값이며 절대 바꾸거나 재해석하지 마세요.'
  ].join('\n');

  const lines = (answers || []).map(function (a, i) {
    var q = Qs[i];
    if (!q) return (i + 1) + '. (응답)';
    var label = '';
    if (a && a.t) label = a.t;
    else if (a && a.kw) label = '(키워드) ' + a.kw;
    else if (typeof a.s === 'number' && q.a && q.a[a.s]) label = q.a[a.s].t;
    else label = '(선택 요약 없음)';
    return (i + 1) + '. [' + q.cat + '] ' + q.q + ' → ' + label;
  }).join('\n');

  const user = [
    '아래는 사용자가 고른 8문항 요약입니다.',
    'Lay-Z 지수(고정·변경 금지): ' + lz,
    '참고 티어(색·구간만 고정, 이름/카피는 자유롭게 새로 써도 됨): id=' + baseTier.id + ', 기본이름=' + baseTier.name + ', 기본태그=' + baseTier.tag,
    '',
    '문항별 선택:',
    lines,
    '',
    '반드시 유효한 JSON 하나만 출력. 키 정확히 일치.',
    '{"tierName":"…","tierTag":"…","head":"2문장 이내 한 덩어리(임팩트 있는 헤드)","desc":"5~9문장 본문. 공감·구체 묘사·가벼운 유머 가능. 문항 요약에서 단서를 2회 이상 인용하듯 짚을 것.","recs":[{"tag":"…","title":"…","desc":"…"},{"tag":"…","title":"…","desc":"…"},{"tag":"…","title":"…","desc":"…"}],"rx":{"title":"수면 가이드 제목","sub":"한 줄 부제","items":["항목1","항목2","항목3"]}}',
    'recs는 정확히 3개. 각 rec.desc는 4~8문장 분량으로 행동 이유·기대 효과·주의를 풍부하게.',
    'rx.items는 정확히 3개. 각 항목은 2~5문장(짧은 단락)으로 수면·회복에 도움이 되는 실천을 구체적으로.'
  ].join('\n');

  const apiKey = laylayEffectiveApiKey();
  const model = laylayEffectiveModel();
  const res = await fetch('/api/openai-dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey: apiKey,
      model: model,
      messages: [
        { role: 'system', content: layzSystem },
        { role: 'user', content: user },
      ],
      max_tokens: 2400,
      temperature: 0.72,
    }),
  });
  const data = await res.json().catch(function () { return {}; });
  if (!res.ok) {
    try {
      window.__layzLastFetch = { status: res.status, mode: data.mode, err: data.error };
    } catch (e) {
      window.__layzLastFetch = { status: res.status };
    }
    return null;
  }
  window.__layzLastFetch = null;
  var raw = typeof data.text === 'string' ? data.text.trim() : '';
  if (!raw && data.raw && data.raw.choices && data.raw.choices[0] && data.raw.choices[0].message) {
    raw = String(data.raw.choices[0].message.content || '').trim();
  }
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]);
  } catch (e) {
    return null;
  }
}

function mergeTierWithAI(base, ai) {
  if (!ai) return { tier: base, applied: false };
  var out = Object.assign({}, base);
  var changed = false;
  if (String(ai.tierName || '').trim()) {
    out.name = String(ai.tierName).trim();
    changed = true;
  }
  if (String(ai.tierTag || '').trim()) {
    out.tag = String(ai.tierTag).trim();
    changed = true;
  }
  if (String(ai.head || '').trim()) {
    out.head = String(ai.head).trim();
    changed = true;
  }
  if (String(ai.desc || '').trim()) {
    out.desc = String(ai.desc).trim();
    changed = true;
  }
  var recs = Array.isArray(ai.recs) ? ai.recs : [];
  if (recs.length >= 3) {
    var mapped = [];
    var recOk = true;
    for (var i = 0; i < 3; i++) {
      var x = recs[i];
      if (!x || !String(x.title || '').trim() || !String(x.desc || '').trim()) {
        recOk = false;
        break;
      }
      mapped.push({
        tag: String(x.tag || '').trim() || '추천',
        title: String(x.title || '').trim(),
        desc: String(x.desc || '').trim(),
      });
    }
    if (recOk) {
      out.recs = mapped;
      changed = true;
    }
  }
  if (ai.rx && String(ai.rx.title || '').trim() && String(ai.rx.sub || '').trim() && Array.isArray(ai.rx.items)) {
    var items = ai.rx.items
      .map(function (t) {
        return String(t || '').trim();
      })
      .filter(Boolean);
    if (items.length >= 3) {
      out.rx = {
        title: String(ai.rx.title).trim(),
        sub: String(ai.rx.sub).trim(),
        items: items.slice(0, 3),
      };
      changed = true;
    }
  }
  return { tier: changed ? out : base, applied: changed };
}

function applyLayZCopyToDom(lz, r, merged) {
  var h = document.getElementById('layz-ai-head');
  var d = document.getElementById('layz-ai-desc');
  var badge = document.getElementById('layz-tier-badge');
  var name = document.getElementById('layz-tier-name');
  var list = document.getElementById('layz-rec-list');
  var rt = document.getElementById('layz-rx-title');
  var rs = document.getElementById('layz-rx-sub');
  var ri = document.getElementById('layz-rx-items');
  if (h) {
    h.textContent = merged.head;
    h.style.whiteSpace = 'pre-line';
    h.style.opacity = '';
  }
  if (d) {
    d.textContent = merged.desc;
    d.style.whiteSpace = 'pre-line';
    d.style.opacity = '';
  }
  if (badge) {
    badge.textContent = merged.tag;
    badge.style.background = r.accent;
    badge.style.color = '#fff';
    badge.style.opacity = '1';
  }
  if (name) {
    name.textContent = merged.name;
    name.style.opacity = '1';
  }
  if (list) {
    list.innerHTML = merged.recs
      .map(function (rec) {
        return (
          '<div class="rec"><div class="rec-tag" style="background:' +
          r.bg +
          ';color:' +
          r.tc +
          '">' +
          rec.tag +
          '</div><div style="font-size:14.5px;font-weight:700;color:var(--txt);margin-bottom:.3rem">' +
          rec.title +
          '</div><p style="font-size:12.5px;color:var(--sub);line-height:1.6;white-space:pre-line">' +
          rec.desc +
          '</p></div>'
        );
      })
      .join('');
  }
  if (rt) {
    rt.textContent = merged.rx.title;
    rt.style.opacity = '1';
  }
  if (rs) {
    rs.textContent = merged.rx.sub;
    rs.style.opacity = '1';
  }
  if (ri && merged.rx.items) {
    ri.innerHTML = merged.rx.items
      .map(function (item, idx) {
        return (
          '<div class="rx-item"><div class="rx-num">' +
          (idx + 1) +
          '</div><div style="font-size:13.5px;color:rgba(255,255,255,.85);line-height:1.65;white-space:pre-line">' +
          item +
          '</div></div>'
        );
      })
      .join('');
  }
}


function getTier(s){return TIERS.find(t=>s>=t.min&&s<=t.max)||TIERS[TIERS.length-1];}
function calcScore(){return Math.round(st.answers.reduce((a,b)=>a+b.s,0)/(Qs.length*3)*99);}

function localDate(d=new Date()){return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function prevDate(n){const d=new Date();d.setDate(d.getDate()-n);return localDate(d);}
function dispDate(iso){
  const[y,m,d]=iso.split('-');
  const wd=['일','월','화','수','목','금','토'][new Date(+y,+m-1,+d).getDay()];
  return`${y}년 ${+m}월 ${+d}일 (${wd})`;
}
function calcStreak(h){let s=0;for(let i=0;i<90;i++){if(h.find(x=>x.date===prevDate(i)))s++;else break;}return s;}
function loadHist(){try{return JSON.parse(localStorage.getItem('layz5:hist')||'[]');}catch{return[];}}
function saveHist(score,tid,crm,kws){
  const today=localDate();
  let h=loadHist().filter(x=>x.date!==today);
  h.push({date:today,score,tier:tid,crm,kws});
  h.sort((a,b)=>b.date.localeCompare(a.date));
  if(h.length>90)h=h.slice(0,90);
  localStorage.setItem('layz5:hist',JSON.stringify(h));
  return h;
}
function bumpLayLoginBonus(){
  try{
    const today=localDate();
    const last=localStorage.getItem('layz5:lastLoginBonusDay')||'';
    if(last===today)return;
    localStorage.setItem('layz5:lastLoginBonusDay',today);
    const n=(parseInt(localStorage.getItem('layz5:loginLayBonus')||'0',10)||0)+1;
    localStorage.setItem('layz5:loginLayBonus',String(n));
  }catch(e){}
}
function getLoginLayBonus(){
  try{return parseInt(localStorage.getItem('layz5:loginLayBonus')||'0',10)||0;}catch(e){return 0;}
}
function layzPercentileTop(score){
  const s=Math.max(0,Math.min(99,Number(score)||0));
  const base=Math.round(4+(s/99)*89);
  const w=(Math.floor(s*17)%7)%3;
  return Math.min(98,Math.max(2,base+w));
}

function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;el.classList.add('on');
  clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.remove('on'),2600);
}
function setLayZShareButtonReady(ready){
  var b=document.getElementById('layz-btn-share');
  if(!b)return;
  b.disabled=!ready;
  b.setAttribute('aria-disabled',ready?'false':'true');
  b.style.opacity=ready?'1':'0.52';
  b.style.cursor=ready?'pointer':'not-allowed';
}
function animNum(id,to,dur=900){
  const el=document.getElementById(id);if(!el)return;
  const t0=Date.now();
  (function tick(){
    const p=Math.min((Date.now()-t0)/dur,1),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e);
    if(p<1)requestAnimationFrame(tick);
  })();
}
function setApp(html){document.getElementById('app').innerHTML=`<div class="screen">${html}</div>`;}

// ══ MODALS ══
function openInfo(){document.getElementById('info-modal').classList.add('on');document.body.style.overflow='hidden';}
function closeInfo(){document.getElementById('info-modal').classList.remove('on');document.body.style.overflow='';}
function getLaylayShareEnv(){
  const ua=navigator.userAgent||'';
  const mobileUA=/Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const iPadDesktopUA=/Macintosh/.test(ua) && (navigator.maxTouchPoints||0)>1;
  const isMobile=mobileUA||iPadDesktopUA;
  const hasWebShare=typeof navigator.share==='function';
  const hasKakao=!!(window.Kakao && window.Kakao.Share &&
    typeof window.Kakao.isInitialized==='function' && window.Kakao.isInitialized());
  return { isMobile, isDesktop:!isMobile, hasWebShare, hasKakao };
}
function openShare(){
  document.getElementById('share-modal').classList.add('on');
  document.body.style.overflow='hidden';
  const env=getLaylayShareEnv();
  const set=(id,show)=>{const el=document.getElementById(id);if(el)el.style.display=show?'':'none';};
  set('share-native-btn', env.isMobile && env.hasWebShare);
  set('share-sms-btn',    env.isMobile);
  set('share-mail-btn',   env.isDesktop);
  const kk=document.getElementById('share-kakao-btn');
  if(kk){
    kk.style.opacity=env.hasKakao?'1':'.92';
    kk.title=env.hasKakao
      ? (env.isMobile?'카카오톡 앱이 열립니다':'카카오톡 PC에서 공유창이 열립니다')
      : '카카오톡 채팅창에 붙여넣을 텍스트가 복사돼요';
  }
}
function closeShare(){document.getElementById('share-modal').classList.remove('on');document.body.style.overflow='';}
document.getElementById('info-modal').addEventListener('click',function(e){if(e.target===this)closeInfo();});
document.getElementById('share-modal').addEventListener('click',function(e){if(e.target===this||e.target.classList.contains('share-backdrop'))closeShare();});

// ══ CANVAS CARD ══
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
function wrapText(ctx,text,x,y,maxW,lineH,maxLines=2){
  const words=text.split(' ');let line='',lines=[];
  for(const w of words){const t=line?line+' '+w:w;if(ctx.measureText(t).width>maxW&&line){lines.push(line);line=w;}else line=t;}
  if(line)lines.push(line);
  lines.slice(0,maxLines).forEach((l,i)=>ctx.fillText(l,x,y+i*lineH));
}
async function drawCard(){
  await document.fonts.ready;
  const canvas=document.getElementById('share-canvas');
  const W=1080,H=1350;
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const r=st.lzTierForShare||st.tier,lz=st.lz;
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#ffffff');g.addColorStop(1,r.bg);
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let gx=90;gx<W;gx+=80){for(let gy=90;gy<H;gy+=80){ctx.beginPath();ctx.arc(gx,gy,2.5,0,Math.PI*2);ctx.fillStyle=r.accent+'14';ctx.fill();}}
  ctx.fillStyle=r.accent;ctx.fillRect(0,0,W,12);
  ctx.textAlign='left';
  ctx.font='700 44px "Noto Sans KR",sans-serif';ctx.fillStyle=r.accent;ctx.fillText('레이레이',90,116);
  ctx.font='400 26px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.globalAlpha=.5;ctx.fillText('Lay-Z력 테스트',90,156);ctx.globalAlpha=1;
  ctx.textAlign='right';
  ctx.font='400 23px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.globalAlpha=.38;
  ctx.fillText(new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric'}),W-90,140);ctx.globalAlpha=1;
  ctx.textAlign='center';
  ctx.font='400 30px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.globalAlpha=.5;ctx.fillText('나의 Lay-Z 지수',W/2,290);ctx.globalAlpha=1;
  ctx.font='900 280px "Noto Sans KR",sans-serif';ctx.fillStyle=r.accent;ctx.fillText(String(lz),W/2,600);
  ctx.font='500 32px "Noto Sans KR",sans-serif';
  const tw=ctx.measureText(r.tag).width+72;
  rrect(ctx,W/2-tw/2,628,tw,64,32);ctx.fillStyle=r.accent;ctx.fill();ctx.fillStyle='white';ctx.fillText(r.tag,W/2,672);
  ctx.font='700 52px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.fillText(r.name,W/2,776);
  ctx.font='400 28px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.globalAlpha=.6;
  ctx.fillText('"'+r.head+'"',W/2,836);ctx.globalAlpha=1;
  ctx.strokeStyle=r.accent+'28';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(100,876);ctx.lineTo(W-100,876);ctx.stroke();
  const kws=st.answers.filter(a=>a.kw).map(a=>a.kw);
  ctx.font='500 24px "Noto Sans KR",sans-serif';
  let cx=130,cy=940;
  kws.forEach(kw=>{
    const kw_w=ctx.measureText(kw).width+56;
    if(cx+kw_w>W-130){cx=130;cy+=56;}
    rrect(ctx,cx,cy-34,kw_w,50,25);ctx.fillStyle=r.accent+'22';ctx.fill();
    ctx.fillStyle=r.tc;ctx.globalAlpha=.8;ctx.textAlign='left';ctx.fillText(kw,cx+28,cy);ctx.globalAlpha=1;
    cx+=kw_w+10;
  });
  const mX=100,mY=Math.max(cy+60,1080),mW=W-200,mH=10;
  rrect(ctx,mX,mY,mW,mH,5);ctx.fillStyle=r.accent+'22';ctx.fill();
  rrect(ctx,mX,mY,Math.round(mW*lz/99),mH,5);ctx.fillStyle=r.meter;ctx.fill();
  ctx.textAlign='center';
  ctx.font='500 28px "Noto Sans KR",sans-serif';ctx.fillStyle=r.accent;
  ctx.fillText('레이레이에서 나도 테스트해봐 → laylelay.com',W/2,mY+80);
  ctx.font='400 20px "Noto Sans KR",sans-serif';ctx.fillStyle=r.tc;ctx.globalAlpha=.35;
  ctx.fillText('레이레이 Lay-Z력 테스트',W/2,mY+115);ctx.globalAlpha=1;
  ctx.fillStyle=r.accent;ctx.fillRect(0,H-12,W,12);
  return canvas;
}
let _blob=null;
async function prepareCard(){
  if(st.lzTierForShare==null){
    toast('AI 카피를 불러온 뒤에 공유할 수 있어요');
    return;
  }
  toast('카드 생성 중...');
  const canvas=await drawCard();
  canvas.toBlob(b=>{_blob=b;},'image/png');
  document.getElementById('card-preview').src=canvas.toDataURL('image/png');
  openShare();
}
function downloadCard(){
  const a=document.createElement('a');
  a.download=`layz-${st.lz}점-${(st.lzTierForShare||st.tier).name}.png`;
  a.href=document.getElementById('share-canvas').toDataURL('image/png');
  a.click();toast('카드가 저장됐어요!');
}
async function nativeShare(){
  const trn=st.lzTierForShare||st.tier;
  const text=`나의 Lay-Z 지수: ${st.lz}점
${trn.name} (${trn.tag})

\"${trn.head}\"

레이레이에서 나도 테스트해봐 → laylelay.com`;
  try{
    if(_blob&&navigator.canShare){
      const file=new File([_blob],'layz.png',{type:'image/png'});
      if(navigator.canShare({files:[file]})){await navigator.share({files:[file],text});return;}
    }
    if(navigator.share)await navigator.share({title:'Lay-Z력 테스트',text});
  }catch(e){if(e.name!=='AbortError')copyShareText();}
}
function buildLayzShareText(){
  const trc=st.lzTierForShare||st.tier;
  return `나의 Lay-Z 지수: ${st.lz}점
${trc.name} (${trc.tag})

"${trc.head}"

레이레이에서 나도 테스트해봐 → laylelay.com`;
}
async function copyShareText(){
  const text=buildLayzShareText();
  try{await navigator.clipboard.writeText(text);toast('복사됐어요! 카카오톡에 붙여넣기 해보세요');}
  catch{toast('복사 실패. 이미지를 저장해보세요');}
  closeShare();
}
function smsShare(){
  const text=buildLayzShareText();
  try{ window.location.href = 'sms:?&body=' + encodeURIComponent(text); }
  catch(e){ copyShareText(); return; }
  closeShare();
}
function mailShare(){
  const text=buildLayzShareText();
  const subject=encodeURIComponent('Lay-Z력 테스트 결과');
  try{ window.location.href = 'mailto:?subject=' + subject + '&body=' + encodeURIComponent(text); }
  catch(e){ copyShareText(); return; }
  closeShare();
}
function kakaoShare(){
  const text=buildLayzShareText();
  const url=location.href.split('#')[0];
  const env=getLaylayShareEnv();
  if(env.hasKakao){
    try{
      window.Kakao.Share.sendDefault({
        objectType:'text',
        text:text,
        link:{ mobileWebUrl:url, webUrl:url }
      });
      closeShare();
      return;
    }catch(e){}
  }
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){
      toast(env.isDesktop ? 'PC 카카오톡 채팅창에 붙여넣어 보세요' : '카카오톡 채팅창에 붙여넣어 보세요');
    }).catch(function(){
      toast('복사 실패 — 이미지를 저장해 주세요');
    });
  }else{
    toast('카톡 공유 준비 중 — 이미지를 저장해 주세요');
  }
  closeShare();
}

// ══ SCREENS ══════════════════════════════════════════
function showIntro(){
  bumpLayLoginBonus();
  st.hist=loadHist();
  const today=localDate();
  const te=st.hist.find(h=>h.date===today);
  const avg=st.hist.length?Math.round(st.hist.reduce((a,h)=>a+h.score,0)/st.hist.length):null;
  const loginN=getLoginLayBonus();
  const lastP=st.hist.length?layzPercentileTop(st.hist[0].score):null;
  document.getElementById('hd-hist').style.display=st.hist.length>0?'block':'none';

  const todayBand=te?`
    <div style="padding:.9rem 1.1rem;background:${getTier(te.score).bg};border-radius:var(--rl);margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;border:1.5px solid ${getTier(te.score).accent}28">
      <div>
        <div style="font-size:11.5px;color:${getTier(te.score).tc};opacity:.6;margin-bottom:2px">오늘 이미 측정완료</div>
        <div style="font-size:15px;font-weight:700;color:${getTier(te.score).tc}">${getTier(te.score).name} · ${te.score}점</div>
      </div>
      <button onclick="goResult(${te.score})" style="background:${getTier(te.score).accent};color:white;border:none;padding:.45rem 1.1rem;border-radius:2rem;font-size:13px;cursor:pointer;font-family:var(--font);font-weight:500">결과 보기</button>
    </div>` : '';

  setApp(`
    <div data-laylay-region="layz-q" style="padding-top:.5rem">
      ${todayBand}
      <div style="text-align:center;padding:.75rem 0 .5rem">
        <div style="display:inline-flex;flex-wrap:wrap;justify-content:center;gap:6px 10px;background:var(--surf);border:1px solid var(--line);border-radius:2rem;padding:.35rem 1rem;font-size:11.5px;color:var(--mute);margin-bottom:1.1rem;max-width:100%;box-sizing:border-box;line-height:1.45;text-align:center">
          <span style="letter-spacing:.03em;color:var(--txt);font-weight:600">Lay-Z력</span>
          ${st.hist.length?`<span>누적 측정 <strong style="color:var(--txt)">${st.hist.length}</strong>회</span>`:''}
          <span>로그인 적립 <strong style="color:var(--txt)">${loginN}</strong>회</span>
          ${lastP!=null?`<span>지수 <strong style="color:var(--or)">상위 약 ${lastP}%</strong> 예시</span>`:''}
        </div>
        <p style="font-size:10px;color:var(--mute);margin:-.2rem 0 .9rem;line-height:1.5;text-align:center">상위 %는 데모용 추정치이며, 실제 서비스에서는 집계 로직으로 교체됩니다.</p>
        <div style="margin:0 0 1.1rem;display:flex;justify-content:center">
          <img src="${IMG_C3}" alt="레이레이 캐릭터" class="char-sleep" style="width:200px;max-width:80%;display:block" loading="lazy">
        </div>
        <h1 style="font-size:1.95rem;font-weight:900;margin:0 0 .75rem;line-height:1.22;letter-spacing:-.025em">오늘 나의<br>게으름 지수는?</h1>
        <p style="font-size:14.5px;color:var(--sub);line-height:1.85;margin:0 0 .6rem">8문항으로 측정하는 오늘의 컨디션 민낯${avg!=null?`<br>나의 평균 지수 <strong style="color:var(--txt)">${avg}점</strong>`:``}</p>
        <p style="font-size:12px;color:var(--mute);margin-bottom:1.75rem">약 1분 소요 · 매일 새로 측정 · 결과 카드 공유 가능</p>
        <button class="btn btn-p" onclick="startQuiz()" style="margin-bottom:.75rem">${te?'다시 측정하기':'지금 바로 시작하기'}</button>
        <button class="btn btn-outline" onclick="openInfo()" style="margin-bottom:.75rem">Lay-Z 지수란? →</button>
        ${st.hist.length>0?`<button class="btn btn-s" onclick="showHistory()">내 기록 보기 (총 ${st.hist.length}회)</button>`:''}
      </div>
    <div style="border-top:1px solid var(--line);padding:1.5rem 0 .5rem;margin-top:1.25rem">
      <p style="font-size:10.5px;color:var(--mute);text-align:center;margin-bottom:.85rem;letter-spacing:.06em;text-transform:uppercase">5가지 Lay-Z 유형</p>
      <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px">
        ${TIERS.map(t=>`<div style="text-align:center;padding:.65rem .15rem;background:${t.bg};border-radius:12px;border:1.5px solid ${t.accent}20">
          <div style="font-size:11px;font-weight:700;color:${t.accent};margin-bottom:2px">${t.min}~${t.max}</div>
          <div style="font-size:8.5px;color:${t.tc};line-height:1.4;opacity:.85">${t.tag}</div>
        </div>`).join('')}
      </div>
    </div>
    </div>
  `);
}

function startQuiz(){st.cur=0;st.answers=[];st.lzTierForShare=null;renderQ();}

function renderQ(){
  const q=Qs[st.cur];
  const pct=Math.round(st.cur/Qs.length*100);
  setApp(`
    <div data-laylay-region="layz-q">
    <div class="prog-wrap">
      <div class="prog-meta">
        <span class="prog-label">${String(st.cur+1).padStart(2,'0')} / ${String(Qs.length).padStart(2,'0')}</span>
        <span style="font-size:11.5px;color:var(--mute)">Lay-Z 지수 측정 중</span>
      </div>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
    </div>
    <p style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--mute);margin-bottom:.55rem">${q.cat}</p>
    <h2 style="font-size:1.2rem;font-weight:700;margin:0 0 1.5rem;line-height:1.45;letter-spacing:-.01em">${q.q}</h2>
    <div>${q.a.map((a,i)=>`<button class="ans" onclick="pick(${i})">${a.t}</button>`).join('')}</div>
    <div style="text-align:center;margin-top:1.5rem;opacity:.35">
      <img src="${IMG_C3}" alt="" style="width:72px;display:inline-block" loading="lazy">
    </div>
    </div>
  `);
}

function pick(i){
  const ans=Qs[st.cur].a[i];
  st.answers.push(ans);
  st.cur++;
  if(st.cur>=Qs.length)doResult();else renderQ();
}

function doResult(){
  const lz=calcScore();
  st.lz=lz;st.tier=getTier(lz);
  const crm=st.answers.filter(a=>a.crm).map(a=>a.crm);
  const kws=st.answers.filter(a=>a.kw).map(a=>a.kw);
  st.hist=saveHist(lz,st.tier.id,crm,kws);
  document.getElementById('hd-hist').style.display='block';
  renderResult(lz,st.tier,kws);
}

function goResult(score){
  const entry=st.hist.find(h=>h.score===score)||st.hist[0];
  st.lz=score;st.tier=getTier(score);
  const kws=entry?.kws||[];
  st.answers=(entry?.kws||[]).map(kw=>{return {kw}});
  renderResult(score,st.tier,kws);
}

function renderResult(lz,r,kws){
  const yest=st.hist.find(h=>h.date===prevDate(1));
  const diff=yest?lz-yest.score:null;
  const sleepAns=st.answers[6];
  const sleepScore=sleepAns?.s??null;
  const sleepDeficit=sleepScore===null?null
    :sleepScore===0?'0시간 (충분!)'
    :sleepScore===1?'약 1시간'
    :sleepScore===2?'약 2시간':'3시간 이상';

  const diffHtml=diff==null?'':`
    <div style="display:inline-flex;align-items:center;gap:5px;padding:.3rem .9rem;background:rgba(255,255,255,.7);border:1px solid ${r.accent}28;border-radius:2rem;font-size:13px;color:${r.tc};margin-bottom:.8rem">
      어제 대비 <strong style="color:${diff>0?r.accent:diff<0?'#1D9E75':r.tc}">${diff>0?'+':''}${diff}점</strong>
    </div>`;

  const chipsHtml=kws.length?`
    <div class="chips" style="margin-top:.9rem">
      ${kws.map((kw,i)=>`<div class="chip" style="background:${r.accent}18;color:${r.tc};animation-delay:${i*.08}s">${kw}</div>`).join('')}
    </div>`:'';

  // char image - bigger when more tired
  const charSize=lz>=60?160:lz>=40?140:120;
  const charClass=lz>=60?'char-slow':lz>=40?'char-slow':'char-ok';

  setApp(`
    <div class="rc" style="border-color:${r.accent}22">
      <div class="rc-head" style="background:${r.bg}">
        <div data-laylay-region="layz-score">
        <div style="text-align:center;padding:.5rem 0 .2rem">
          <img src="${IMG_C3}" alt="레이레이 캐릭터" class="${charClass}" style="width:${charSize}px;max-width:80%;display:inline-block" loading="lazy">
        </div>
        <p style="font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:${r.tc};opacity:.5;margin-bottom:.7rem;margin-top:.75rem">나의 Lay-Z 지수</p>
        <div id="snum" style="font-size:5rem;font-weight:900;line-height:1;color:${r.accent};margin-bottom:.6rem;letter-spacing:-.03em">0</div>
        <div class="meter-track" style="background:${r.accent}1A">
          <div id="mfill" class="meter-fill" style="width:0%;background:${r.meter}"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:10.5px;color:${r.tc};opacity:.45;margin-bottom:.85rem"><span>0 (비타민)</span><span>99 (전설)</span></div>
        </div>
        <div data-laylay-region="layz-ai-copy">
        <div id="layz-tier-badge" class="tier-badge" style="background:rgba(17,17,17,.1);color:var(--sub);font-weight:700">카피 생성 중</div>
        <h2 id="layz-tier-name" style="font-size:1.2rem;font-weight:700;color:${r.tc};margin-bottom:.65rem;letter-spacing:-.01em;min-height:1.35em;opacity:.4"></h2>
        ${diffHtml}
        <p id="layz-ai-head" style="font-size:14px;color:${r.tc};line-height:1.75;margin-bottom:.5rem;white-space:pre-line;min-height:2.2em;opacity:.35"></p>
        <p id="layz-ai-desc" style="font-size:13.5px;color:${r.tc};line-height:1.7;white-space:pre-line;min-height:4.5em;opacity:.35"></p>
        ${chipsHtml}
        <div id="layz-ai-loading" class="layz-ai-loading" aria-live="polite">
          <div class="layz-ai-loading-inner">
            <div class="layz-ai-spinner" aria-hidden="true"></div>
            <div class="layz-ai-loading-text">
              <div class="layz-ai-loading-title">AI가 유형·본문·추천·수면 가이드를 작성 중</div>
              <div id="layz-ai-step" class="layz-ai-step">8문항 응답을 한 줄로 묶는 중…</div>
              <div id="layz-ai-elapsed" class="layz-ai-elapsed">0.0초</div>
            </div>
          </div>
        </div>
        <p id="layz-ai-status" style="font-size:11.5px;color:var(--mute);margin-top:.65rem;text-align:center"></p>
        </div>
      </div>
      <div class="rc-body">
        <div class="sg">
          ${[
            {l:'오전 멘탈',v:(['정상가동','슬슬힘듦','주의','위험'])[st.answers.find(a=>a.kw&&['뇌 정상 가동 중','정신줄 어딘가에 있음','뇌 셔터 내림','감정 예민 주의'].includes(a.kw))?.s||0]||'정상가동'},
            {l:'수면 상태',v:(['만족','아쉬움','부족','심각'])[st.answers.find(a=>a.crm&&['수면만족형','수면질저하형','수면부족형','수면질저하형-심각'].indexOf(a.crm)>=0)?.s||0]||'만족'},
            {l:'부족한 수면',v:sleepDeficit||lz+'점'}
          ].map(s=>`<div class="sc"><div class="sv" style="color:${r.accent}">${s.v}</div><div class="sl">${s.l}</div></div>`).join('')}
        </div>
        <p style="margin-top:.85rem;text-align:center;font-size:12px;color:var(--mute);line-height:1.55">이번 결과 기준 <strong style="color:var(--or)">상위 약 ${layzPercentileTop(lz)}%</strong> 예시 · 로그인 적립 <strong>${getLoginLayBonus()}</strong>회</p>
      </div>
    </div>

    <div data-laylay-region="layz-rec">
    <!-- 추천 행동 -->
    <div style="margin-bottom:14px">
      <div class="dv"><hr><span>오늘 컨디션에 맞는 행동 추천</span><hr></div>
      <div id="layz-rec-list" style="min-height:200px;padding:1.25rem .5rem;text-align:center;font-size:13px;color:var(--mute);line-height:1.55">추천·행동 카피를 생성하는 중이에요.</div>
    </div>

    <!-- 수면 처방전 -->
    <div class="rx-box" style="margin-bottom:14px">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:.6rem">
        <div>
          <div style="font-size:10.5px;color:rgba(255,255,255,.45);letter-spacing:.08em;text-transform:uppercase;margin-bottom:.35rem">레이레이 수면 가이드</div>
          <div id="layz-rx-title" style="font-size:15px;font-weight:700;color:#fff;line-height:1.4;opacity:.42">수면 가이드 생성 중…</div>
          <div id="layz-rx-sub" style="font-size:12px;color:rgba(255,255,255,.38);margin-top:.25rem">잠깐만 기다려 주세요</div>
        </div>
        <img src="${IMG_C3}" alt="" style="width:72px;flex-shrink:0;margin-left:.75rem;opacity:.85" loading="lazy">
      </div>
      <div id="layz-rx-items" style="padding:.85rem .5rem;color:rgba(255,255,255,.38);font-size:12.5px;text-align:center;line-height:1.5">체크리스트 항목을 준비하고 있어요.</div>
    </div>
    </div>

    <!-- Actions -->
    <button type="button" class="btn btn-p" id="layz-btn-share" disabled aria-disabled="true" onclick="prepareCard()" data-laylay-region="layz-share" style="margin-bottom:.75rem;opacity:.52;cursor:not-allowed">결과 카드 만들어서 공유하기</button>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <button class="btn btn-s" onclick="startQuiz()">다시 테스트</button>
      <button class="btn btn-s" onclick="showHistory()">내 기록</button>
    </div>
  `);

  setTimeout(()=>{
    const mf=document.getElementById('mfill');if(mf)mf.style.width=lz+'%';
    animNum('snum',lz);
  },130);
  st.lzTierForShare = null;
  setLayZShareButtonReady(false);
  var stBar = document.getElementById('layz-ai-status');
  var loadEl = document.getElementById('layz-ai-loading');
  var stepEl = document.getElementById('layz-ai-step');
  var elapsedEl = document.getElementById('layz-ai-elapsed');
  try {
    if (window.__layzStepTimer) clearInterval(window.__layzStepTimer);
    if (window.__layzElTimer) clearInterval(window.__layzElTimer);
  } catch (e) {}
  if (stBar) stBar.textContent = '';
  var stepMsgs = [
    '8문항 응답을 패턴으로 묶는 중…',
    'Lay-Z 톤에 맞게 말맛 다듬는 중…',
    '추천 행동·수면 가이드를 풀어 쓰는 중…',
    'JSON으로 정리해 화면에 붙이는 중…'
  ];
  var stepIdx = 0;
  var tAi0 = performance.now();
  window.__layzStepTimer = setInterval(function () {
    stepIdx = (stepIdx + 1) % stepMsgs.length;
    if (stepEl) stepEl.textContent = stepMsgs[stepIdx];
  }, 1300);
  window.__layzElTimer = setInterval(function () {
    if (elapsedEl)
      elapsedEl.textContent = ((performance.now() - tAi0) / 1000).toFixed(1) + '초 경과';
  }, 110);
  function stopLayZAiLoading() {
    try {
      if (window.__layzStepTimer) clearInterval(window.__layzStepTimer);
      if (window.__layzElTimer) clearInterval(window.__layzElTimer);
    } catch (e) {}
    window.__layzStepTimer = window.__layzElTimer = null;
    if (loadEl) {
      loadEl.style.display = 'none';
      loadEl.setAttribute('aria-hidden', 'true');
    }
  }
  fetchLayZCopy(lz, r, st.answers).then(function (ai) {
    var elapsed = Math.round(performance.now() - tAi0);
    stopLayZAiLoading();
    var mr = mergeTierWithAI(r, ai);
    st.lzTierForShare = mr.tier;
    applyLayZCopyToDom(lz, r, mr.tier);
    setLayZShareButtonReady(true);
    if (ai && mr.applied) reportLayZRuntime('GPT 카피', elapsed, '본문·추천·수면 반영');
    else if (ai) reportLayZRuntime('GPT', elapsed, '형식 부족·TIERS 유지');
    else reportLayZRuntime('TIERS', elapsed, 'API/파싱');
    if (stBar) {
      if (!ai) {
        var lf = window.__layzLastFetch;
        if (lf && lf.mode === 'no-key')
          stBar.textContent =
            '서버에서 upstream을 못 탄 것 같아요 · API 경로와 백엔드 설정을 확인해 주세요';
        else stBar.textContent = 'API 실패·빈 응답 · TIERS 고정 카피';
      } else if (mr.applied) stBar.textContent = 'AI 카피 반영됨 · 약 ' + elapsed + 'ms';
      else stBar.textContent = 'AI 응답 형식 부족 · TIERS 유지';
      setTimeout(function () {
        if (stBar) stBar.textContent = '';
      }, 3200);
    }
  }).catch(function () {
    var elapsed = Math.round(performance.now() - tAi0);
    stopLayZAiLoading();
    st.lzTierForShare = r;
    applyLayZCopyToDom(lz, r, r);
    setLayZShareButtonReady(true);
    reportLayZRuntime('TIERS', elapsed, '네트워크');
    if (stBar) {
      stBar.textContent = '네트워크 오류 · TIERS 고정 카피';
      setTimeout(function () {
        if (stBar) stBar.textContent = '';
      }, 3200);
    }
  });
}

function showHistory(){
  st.hist=loadHist();
  const today=localDate();
  const avg=st.hist.length?Math.round(st.hist.reduce((a,h)=>a+h.score,0)/st.hist.length):0;
  const best=st.hist.length?Math.max(...st.hist.map(h=>h.score)):0;
  const loginN=getLoginLayBonus();

  // Build 7-day chart
  const H7=96;
  const bars=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const iso=localDate(d);
    const entry=st.hist.find(h=>h.date===iso);
    const isToday=i===6;
    const wd=['일','월','화','수','목','금','토'][d.getDay()];
    if(!entry)return`<div class="wk-col">
      <div class="wk-val" style="color:transparent">-</div>
      <div class="wk-bar-wrap"><div class="wk-bar" style="background:var(--surf);height:4px"></div></div>
      <div class="wk-label" style="color:var(--mute)">${wd}</div></div>`;
    const t=TIERS.find(x=>x.id===entry.tier)||getTier(entry.score);
    const bh=Math.max(6,Math.round(entry.score/99*H7));
    return`<div class="wk-col">
      <div class="wk-val" style="color:${t.accent}">${entry.score}</div>
      <div class="wk-bar-wrap"><div class="wk-bar" style="background:${t.meter};height:${bh}px;border-radius:3px 3px 0 0"></div></div>
      <div class="wk-label" style="color:${isToday?t.accent:'var(--mute)'};font-weight:${isToday?700:400}">${wd}</div>
    </div>`;
  }).join('');

  // Trend insight
  const r5=st.hist.slice(0,5).map(h=>h.score);
  const avgR5=r5.length?r5.reduce((a,b)=>a+b)/r5.length:0;
  const insight=r5.length>=3?(avgR5>=60?'"아 나 요즘 힘들구나 (?)"':avgR5>=40?'"슬슬 번아웃 조심해야 할 것 같아"':'"요즘 나름 잘 버티고 있는 중"'):'';

  // Week summary: group hist by weeks
  const weeks={};
  st.hist.forEach(h=>{
    const d=new Date(h.date);
    const week=`${d.getFullYear()}-W${String(Math.ceil((d.getDate()+(new Date(d.getFullYear(),d.getMonth(),1).getDay()))/7)).padStart(2,'0')}`;
    if(!weeks[week])weeks[week]={scores:[],label:''};
    weeks[week].scores.push(h.score);
    weeks[week].label=h.date;
  });

  setApp(`
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem">
      <button onclick="showIntro()" style="background:none;border:none;font-size:22px;cursor:pointer;color:var(--mute);padding:0;line-height:1;width:32px;height:32px;display:flex;align-items:center">←</button>
      <h2 style="margin:0;font-size:1.1rem;font-weight:700;letter-spacing:-.01em">내 Lay-Z 기록</h2>
    </div>

    <!-- 이번 주 차트 -->
    <div style="padding:1.25rem;background:var(--surf);border-radius:var(--rl);margin-bottom:12px;border:1px solid var(--line)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <div>
          <p style="font-size:12px;color:var(--sub);font-weight:500">최근 7일 차트 (참고)</p>
          <p style="font-size:10.5px;color:var(--mute);margin-top:4px">연속 일수 대신, 아래 <strong>전체 기록</strong>에서 <strong>년/월/일</strong> 단위로 확인하세요.</p>
        </div>
        <div style="font-size:11px;background:var(--surf);color:var(--mute);padding:.25rem .65rem;border-radius:2rem;border:1px solid var(--line)">로그인 적립 ${loginN}회</div>
      </div>
      <div style="display:flex;align-items:flex-end;gap:7px;height:${H7+44}px">${bars}</div>
      ${insight?`<p style="font-size:13px;color:var(--or);font-weight:600;margin-top:.85rem;text-align:center">${insight}</p>`:''}
    </div>

    <!-- 요약 스탯 -->
    <div class="sg" style="margin-bottom:12px">
      ${[{v:loginN+'회',l:'로그인 적립'},{v:st.hist.length+'회',l:'누적 측정'},{v:avg+'점',l:'평균 지수'},{v:best+'점',l:'최고 지수'}]
        .map(s=>`<div class="sc"><div class="sv">${s.v}</div><div class="sl">${s.l}</div></div>`).join('')}
    </div>

    <!-- 전체 히스토리 리스트 -->
    <div class="dv"><hr><span>전체 기록</span><hr></div>
    <div>
      ${st.hist.map(h=>{
        const t=TIERS.find(x=>x.id===h.tier)||getTier(h.score);
        return`<div style="display:flex;justify-content:space-between;align-items:center;padding:.9rem 1rem;background:var(--bg);border:1.5px solid var(--line);border-radius:var(--r);cursor:pointer;transition:background .12s;margin-bottom:8px"
          onclick="goResult(${h.score})"
          onmouseover="this.style.background='var(--surf)'" onmouseout="this.style.background='var(--bg)'">
          <div>
            <p style="font-size:12.5px;color:var(--mute);margin-bottom:2px">${dispDate(h.date)}${h.date===today?' · 오늘':''}</p>
            <p style="font-size:14.5px;font-weight:700;color:var(--txt)">${t.name}</p>
            ${h.kws&&h.kws.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:.4rem">${h.kws.slice(0,2).map(k=>`<span style="font-size:11px;padding:.2rem .55rem;background:${t.bg};color:${t.tc};border-radius:2rem">${k}</span>`).join('')}</div>`:''}
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:.75rem">
            <p style="font-size:1.6rem;font-weight:900;color:${t.accent};letter-spacing:-.02em">${h.score}</p>
            <p style="font-size:10px;color:var(--mute)">Lay-Z 지수</p>
          </div>
        </div>`;
      }).join('')}
    </div>

    <div style="margin-top:1rem;text-align:center">
      <button style="background:none;border:none;color:var(--mute);font-size:13px;cursor:pointer;font-family:var(--font);text-decoration:underline"
        onclick="if(confirm('기록을 모두 삭제할까요?')){localStorage.removeItem('layz5:hist');st.hist=[];toast('삭제됐어요');showIntro();}">기록 전체 삭제</button>
    </div>
  `);
}

// Init
showIntro();
