// data/catalog.json 로더. 빌드 스크립트가 갱신하면 자동 리로드한다.
// 스팀 추천기의 catalog.js 와 동일한 역할.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = path.join(__dirname, "..", "data", "catalog.json");

let catalog = [];
let byId = new Map();
let mtime = 0;

function load() {
  try {
    const stat = fs.statSync(CATALOG_PATH);
    if (stat.mtimeMs === mtime) return;
    const raw = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
    catalog = Array.isArray(raw) ? raw : raw.items || [];
    byId = new Map(catalog.map((g) => [`${g.type}:${g.id}`, g]));
    mtime = stat.mtimeMs;
    console.log(`  ✓ 카탈로그 로드: ${catalog.length}개 작품`);
  } catch (e) {
    if (!catalog.length) console.warn(`  ! 카탈로그를 읽지 못했습니다 (${e.message}). 빈 카탈로그로 시작합니다.`);
  }
}
load();
// 빌드 중 갱신 감지 (10초마다)
setInterval(load, 10_000).unref?.();

export function getCatalog() { load(); return catalog; }
export function getCatalogSize() { return catalog.length; }
export function getById(type, id) { return byId.get(`${type}:${id}`) || null; }
export const catalogKey = (g) => `${g.type}:${g.id}`;
