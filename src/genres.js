// 장르·키워드 어휘와 한글 라벨.
// 영화/시리즈의 TMDB 장르 ID를 통일된 '슬러그'로 정규화해 태그처럼 다룬다.
// (스팀 추천기의 SteamSpy 태그에 해당 — 장르 슬러그 + 키워드 슬러그가 작품의 '태그')

// TMDB 영화 장르 ID → 슬러그
export const MOVIE_GENRE_SLUG = {
  28: "action", 12: "adventure", 16: "animation", 35: "comedy", 80: "crime",
  99: "documentary", 18: "drama", 10751: "family", 14: "fantasy", 36: "history",
  27: "horror", 10402: "music", 9648: "mystery", 10749: "romance", 878: "scifi",
  10770: "drama", 53: "thriller", 10752: "war", 37: "western",
};

// TMDB TV 장르 ID → 슬러그 (일부는 두 슬러그로 확장)
export const TV_GENRE_SLUG = {
  10759: ["action", "adventure"], 16: ["animation"], 35: ["comedy"], 80: ["crime"],
  99: ["documentary"], 18: ["drama"], 10751: ["family"], 10762: ["kids"],
  9648: ["mystery"], 10763: ["news"], 10764: ["reality"], 10765: ["scifi", "fantasy"],
  10766: ["soap"], 10767: ["talk"], 10768: ["war"], 37: ["western"],
};

export function movieGenreSlugs(ids = []) {
  const out = new Set();
  for (const id of ids) { const s = MOVIE_GENRE_SLUG[id]; if (s) out.add(s); }
  return [...out];
}
export function tvGenreSlugs(ids = []) {
  const out = new Set();
  for (const id of ids) { const arr = TV_GENRE_SLUG[id]; if (arr) for (const s of arr) out.add(s); }
  return [...out];
}

// 슬러그 → 한글 라벨
const GENRE_KO = {
  action: "액션", adventure: "모험", animation: "애니메이션", comedy: "코미디",
  crime: "범죄", documentary: "다큐멘터리", drama: "드라마", family: "가족",
  fantasy: "판타지", history: "역사", horror: "호러", music: "음악",
  mystery: "미스터리", romance: "로맨스", scifi: "SF", thriller: "스릴러",
  war: "전쟁", western: "서부극", kids: "키즈", reality: "리얼리티",
  talk: "토크", soap: "연속극", news: "뉴스", politics: "정치",
};

// 자주 쓰는 키워드 슬러그의 한글 라벨 (없으면 슬러그를 보기 좋게 변환)
const KEYWORD_KO = {
  dystopia: "디스토피아", "time-travel": "시간여행", superhero: "슈퍼히어로",
  "based-on-true-story": "실화 바탕", "serial-killer": "연쇄살인", "high-school": "하이틴",
  zombie: "좀비", heist: "케이퍼·강탈", revenge: "복수", "coming-of-age": "성장물",
  "post-apocalyptic": "포스트 아포칼립스", survival: "생존", supernatural: "초자연",
  psychological: "심리", "dark-comedy": "블랙코미디", "true-crime": "실화 범죄",
  courtroom: "법정물", spy: "첩보", "martial-arts": "무술 액션", monster: "괴수",
  space: "우주", robot: "로봇·AI", vampire: "뱀파이어", witch: "마녀·주술",
  "period-drama": "시대극", political: "정치", sports: "스포츠", musical: "뮤지컬",
  "family-drama": "가족 드라마", romcom: "로맨틱 코미디", noir: "느와르",
  "k-drama": "K-드라마", anime: "일본 애니", "slice-of-life": "일상물",
  "found-footage": "페이크 다큐", disaster: "재난", "war-drama": "전쟁물",
  biopic: "전기영화", cult: "컬트", "feel-good": "기분 좋아지는",
  tearjerker: "감동·최루", "mind-bending": "두뇌·반전", gore: "고어",
  teen: "청춘", apocalypse: "종말물", thriller: "스릴러",
};

const pretty = (s) => String(s).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function koLabel(slug) {
  return GENRE_KO[slug] || KEYWORD_KO[slug] || pretty(slug);
}

// ISO 639-1 → 한글 언어명
export const LANG_KO = {
  ko: "한국어", en: "영어", ja: "일본어", es: "스페인어", fr: "프랑스어",
  de: "독일어", it: "이탈리아어", zh: "중국어", pt: "포르투갈어", hi: "힌디어",
  th: "태국어", tr: "터키어", ru: "러시아어", nl: "네덜란드어", sv: "스웨덴어",
};
export const langKo = (code) => LANG_KO[code] || (code ? code.toUpperCase() : "기타");
