// scripts/exportFacilities.ts
import fs from "node:fs";
import path from "node:path";
import * as src from "../lib/facilityData"; // your current source (no coords inside)

// ---------- types ----------
type FacilityOut = {
  externalId?: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  tags?: string[];
};

// ---------- output paths ----------
const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "scripts");
const outFile = path.join(outDir, "seedFacilities.json");

// ---------- helpers ----------
function asString(v: any): string | undefined {
  if (v == null) return undefined;
  if (typeof v === "string") return v.trim() || undefined;
  if (typeof v === "number") return String(v);
  return undefined;
}

function extractText(vars: any[], ...keys: string[]): string | undefined {
  for (const key of keys) {
    const hit = vars.find((v: any) => {
      const k = (v?.key ?? v?.label ?? "").toString().toLowerCase();
      return k.includes(key.toLowerCase());
    });
    if (!hit) continue;
    const val = hit.value ?? hit.text ?? hit.content ?? hit.data;
    const s = asString(val);
    if (s) return s;
  }
  return undefined;
}

// DJB2 hash → uint32
function hash32(s: string): number {
  let h = 5381 >>> 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

// Map [0,1] into Puerto Rico bounding box (shrunk a bit to avoid edges)
const PR = {
  latMin: 17.95,
  latMax: 18.52,
  lngMin: -67.25,
  lngMax: -65.30,
};

// Deterministic dummy coords inside PR box, based on id/name
function dummyCoords(seed: string) {
  const h1 = hash32(seed);
  const h2 = hash32(seed + "|lng");
  const u1 = h1 / 0xffffffff; // [0,1]
  const u2 = h2 / 0xffffffff; // [0,1]
  const lat = PR.latMin + u1 * (PR.latMax - PR.latMin);
  const lng = PR.lngMin + u2 * (PR.lngMax - PR.lngMin);
  // round a bit for cleaner output
  return { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5 };
}

// ---------- main ----------
async function main() {
  const facilitiesObj = (src as any).facilityDatabase as
    | Record<string, any>
    | undefined;

  if (!facilitiesObj) {
    console.error('ERROR: Could not find export "facilityDatabase" in lib/facilityData.ts');
    process.exit(1);
  }

  const out: FacilityOut[] = [];
  let dummyCount = 0;

  for (const [id, record] of Object.entries(facilitiesObj)) {
    const externalId = id;
    const nameCandidate = record?.title ?? record?.name ?? id;
    const category = record?.type ?? record?.category;
    const tags = Array.isArray(record?.tags) ? record.tags : undefined;

    const boxes = Array.isArray(record?.boxes) ? record.boxes : [];
    const allVars = boxes.flatMap((b: any) =>
      Array.isArray(b?.variables) ? b.variables : []
    );

    const name =
      extractText(allVars, "name", "official name") ??
      asString(nameCandidate) ??
      id;
    const address = extractText(allVars, "address", "dirección", "location");
    const phone = extractText(allVars, "phone", "teléfono");
    const website = extractText(allVars, "website", "site", "url");
    const description = extractText(allVars, "description", "notes", "desc", "info");

    // No real coords → fabricate deterministic dummy ones in PR
    const { lat, lng } = dummyCoords(externalId || name!);
    dummyCount++;

    out.push({
      externalId,
      name: name!,
      lat,
      lng,
      category: asString(category),
      address,
      phone,
      website,
      description,
      tags,
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2), "utf8");
  console.log(`✅ Wrote ${out.length} facilities → ${outFile}`);
  console.log(`🧪 Used dummy Puerto Rico coordinates for ${dummyCount} facilities`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
