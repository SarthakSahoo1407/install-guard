import fs from "fs";
import path from "path";
import { createHash } from "crypto";

const CACHE_DIR = path.join(
  process.env.HOME || process.env.USERPROFILE || "/tmp",
  ".install-guard-cache"
);
const TTL_MS = 15 * 60 * 1000; // 15 minutes

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function keyToFile(key) {
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 16);
  return path.join(CACHE_DIR, `${hash}.json`);
}

export function getCached(key) {
  try {
    const file = keyToFile(key);
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (Date.now() - raw.ts > TTL_MS) {
      fs.unlinkSync(file);
      return null;
    }
    return raw.data;
  } catch {
    return null;
  }
}

export function setCache(key, data) {
  try {
    ensureDir();
    fs.writeFileSync(keyToFile(key), JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // cache write failures are non-fatal
  }
}
