// 넷플릭스(지역) 인기 영화·시리즈를 TMDB로 수집해 data/catalog.json 을 만든다.
// 스팀 추천기의 build-catalog.js(SteamSpy 상위 게임 수집)에 해당.
//
//   node scripts/build-catalog.js [목표편수=2000]
//
// - 영화/시리즈를 인기순으로 디스커버 → 각 작품의 키워드·러닝타임 보강
// - 이어받기: 기존 catalog.json 에 없는 것만 추가
// - 중간 저장(50편마다)되어 언제든 끊고 이어서 실행 가능

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverNetflix, enrichDetails, REGION } from "../src/tmdb.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "data", "catalog.json");
const API_KEY = process.env.TMDB_API_KEY || "";
const TARGET = Number(process.argv[2] || 2000);

if (!API_KEY) {
  console.error("\n  ✗ TMDB_API_KEY 가 없습니다. .env 에 키를 설정하세요.");
  console.error("    발급: https://www.themoviedb.org/settings/api  (무료)\n");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadExisting() {
  try {
    const raw = JSON.parse(fs.readFileSync(OUT, "utf8"));
    const items = Array.isArray(raw) ? raw : raw.items || [];
    // 데모 시드(작은 정수 id)는 실데이터로 대체되도록 무시하고, 실 수집분만 이어받기
    const real = items.filter((g) => g.poster_path || g._tmdb);
    return new Map(real.map((g) => [`${g.type}:${g.id}`, g]));
  } catch { return new Map(); }
}

function save(map) {
  const items = [...map.values()].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  fs.writeFileSync(OUT, JSON.stringify({
    meta: { source: "tmdb", region: REGION, builtAt: new Date().toISOString(), count: items.length },
    items,
  }, null, 0));
}

async function collectKind(kind, map, perKind) {
  let page = 1, totalPages = 1, added = 0, sinceSave = 0;
  const have = () => [...map.values()].filter((g) => g.type === (kind === "tv" ? "tv" : "movie")).length;
  while (have() < perKind && page <= totalPages && page <= 500) {
    let res;
    try { res = await discoverNetflix(kind, page, API_KEY); }
    catch (e) { console.warn(`  ! ${kind} p${page} 실패: ${e.message}`); await sleep(800); page++; continue; }
    totalPages = res.totalPages;
    for (const item of res.items) {
      const key = `${item.type}:${item.id}`;
      if (map.has(key)) continue;
      await enrichDetails(item, API_KEY);
      item._tmdb = true;
      map.set(key, item);
      added++; sinceSave++;
      if (sinceSave >= 50) { save(map); sinceSave = 0; process.stdout.write(`\r  ${kind}: ${have()}편 수집…   `); }
      await sleep(120); // TMDB rate limit 여유
      if (have() >= perKind) break;
    }
    page++;
  }
  save(map);
  console.log(`\r  ✓ ${kind}: ${have()}편  (+${added})         `);
}

(async () => {
  console.log(`\n  🎬 TMDB 카탈로그 빌드 — 지역 ${REGION}, 목표 ~${TARGET}편\n`);
  const map = loadExisting();
  console.log(`  이어받기: 기존 ${map.size}편`);
  const perKind = Math.ceil(TARGET / 2);
  await collectKind("movie", map, perKind);
  await collectKind("tv", map, perKind);
  save(map);
  console.log(`\n  완료 — 총 ${map.size}편을 data/catalog.json 에 저장했습니다.\n`);
})();
