# 🎬 넷플릭스 추천기

당신의 **넷플릭스 시청기록(본 작품 + 횟수 + 최근성)** 을 분석해 취향을 파악하고,
**오늘의 기분을 묻는 질문**으로 방향을 잡아 다음에 볼 **영화·시리즈**를 추천하는 웹앱입니다.

> "시청기록은 기준선, 그날의 질문이 방향을 바꾼다" — 같은 사람이라도 답변에 따라 매번 다른 추천을 받습니다.

스팀 게임 추천기와 같은 설계를 영화·시리즈로 옮긴 프로젝트입니다.

**원클릭 배포** (키 없이 데모 카탈로그로 바로 동작):

[![Render에 배포](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Dopamineliminated/netflix-movie-recommender)

| 스팀 추천기 | 넷플릭스 추천기 |
|---|---|
| Steam API (보유작 + 플레이타임) | **넷플릭스 시청기록 CSV** (본 작품 + 횟수 + 최근성) |
| SteamSpy (카탈로그 · 태그) | **TMDB** (장르 + 키워드, 넷플릭스 제공작만 필터) |
| 플레이타임 가중 | 시청 횟수(에피소드 수) · 최근성 가중 |
| 가격 필터 | 영화/시리즈 · 길이 · 시대 · 언어 필터 |

## 동작 방식

1. **시청기록 분석** — 넷플릭스에서 받은 `NetflixViewingHistory.csv` 를 올리면, 작품 단위로 묶어
   많이·최근에 본 작품일수록 높은 가중치로 **장르·키워드 취향 프로필**을 만듭니다.
   (시리즈는 에피소드 수가 곧 몰입도 = 스팀의 플레이타임에 해당)
2. **추가 질문** — (선택) **이 작품과 비슷한 것 찾기**, 분위기, **누구와 함께**, 영화/시리즈, 길이, 시대,
   익숙함 vs 새로움, 언어권, **관람등급**을 묻습니다. ('가족·아이와'를 고르면 관람 수위를 자동으로 낮춰 추천)
3. **추천** — 취향 점수와 기분 점수를 가중 합산 + 다양성 재정렬(MMR)로 12편을 제시합니다.
   - **'이 작품과 비슷한'을 지정하면 그 작품과의 유사도가 최우선**으로 작동합니다.
   - **제약이 적을수록 더 넓은 스펙트럼**, 많을수록 좁고 집중됩니다.
   - **무한 추천**: '다른 추천 보기'를 누를 때마다 이미 본 추천을 제외하고 새 작품을 제시합니다.

## 빠른 시작

```bash
npm install
npm start          # http://localhost:3000
```

키 없이도 **데모 모드**(스릴러·SF·K-드라마 애호가)와 데모 카탈로그로 전체 흐름을 체험할 수 있습니다.

### 실제 추천을 위한 설정 (TMDB 키 — 무료)

1. https://www.themoviedb.org/settings/api 에서 키 발급 (v3 API 키 또는 v4 읽기 토큰)
2. `.env.example` 를 `.env` 로 복사 후 입력:
   ```
   TMDB_API_KEY=발급받은키
   WATCH_REGION=KR
   ```
3. 카탈로그 수집(최초 1회, 이어받기 가능):
   ```bash
   node scripts/build-catalog.js 2000
   ```
   수집 중에도 서버는 동작하며, 모인 만큼 추천 폭이 넓어집니다(재시작 불필요).

### 내 시청기록 받는 법

PC 웹에서 **넷플릭스 로그인 → 계정 → 프로필 선택 → 시청 활동 → 맨 아래 「모두 다운로드」** →
`NetflixViewingHistory.csv` 를 받아 첫 화면에 올리면 됩니다.
(파일은 추천 계산에만 쓰이고 서버에 저장하지 않습니다.)

## 구조

```
server.js              Express 서버 (/api/analyze, /api/recommend, /api/config, /api/search)
src/
  tmdb.js              TMDB 클라이언트 (넷플릭스 디스커버 · 키워드 보강 · 검색)
  catalog.js           data/catalog.json 로더 (빌드 중 자동 리로드)
  history.js           넷플릭스 시청기록 CSV 파싱 · 작품 매칭
  recommend.js         추천 엔진 (취향+기분 가중합 · MMR 다양성)
  questions.js         추가 질문 정의 (프론트·백 공유)
  genres.js            장르·키워드 슬러그 · 한글 라벨
scripts/
  build-catalog.js     TMDB 넷플릭스 제공작 수집 → data/catalog.json
public/                프론트엔드 (무빌드 바닐라 JS)
data/catalog.json      작품 카탈로그 (95편 데모 시드 포함, 빌드로 확장)
render.yaml            Render 배포 설정
DEPLOY.md              배포 가이드
```

## 배포

Node 서버라서 Node 실행 호스트가 필요합니다(정적 호스팅·Vercel 서버리스로는 그대로 안 됨).
**Render 무료 플랜**이 가장 간단하며, `render.yaml` 이 포함되어 있어 저장소만 연결하면 됩니다.
키 없이도 95편 데모 카탈로그로 바로 동작합니다. 자세한 단계는 [`DEPLOY.md`](DEPLOY.md) 참고.

## 참고

- 데이터: TMDB. 넷플릭스 가용성(watch provider)은 지역에 따라 다를 수 있습니다. 추천은 참고용입니다.
- 이 제품은 TMDB API를 사용하지만 TMDB가 보증·인증하지는 않았습니다.
