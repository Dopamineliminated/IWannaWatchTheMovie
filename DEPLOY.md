# 🚀 배포 가이드 (Render — 무료)

이 앱은 Node(Express) 서버라서 **Node를 실행할 수 있는 호스트**가 필요합니다.
정적 호스팅(GitHub Pages·Netlify 정적)이나 Vercel 서버리스로는 그대로 동작하지 않습니다.
Render 무료 플랜이 가장 간단합니다.

## 사전 준비 (이미 완료)
- GitHub 저장소에 코드가 올라가 있음 ✅
- `data/catalog.json`(95편 데모 카탈로그)이 커밋되어 있어, **TMDB 키 없이도 바로 동작** ✅
- `render.yaml` 설정 파일 포함 ✅
- 비밀키 `.env` 는 `.gitignore` 로 제외 ✅

## 가장 빠른 길 — 원클릭 배포

README의 **[Deploy to Render]** 버튼을 누르면 이 저장소로 바로 배포 화면이 열립니다.
(Render 로그인 → 한 번 확인 → 끝. 키 없이 데모 카탈로그로 동작)

👉 https://render.com/deploy?repo=https://github.com/Dopamineliminated/IWannaSeeTheMovie

## 수동 단계 (대시보드)

1. **https://render.com** 접속 → **GitHub 계정으로 로그인** (가입 무료)
2. 우측 상단 **New +** → **Blueprint** (또는 **Web Service**)
3. 저장소 **`IWannaSeeTheMovie`** 를 선택 → **Connect**
4. Render 가 `render.yaml` 을 자동 인식합니다. (수동이면: Build Command `npm install`, Start Command `npm start`)
5. (선택) **Environment** 섹션에서 환경변수 추가 — 없어도 데모 카탈로그로 동작합니다:
   - Key: `TMDB_API_KEY`  ·  Value: *(발급받은 TMDB 키)*
6. **Create Web Service** → 빌드가 끝나면 `https://netflix-movie-recommender-xxxx.onrender.com` 같은 **라이브 주소**가 생깁니다.

## 배포 후

- 그 주소를 누구에게나 공유하면, 방문자는 자기 **넷플릭스 시청기록 CSV** 를 올리거나 **데모 모드**로 추천을 받습니다.
- 코드를 고쳐 `git push` 하면 Render 가 **자동 재배포**합니다.

## 카탈로그를 더 키우려면

배포본은 커밋된 95편 데모 카탈로그로 동작합니다. 더 넓은 추천을 원하면 **로컬에서** 키를 넣고 빌드한 뒤,
생성된 `data/catalog.json` 을 커밋·푸시하세요 (서버에서 직접 크롤링하지 않습니다 — Render 무료 플랜은 디스크가 휘발성):

```bash
# .env 에 TMDB_API_KEY 설정 후
node scripts/build-catalog.js 2000
git add data/catalog.json && git commit -m "카탈로그 확장" && git push
```

## 참고 (무료 플랜 특성)

- 일정 시간 접속이 없으면 서버가 잠들었다가, 다음 첫 요청 때 **다시 깨어나는 데 ~1분** 걸립니다. (취미용으로는 충분)
- 실데이터 매칭(시청기록 → TMDB 검색)은 `TMDB_API_KEY` 를 설정해야 정확해집니다. 키가 없으면 95편 카탈로그 안에서만 매칭됩니다.
