"use client";

import { useMemo, useState, Suspense } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import MapFilterPanel, { MapFilterState } from "@/components/MapFilterPanel";
import FacilityInfoPanel from "@/components/FacilityInfoPanel";
import ChatbotFab from "@/components/ChatbotFab";
import { getAllMarkers } from "@/lib/facilityData";
import type { SelectedPin } from "@/types/facilities";
import { Search } from "lucide-react";

const TrackingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState<MapFilterState>({ types: {}, ids: {} });
  const [selectedPin, setSelectedPin] = useState<SelectedPin | null>(null);

  const allMarkers = getAllMarkers();

  const filteredMarkers = useMemo(() => {
    const activeTypes = Object.entries(filterState.types)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const activeIds = new Set(
      Object.entries(filterState.ids)
        .filter(([, v]) => v)
        .map(([k]) => k)
    );

    return allMarkers.filter((m) => {
      const matchesType = activeTypes.length ? activeTypes.includes(m.type) : true;
      const matchesId = activeIds.size ? activeIds.has(m.id) : true;
      const matchesSearch = searchTerm
        ? m.data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.type.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesType && matchesId && matchesSearch;
    });
  }, [allMarkers, filterState, searchTerm]);

  return (
    <div className="relative min-h-screen bg-white text-[#1b1c16]">
      {/* Top bar */}
      <header className="border-b border-[#e3dcc9] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4b5a2a]">Dashboard</p>
            <h1 className="text-xl font-semibold">RFI Map — Tracking</h1>
          </div>
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a7a38f]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search facilities..."
              className="w-72 rounded-md border border-[#d7d1c3] bg-white px-9 py-2 text-sm text-[#1b1c16] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4b5a2a]"
            />
          </div>
        </div>
      </header>

      {/* Map canvas */}
      <div className="relative h-[calc(100vh-5.5rem)]">
        <Suspense fallback={<div className="flex h-full items-center justify-center text-[#6f705f]">Loading map…</div>}>
          <InteractiveMap onMarkerClick={setSelectedPin} />
        </Suspense>

        {/* Filters (collapsible) */}
        <div className="hidden lg:block">
          <MapFilterPanel markers={allMarkers} value={filterState} onChange={setFilterState} initiallyOpen={true} />
        </div>

        {/* Mobile controls */}
        <div className="absolute bottom-4 left-1/2 z-40 w-[92%] max-w-2xl -translate-x-1/2 rounded-xl border border-[#e3dcc9] bg-white/95 p-3 shadow-md backdrop-blur lg:hidden">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-[#a7a38f]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search facilities..."
              className="w-full rounded-md border border-[#d7d1c3] bg-white px-3 py-2 text-sm text-[#1b1c16] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4b5a2a]"
            />
          </div>
          <MapFilterPanel markers={allMarkers} value={filterState} onChange={setFilterState} initiallyOpen={false} />
          <p className="mt-3 text-center text-xs text-[#6f705f]">
            Showing {filteredMarkers.length} of {allMarkers.length} facilities
          </p>
        </div>

        {/* Info panel (desktop) */}
        <aside className="absolute right-6 top-24 z-40 hidden w-96 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#e3dcc9] bg-white shadow-md lg:block">
          <FacilityInfoPanel selectedPin={selectedPin} onClose={() => setSelectedPin(null)} isVisible={true} />
        </aside>
      </div>
    </div>
  );
};

export default TrackingPage;



