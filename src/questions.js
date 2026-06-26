// 추가 질문 정의 — 프론트엔드 렌더링과 백엔드 점수 계산이 공유한다.
// 시청기록(취향)은 기준선, 이 답변(그날의 기분)이 추천 방향을 잡는다.

export const QUESTIONS = [
  {
    id: "seed",
    type: "seed",
    title: "🎯 이 작품과 비슷한 걸 찾기",
    hint: "영화·시리즈 이름을 입력해 선택하면, 그 작품을 최우선 기준으로 비슷한 걸 추천합니다 (선택 사항)",
  },
  {
    id: "mood",
    type: "multi",
    title: "지금 끌리는 분위기는? (복수 선택 가능)",
    hint: "오늘의 기분 — 추천 방향을 가장 크게 좌우합니다",
    options: [
      { value: "story", label: "🎭 몰입형 스토리", genres: ["drama"], keywords: ["coming-of-age", "tearjerker", "period-drama", "biopic", "family-drama", "slice-of-life"] },
      { value: "action", label: "💥 짜릿한 액션", genres: ["action", "adventure"], keywords: ["superhero", "martial-arts", "spy", "heist", "disaster"] },
      { value: "mind", label: "🧠 머리 쓰는 미스터리·스릴러", genres: ["thriller", "mystery", "crime"], keywords: ["serial-killer", "heist", "psychological", "mind-bending", "noir", "courtroom", "spy", "true-crime"] },
      { value: "horror", label: "👻 오싹한 호러", genres: ["horror"], keywords: ["zombie", "supernatural", "monster", "gore", "vampire", "found-footage", "survival"] },
      { value: "comedy", label: "😂 가볍게 웃긴", genres: ["comedy"], keywords: ["dark-comedy", "romcom", "feel-good", "slice-of-life"] },
      { value: "romance", label: "💕 설레는 로맨스", genres: ["romance"], keywords: ["romcom", "k-drama", "coming-of-age", "feel-good"] },
      { value: "scifi", label: "🚀 상상력 SF·판타지", genres: ["scifi", "fantasy"], keywords: ["dystopia", "time-travel", "space", "robot", "post-apocalyptic", "supernatural", "mind-bending"] },
      { value: "real", label: "🎬 다큐·실화", genres: ["documentary", "history"], keywords: ["based-on-true-story", "true-crime", "biopic", "sports", "political"] },
    ],
  },
  {
    id: "company",
    type: "single",
    title: "누구와 함께 보세요?",
    hint: "'가족·아이와'를 고르면 관람 수위를 자동으로 낮춰서 추천합니다",
    options: [
      { value: "solo", label: "🧍 혼자 몰입" },
      { value: "family", label: "👨‍👩‍👧 가족·아이와" },
      { value: "partner", label: "💑 연인과" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    id: "type",
    type: "single",
    title: "영화가 끌려요, 시리즈가 끌려요?",
    options: [
      { value: "movie", label: "🎞️ 영화 (한 편 완결)" },
      { value: "tv", label: "📺 시리즈 (몰아보기)" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    id: "length",
    type: "single",
    title: "오늘 들일 수 있는 시간은?",
    hint: "영화는 러닝타임, 시리즈는 호흡 기준입니다",
    options: [
      { value: "short", label: "⏱️ 짧고 가볍게 (~100분)" },
      { value: "standard", label: "🍿 영화 한 편 (100~150분)" },
      { value: "binge", label: "📚 길게 몰아보기 (시리즈/장편)" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    id: "era",
    type: "single",
    title: "어느 시대 작품이 좋아요?",
    options: [
      { value: "latest", label: "🆕 최신작 (2022~)" },
      { value: "2010s", label: "📀 2010년대" },
      { value: "classic", label: "🏛️ 그 이전 명작" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    id: "novelty",
    type: "single",
    title: "오늘은 어떤 걸 원해요?",
    hint: "'색다른 도전'을 고르면 평소 안 보던 결을 적극 탐색합니다",
    options: [
      { value: "familiar", label: "🎯 내 취향 그대로" },
      { value: "balanced", label: "⚖️ 적당히 섞어서" },
      { value: "new", label: "✨ 색다른 도전" },
    ],
  },
  {
    id: "language",
    type: "single",
    title: "어느 나라 작품이 끌려요?",
    hint: "선택한 언어권 작품을 우선 추천합니다",
    options: [
      { value: "ko", label: "🇰🇷 한국" },
      { value: "en", label: "🇺🇸 영미권" },
      { value: "ja", label: "🇯🇵 일본" },
      { value: "nonen", label: "🌍 비영어권 다양하게" },
      { value: "any", label: "상관없음" },
    ],
  },
  {
    id: "maturity",
    type: "single",
    title: "관람 수위는 어느 정도가 좋아요?",
    hint: "선택한 등급 이하의 작품만 추천합니다",
    options: [
      { value: "kids", label: "🟢 누구나 (전체·12세)" },
      { value: "teen", label: "🟡 15세까지" },
      { value: "any", label: "🔴 다 괜찮아요 (청불 포함)" },
    ],
  },
];

// 관람등급 슬러그 순위 (높을수록 수위 높음)
export const MATURITY_RANK = { all: 0, "12": 1, "15": 2, "19": 3 };
export const MATURITY_CAP = { kids: 1, teen: 2, any: 3 }; // 질문 답변 -> 허용 상한
export function maturityKo(slug) {
  return { all: "전체관람가", "12": "12세", "15": "15세", "19": "청소년 관람불가" }[slug] || "";
}

// 답변에서 '기분 태그 가중치' 맵을 만든다. (mood 옵션의 genres+keywords 를 합산)
export function buildMoodWeights(answers) {
  const moodSel = answers?.mood;
  const selected = Array.isArray(moodSel) ? moodSel : moodSel ? [moodSel] : [];
  const moodQ = QUESTIONS.find((q) => q.id === "mood");
  const weights = new Map();
  for (const val of selected) {
    const opt = moodQ.options.find((o) => o.value === val);
    if (!opt) continue;
    for (const t of opt.genres || []) weights.set(t, (weights.get(t) || 0) + 1);
    for (const t of opt.keywords || []) weights.set(t, (weights.get(t) || 0) + 0.7); // 키워드는 약간 낮게
  }
  return weights; // 슬러그 -> 가중치
}
