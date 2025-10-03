// scripts/exportFacilities.ts
// DEPRECATED: This script was designed for the old facilities table architecture.
// The new architecture uses: geoLocales → facilityBoxes → facilityVariables
// Data should now be managed directly in Convex dashboard or via mutations.
//
// To migrate data to the new structure, manually create entries in Convex dashboard:
// 1. Create geoLocale entries (locations with coordinates)
// 2. Create facilityBoxes entries (UI sections linked to geoLocales)
// 3. Create facilityVariables entries (attributes within boxes)

import fs from "node:fs";
import path from "node:path";
import { facilityDatabase } from "../lib/facilityData";
import type { FacilityData, FacilityVariable } from "../types/facilities";

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

const repoRoot = path.resolve(__dirname, "..");
const outDir = path.join(repoRoot, "scripts");
const outFile = path.join(outDir, "seedFacilities.json");

const asString = (value: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number") return value.toString();
  return undefined;
};

type VariableCandidate = FacilityVariable & {
  text?: unknown;
  content?: unknown;
  data?: unknown;
};

const normalize = (value: unknown): string =>
  (value ?? "")
    .toString()
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase();

const extractText = (variables: VariableCandidate[], ...keys: string[]): string | undefined => {
  const normalizedKeys = keys.map((key) => normalize(key));

  for (const variable of variables) {
    const composite = normalize(variable.key ?? variable.label);
    if (!normalizedKeys.some((key) => composite.includes(key))) continue;

    const candidate =
      variable.value ??
      variable.text ??
      variable.content ??
      variable.data;

    const result = asString(candidate);
    if (result) return result;
  }

  return undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const items = value.filter((item): item is string => typeof item === "string");
  return items.length > 0 ? items : undefined;
};

// DJB2 hash -> uint32
const hash32 = (str: string): number => {
  let hash = 5381 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
};

// Map [0,1] into Puerto Rico bounding box (shrunk a bit to avoid edges)
const PR_BOUNDS = {
  latMin: 17.95,
  latMax: 18.52,
  lngMin: -67.25,
  lngMax: -65.3,
};

const dummyCoords = (seed: string) => {
  const hLat = hash32(seed);
  const hLng = hash32(`${seed}|lng`);
  const uLat = hLat / 0xffffffff;
  const uLng = hLng / 0xffffffff;
  const lat = PR_BOUNDS.latMin + uLat * (PR_BOUNDS.latMax - PR_BOUNDS.latMin);
  const lng = PR_BOUNDS.lngMin + uLng * (PR_BOUNDS.lngMax - PR_BOUNDS.lngMin);
  return {
    lat: Math.round(lat * 1e5) / 1e5,
    lng: Math.round(lng * 1e5) / 1e5,
  };
};

async function main() {
  const facilities: Array<[string, FacilityData]> = Object.entries(facilityDatabase);

  if (facilities.length === 0) {
    console.error("ERROR: facilityDatabase export is empty.");
    process.exit(1);
  }

  const output: FacilityOut[] = [];
  let dummyCount = 0;

  for (const [id, record] of facilities) {
    const recordExtras = record as FacilityData & Record<string, unknown>;
    const externalId = id;
    const nameCandidate = asString(recordExtras.title) ?? asString(recordExtras.name) ?? id;
    const category = asString(recordExtras.type) ?? asString(recordExtras.category);
    const tags = toStringArray(recordExtras.tags);

    const boxes = Array.isArray(record.boxes) ? record.boxes : [];
    const variables = boxes.flatMap<VariableCandidate>((box) =>
      Array.isArray(box.variables) ? box.variables.map((variable) => ({ ...variable })) : []
    );

    const name = nameCandidate ?? extractText(variables, "name", "official name") ?? id;
    const address = extractText(variables, "address", "direccion", "location");
    const phone = extractText(variables, "phone", "telefono");
    const website = extractText(variables, "website", "site", "url");
    const description = extractText(variables, "description", "notes", "desc", "info");

    const { lat, lng } = dummyCoords(externalId || name);
    dummyCount += 1;

    output.push({
      externalId,
      name,
      lat,
      lng,
      category,
      address,
      phone,
      website,
      description,
      tags,
    });
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf8");
  console.log(`Wrote ${output.length} facilities to ${outFile}`);
  console.log(`Used dummy Puerto Rico coordinates for ${dummyCount} facilities`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});


