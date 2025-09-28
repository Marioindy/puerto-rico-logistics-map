// app/rfimap/rfimap.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api"; // ⬅️ relative fallback (no @ alias)
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const RfiMap = dynamic(() => import("@/components/RfiMap"), { ssr: false });

export default function RfiMapPage() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string | undefined>(undefined);

  const facilities = useQuery(api.facilities.list, { category, search }) ?? [];

  const markers = useMemo(
    () =>
      facilities.map((f) => ({
        id: f._id,
        name: f.name,
        position: { lat: f.lat, lng: f.lng },
        category: f.category,
        address: f.address,
        phone: f.phone,
        website: f.website,
        description: f.description,
        tags: f.tags,
      })),
    [facilities]
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search name or address"
          onChange={(e) => setSearch(e.target.value || undefined)}
        />
        <select
          className="border rounded px-3 py-2"
          onChange={(e) => setCategory(e.target.value || undefined)}
          defaultValue=""
        >
          <option value="">All categories</option>
          <option value="port">Port</option>
          <option value="airport">Airport</option>
          <option value="warehouse">Warehouse</option>
        </select>
      </div>

      <RfiMap markers={markers} />
    </div>
  );
}
//