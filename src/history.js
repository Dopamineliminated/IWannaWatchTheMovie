// 넷플릭스 시청기록 CSV 파싱 → 작품 단위로 묶어 '취향 기준선'을 만든다.
// 스팀 추천기의 enrichTopGames(보유작 → 태그 보강)에 해당.
//
// CSV 형식(넷플릭스 계정 > 시청 활동 > 모두 다운로드):
//   Title,Date
//   "Stranger Things: Season 4: Chapter One: The Hellfire Club","5/27/22"
//   "The Irishman","11/30/19"
//
// 시리즈는 에피소드마다 한 줄 → 묶으면 시청 횟수(count)가 곧 '몰입도(=플레이타임)'.

import { getCatalog } from "./catalog.js";
import { searchMulti, enrichDetails } from "./tmdb.js";

const norm = (s = "") =>
  String(s).toLowerCase().normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, " ").trim();

// CSV 한 줄 파서 (따옴표 안 콤마 처리)
function parseCsvLine(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

// "Stranger Things: Season 4: ..." → "Stranger Things"
const SEG_SPLIT = /:\s+/;
function baseTitle(raw) {
  const segs = String(raw).split(SEG_SPLIT);
  return segs[0].trim();
}

function parseDate(s) {
  const m = String(s).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let [, mo, d, y] = m;
    y = y.length === 2 ? 2000 + Number(y) : Number(y);
    return new Date(y, Number(mo) - 1, Number(d)).getTime();
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

export function parseHistoryCsv(text) {
  const lines = String(text).split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  // 헤더 스킵 (Title 로 시작하면)
  const start = /^"?\s*title\s*"?\s*,/i.test(lines[0]) ? 1 : 0;
  const rows = [];
  for (let i = start; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 1) continue;
    const title = (cols[0] || "").trim();
    if (!title) continue;
    rows.push({ raw: title, base: baseTitle(title), date: parseDate(cols[1]) });
  }
  return rows;
}

// 행들을 작품(base) 단위로 묶는다.
function groupByBase(rows) {
  const map = new Map();
  for (const r of rows) {
    const key = norm(r.base);
    if (!key) continue;
    const cur = map.get(key) || { base: r.base, count: 0, last: 0 };
    cur.count++;
    if (r.date && r.date > cur.last) cur.last = r.date;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

const MONTH = 30.44 * 24 * 3600 * 1000;
function recencyMult(last) {
  if (!last) return 0.7;
  const months = (Date.now() - last) / MONTH;
  return Math.max(0.4, Math.min(1, 1 - months / 48)); // 4년에 걸쳐 0.4까지 감쇠
}

// 카탈로그에서 제목(현지/원제)으로 매칭
function matchInCatalog(catalog, base) {
  const nb = norm(base);
  if (!nb) return null;
  for (const g of catalog) {
    if (norm(g.title) === nb || norm(g.originalTitle || "") === nb) return g;
  }
  // 부분 포함(시드가 부제까지 포함된 경우) — 보수적으로 길이 비슷할 때만
  for (const g of catalog) {
    const a = norm(g.title), b = norm(g.originalTitle || "");
    if ((a && nb.includes(a) && a.length > 4) || (b && nb.includes(b) && b.length > 4)) return g;
  }
  return null;
}

// 시청기록 → 취향 항목 배열. key 있으면 미매칭분을 TMDB 검색으로 보강.
export async function buildWatchedFromCsv(text, key) {
  const rows = parseHistoryCsv(text);
  const groups = groupByBase(rows);
  const catalog = getCatalog();

  const watched = [];
  const unmatched = [];
  for (const grp of groups) {
    const hit = matchInCatalog(catalog, grp.base);
    if (hit) watched.push(toWatched(hit, grp));
    else unmatched.push(grp);
  }

  // TMDB 키가 있으면 미매칭 상위 작품을 온라인 검색으로 보강 (응답성 위해 상한)
  if (key && unmatched.length) {
    const LIMIT = 40;
    const targets = unmatched.slice(0, LIMIT);
    const seen = new Set(watched.map((w) => `${w.type}:${w.id}`));
    const results = await Promise.allSettled(targets.map((g) => resolveOnline(g, key, seen)));
    for (const r of results) if (r.status === "fulfilled" && r.value) watched.push(r.value);
  }

  watched.sort((a, b) => b.weight - a.weight);
  return {
    watched,
    stats: {
      rows: rows.length,
      titles: groups.length,
      matched: watched.length,
      online: key ? Math.min(unmatched.length, 40) : 0,
    },
  };
}

async function resolveOnline(grp, key, seen) {
  const nb = norm(grp.base);
  const results = await searchMulti(grp.base, key);
  if (!results.length) return null;
  // 제목이 정확히 일치하는 후보 우선, 없으면 가장 인기 있는 것
  let pick = results.find((r) => norm(r.title) === nb || norm(r.originalTitle) === nb)
    || results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
  const dkey = `${pick.type}:${pick.id}`;
  if (seen.has(dkey)) return null;
  seen.add(dkey);
  await enrichDetails(pick, key);
  return toWatched(pick, grp);
}

function toWatched(item, grp) {
  const tags = [...(item.genres || []), ...(item.keywords || [])];
  const weight = recencyMult(grp.last) * (Math.sqrt(grp.count) * 5) + 1;
  return {
    id: item.id, type: item.type, title: item.title, originalTitle: item.originalTitle,
    year: item.year, lang: item.lang, poster_path: item.poster_path || null,
    tags, count: grp.count, last: grp.last, weight,
  };
}

// 데모/외부에서 카탈로그 항목으로 '시청 항목'을 만들 때 쓰는 헬퍼.
export function makeWatched(item, count, last) {
  return toWatched(item, { count, last });
}
