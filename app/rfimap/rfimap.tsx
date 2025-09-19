"use client";

// RFI Map Page - Interactive map dashboard for tracking logistics facilities
// Features: facility filtering, search, detailed info panels, and interactive map

import { useMemo, useState, Suspense, useEffect } from "react";
import InteractiveMap from "@/components/InteractiveMap";
import MapFilterPanel from "@/app/rfimap/components/MapFilterPanel";
import FacilityInfoPanel from "@/app/rfimap/components/FacilityInfoPanel";
import ChatbotFab from "@/components/ChatbotFab";
import { getMapMarkers } from "@/lib/content/loaders";
import type { MapFilterStateZ, SelectedPinZ } from "@/lib/content/schema";
import { Search } from "lucide-react";

const RFIHomePage =  () => {
  // Search state for filtering facilities by name/type
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state for type/facility toggles (validated with Zod)
  const [filterState, setFilterState] = useState<MapFilterStateZ>({ types: {}, ids: {} });

  // Currently selected facility pin for info panel
  const [selectedPin, setSelectedPin] = useState<SelectedPinZ | null>(null);

  // All facility markers loaded from validated data source
  const [allMarkers, setAllMarkers] = useState<SelectedPinZ[]>([]);

  // Loading state for async data fetching
  const [loading, setLoading] = useState(true);

  // Load and validate facility markers from Zod-validated data source
  useEffect(() => {
    const loadMarkers = async () => {
      try {
        // Fetch markers with built-in Zod validation
        const markers = await getMapMarkers();
        setAllMarkers(markers);
      } catch (error) {
        console.error('Failed to load markers:', error);
        setAllMarkers([]);
      } finally {
        setLoading(false);
      }
    };
    loadMarkers();
  }, []);

  // Filter markers based on search term, type filters, and individual facility filters
  const filteredMarkers = useMemo(() => {
    // Extract active type filters (airport, port, warehouse, facility)
    const activeTypes = Object.entries(filterState.types)
      .filter(([, v]) => v)
      .map(([k]) => k);

    // Extract active individual facility IDs
    const activeIds = new Set(
      Object.entries(filterState.ids)
        .filter(([, v]) => v)
        .map(([k]) => k)
    );

    // Apply all filters: type, ID, and search term
    return allMarkers.filter((m) => {
      // Type filter: if no types selected, show all; otherwise match selected types
      const matchesType = activeTypes.length ? activeTypes.includes(m.type) : true;

      // ID filter: if no IDs selected, show all; otherwise match selected IDs
      const matchesId = activeIds.size ? activeIds.has(m.id) : true;

      // Search filter: match facility title or type (case-insensitive)
      const matchesSearch = searchTerm
        ? m.data?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.type.toLowerCase().includes(searchTerm.toLowerCase())
        : true;

      return matchesType && matchesId && matchesSearch;
    });
  }, [allMarkers, filterState, searchTerm]);

  return (
    <div className="relative min-h-screen bg-white text-[#1b1c16]">
      {/* Dashboard header with search functionality */}
      <header className="border-b border-[#e3dcc9] bg-white px-6 py-4">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          {/* Page title and breadcrumb */}
          <div>
            <p className="text-xs uppercase tracking-widest text-[#4b5a2a]">Dashboard</p>
            <h1 className="text-xl font-semibold">RFI Map — Tracking</h1>
          </div>

          {/* Desktop search input (hidden on mobile) */}
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

      {/* Main map container with overlay panels */}
      <div className="relative h-[calc(100vh-5.5rem)]">
        {/* Interactive map with loading states */}
        <Suspense fallback={<div className="flex h-full items-center justify-center text-[#6f705f]">Loading map…</div>}>
          {loading ? (
            <div className="flex h-full items-center justify-center text-[#6f705f]">Loading facilities…</div>
          ) : (
            <InteractiveMap markers={filteredMarkers} onMarkerClick={setSelectedPin} />
          )}
        </Suspense>

        {/* Desktop filter panel (left side, collapsible) */}
        <div className="hidden lg:block">
          <MapFilterPanel markers={allMarkers} value={filterState} onChange={setFilterState} initiallyOpen={true} />
        </div>

        {/* Mobile controls panel (bottom overlay) */}
        <div className="absolute bottom-4 left-1/2 z-40 w-[92%] max-w-2xl -translate-x-1/2 rounded-xl border border-[#e3dcc9] bg-white/95 p-3 shadow-md backdrop-blur lg:hidden">
          {/* Mobile search input */}
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

          {/* Mobile filter panel (initially collapsed) */}
          <MapFilterPanel markers={allMarkers} value={filterState} onChange={setFilterState} initiallyOpen={false} />

          {/* Results counter */}
          <p className="mt-3 text-center text-xs text-[#6f705f]">
            Showing {filteredMarkers.length} of {allMarkers.length} facilities
          </p>
        </div>

        {/* Desktop facility info panel (right side) */}
        <aside className="absolute right-6 top-24 z-40 hidden w-96 max-h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-[#e3dcc9] bg-white shadow-md lg:block">
          <FacilityInfoPanel selectedPin={selectedPin} onClose={() => setSelectedPin(null)} isVisible={true} />
        </aside>

        {/* Floating chatbot button */}
        <ChatbotFab />
      </div>
    </div>
  );
};

export default RFIHomePage;














